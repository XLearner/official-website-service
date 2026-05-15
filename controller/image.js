import utils from "../utils/index.js";
import imageManager from "../utils/imageManager.js";
import fs from "fs/promises";
import path from "path";

/**
 * 上传图片 → 压缩 → 存入 temp
 */
async function Upload(ctx) {
  if (!ctx.file) {
    ctx.body = utils.jsonback(-1, "", "未选择文件");
    return;
  }

  const tempPath = path.resolve(imageManager.TEMP_DIR, ctx.file.filename);

  try {
    // sharp 压缩（buffer 方式，直接写目标路径）
    await imageManager.compress(ctx.file.path, tempPath);
    // 如果 multer 存的位置和 tempPath 不同，清理 multer 的原始文件
    if (path.resolve(ctx.file.path) !== tempPath) {
      await fs.unlink(ctx.file.path).catch(() => {});
    }

    const imgurl = "/temp/" + ctx.file.filename;
    ctx.body = utils.jsonback(0, { imgurl }, "上传成功");
  } catch (error) {
    console.error("[upload] 压缩失败:", error.message);
    // 如果压缩失败，保留原始文件在 temp 中
    const imgurl = "/temp/" + ctx.file.filename;
    try {
      await fs.rename(ctx.file.path, tempPath);
    } catch {}
    ctx.body = utils.jsonback(0, { imgurl }, "上传成功（未压缩）");
  }
}

/**
 * 获取图片（按类型从 image_usage 中查）
 */
async function GetImg(ctx) {
  const type = ctx.request.body.type;
  if (!type) {
    ctx.body = utils.jsonback(-1, "", "缺少 type 参数");
    return;
  }

  const sql = `SELECT DISTINCT imageUrl FROM image_usage WHERE entityType="${type}"`;
  const res = await utils.execGetRes(sql);

  ctx.body = utils.jsonback(0, res.map((r) => ({ imgurl: r.imageUrl })));
}

/**
 * 手动触发 orphan 清理
 */
async function CleanupOrphans(ctx) {
  await imageManager.cleanupOrphans();
  ctx.body = utils.jsonback(0, "success", "orphan 清理已触发");
}

export default {
  Upload,
  GetImg,
  CleanupOrphans,
};
