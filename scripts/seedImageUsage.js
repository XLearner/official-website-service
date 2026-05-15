/**
 * 一键种子里脚本：扫描现有 DB 中的图片引用，写入 image_usage 表
 * 用法: node seedImageUsage.js
 */
import mysql from "mysql2/promise";
import { localhost } from "../utils/config.js";

const conn = await mysql.createConnection({
  host: localhost[0],
  user: "root",
  password: localhost[1],
  database: "zh_office_website",
});

const scanners = [
  {
    table: "goods",
    entityType: "goods",
    idField: "id",
    urlFields: ["inPic", "outPic"],
  },
  // 后续有新增图片字段的表在此追加
];

let total = 0;

for (const scan of scanners) {
  const [rows] = await conn.execute(`SELECT * FROM ${scan.table}`);
  for (const row of rows) {
    for (const field of scan.urlFields) {
      const url = row[field];
      if (url && (url.startsWith("/photo/") || url.startsWith("/temp/"))) {
        await conn.execute(
          `INSERT IGNORE INTO image_usage(imageUrl, entityType, entityId)
           VALUES(?, ?, ?)`,
          [url, scan.entityType, String(row[scan.idField])]
        );
        total++;
      }
    }
  }
}

console.log(`已迁移 ${total} 条图片引用记录`);
await conn.end();
