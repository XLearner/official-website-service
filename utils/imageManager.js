import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import connection from "./mysql.js";
import utils from "./index.js";

const TEMP_DIR = path.resolve("assets/temp");
const PHOTO_DIR = path.resolve("assets/photo");

// ────────────────────────────────
// 1. 压缩
// ────────────────────────────────

async function compress(inputPath, outputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  console.log("[compress] input:", inputPath, "output:", outputPath);

  // 使用流式处理，读入 buffer → 压缩 → 写入，避免同路径读写冲突
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  if (metadata.width > 1920) {
    image.resize(1920);
  }

  let buffer;
  if (ext === ".png") {
    buffer = await image
      .png({ quality: 85, palette: true, compressionLevel: 9 })
      .toBuffer();
  } else {
    buffer = await image
      .jpeg({ quality: 85, progressive: true, mozjpeg: true })
      .toBuffer();
  }

  await fs.writeFile(outputPath, buffer);
  console.log("[compress] done, output size:", buffer.length);
}

// ────────────────────────────────
// 2. 临时→永久 移动
// ────────────────────────────────

async function promoteImage(tempUrl) {
  if (!tempUrl || !tempUrl.startsWith("/temp/")) return tempUrl;

  const filename = path.basename(tempUrl);
  const tempPath = path.join(TEMP_DIR, filename);
  const photoPath = path.join(PHOTO_DIR, filename);

  try {
    await fs.access(tempPath);
    await fs.rename(tempPath, photoPath);
  } catch {
    return tempUrl; // 文件不存在，可能已被清理
  }

  const photoUrl = "/photo/" + filename;
  return photoUrl;
}

// ────────────────────────────────
// 3. 从请求 body 中扫描 temp URL 并 promote
// ────────────────────────────────

async function promoteFromBody(body, entityType, entityId) {
  const urls = collectImageUrls(body);
  const promoted = [];

  // 预计算 photo URL 并记录引用，但不移动文件。
  // 文件移动由 executePromotion 在 DB 更新成功后执行。
  for (const url of urls) {
    if (url.startsWith("/temp/")) {
      const filename = path.basename(url);
      const photoUrl = "/photo/" + filename;
      await recordUsage(photoUrl, entityType, entityId);
      promoted.push({ old: url, new: photoUrl });
    } else if (url.startsWith("/photo/")) {
      await recordUsage(url, entityType, entityId);
    }
  }

  return promoted;
}

async function executePromotion(promoted) {
  for (const p of promoted) {
    try {
      await promoteImage(p.old);
    } catch (e) {
      console.error("[imageManager] promoteImage 失败:", e.message);
      p.new = p.old;
    }
  }
}

// ────────────────────────────────
// 4. 引用追踪
// ────────────────────────────────

async function recordUsage(imageUrl, entityType, entityId) {
  const sql = `INSERT INTO image_usage(imageUrl, entityType, entityId)
    VALUES("${imageUrl}", "${entityType}", "${entityId}")
    ON DUPLICATE KEY UPDATE createdAt=CURRENT_TIMESTAMP`;
  try {
    await utils.execGetRes(sql);
  } catch (e) {
    console.error("[imageManager] recordUsage 失败:", e.message, "sql:", sql);
  }
}

async function removeUsage(entityType, entityId) {
  const sql = `DELETE FROM image_usage WHERE entityType="${entityType}" AND entityId="${entityId}"`;
  return utils.execGetRes(sql);
}

// ────────────────────────────────
// 5. 定时清理
// ────────────────────────────────

async function cleanupTemp(maxAgeMs = 24 * 60 * 60 * 1000) {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();

    for (const file of files) {
      if (file === ".gitkeep") continue;
      const filePath = path.join(TEMP_DIR, file);
      const stat = await fs.stat(filePath);
      if (now - stat.mtimeMs > maxAgeMs) {
        await fs.unlink(filePath);
        console.log("[imageManager] 清理过期 temp 文件:", file);
      }
    }
  } catch (e) {
    console.error("[imageManager] temp 清理失败:", e.message);
  }
}

async function cleanupOrphans(minAgeMs = 60 * 60 * 1000) {
  try {
    const sql = `SELECT DISTINCT imageUrl FROM image_usage`;
    const refs = await utils.execGetRes(sql);

    if (refs.length === 0) {
      console.log(
        "[imageManager] image_usage 为空，跳过 orphan 清理（保护历史文件）",
      );
      return;
    }

    const refUrls = new Set(refs.map((r) => r.imageUrl));
    const now = Date.now();

    const files = await fs.readdir(PHOTO_DIR);
    let deleted = 0;

    for (const file of files) {
      const filePath = path.join(PHOTO_DIR, file);
      const url = "/photo/" + file;

      if (refUrls.has(url)) continue;

      // 安全机制：仅删除存在超过 minAgeMs 的文件，保护刚被 promote 的图片
      try {
        const stat = await fs.stat(filePath);
        if (now - stat.mtimeMs < minAgeMs) {
          console.log("[imageManager] 跳过清理新文件:", file);
          continue;
        }
      } catch {
        continue;
      }

      await fs.unlink(filePath);
      deleted++;
      console.log("[imageManager] 清理孤立图片:", file);
    }

    if (deleted > 0) {
      console.log(`[imageManager] 清理完成: ${deleted} 个孤立文件`);
    }
  } catch (e) {
    console.error("[imageManager] orphan 清理失败:", e.message);
  }
}

function startScheduler() {
  // 每小时清理 temp 过期文件
  setInterval(
    () => {
      cleanupTemp();
    },
    60 * 60 * 1000,
  );

  // 每天凌晨清理孤立文件
  const msToMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight - now;
  };

  setTimeout(() => {
    cleanupOrphans();
    setInterval(cleanupOrphans, 24 * 60 * 60 * 1000);
  }, msToMidnight());

  console.log("[imageManager] 定时清理已启动 (temp: 每小时, orphan: 每天)");
}

// ────────────────────────────────
// 6. 辅助函数
// ────────────────────────────────

function collectImageUrls(obj, urls = []) {
  if (!obj || typeof obj !== "object") return urls;

  for (const val of Object.values(obj)) {
    if (typeof val === "string" && val.match(/^\/(temp|photo)\//)) {
      urls.push(val);
    } else if (typeof val === "object" && val !== null) {
      collectImageUrls(val, urls);
    }
  }
  return urls;
}

export default {
  compress,
  promoteImage,
  promoteFromBody,
  executePromotion,
  recordUsage,
  removeUsage,
  cleanupTemp,
  cleanupOrphans,
  startScheduler,
  TEMP_DIR,
  PHOTO_DIR,
};
