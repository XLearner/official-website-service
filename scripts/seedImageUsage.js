/**
 * 一键种子脚本：扫描现有 DB 中的图片引用，写入 image_usage 表
 * 用法: node scripts/seedImageUsage.js
 */
import connection from "../utils/mysql.js";
import utils from "../utils/index.js";

const scanners = [
  {
    table: "goods",
    entityType: "goods",
    idField: "id",
    urlFields: ["inPic", "outPic", "signPic"],
  },
  {
    table: "base_info",
    entityType: "base_info",
    idField: "id",
    urlFields: ["logo", "descImg"],
  },
  {
    table: "advantage",
    entityType: "advantage",
    idField: "id",
    urlFields: ["img"],
  },
  {
    table: "banner",
    entityType: "banner",
    idField: "id",
    urlFields: ["imgurl"],
  },
  {
    table: "cooperation",
    entityType: "cooperation",
    idField: "id",
    urlFields: ["logo"],
  },
  {
    table: "news",
    entityType: "news",
    idField: "id",
    urlFields: ["outImg"],
  },
  {
    table: "relative_service",
    entityType: "relative_service",
    idField: "id",
    urlFields: ["img"],
  },
];

let total = 0;

for (const scan of scanners) {
  const rows = await utils.execGetRes(`SELECT * FROM ${scan.table}`);
  for (const row of rows) {
    for (const field of scan.urlFields) {
      const url = row[field];
      if (url && (url.startsWith("/photo/") || url.startsWith("/temp/"))) {
        await utils.execGetRes(
          `INSERT IGNORE INTO image_usage(imageUrl, entityType, entityId)
           VALUES("${url}", "${scan.entityType}", "${String(row[scan.idField])}")`
        );
        total++;
      }
    }
  }
}

console.log(`已迁移 ${total} 条图片引用记录`);
process.exit(0);
