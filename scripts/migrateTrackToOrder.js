/**
 * 将 track 表的订单数据同步到 orders 表
 * 映射: track.id → orders.orderId, track.state/updateTime/destination/ps/origin 直接对应
 * 用法: node scripts/migrateTrackToOrder.js
 */
import connection from "../utils/mysql.js";
import utils from "../utils/index.js";

const tracks = await utils.execGetRes("SELECT * FROM track");

let inserted = 0;

for (const t of tracks) {
  const exist = await utils.execGetRes(
    `SELECT COUNT(*) as cnt FROM orders WHERE orderId="${t.id}"`
  );
  if (exist[0].cnt > 0) {
    console.log(`跳过已存在: orderId=${t.id}`);
    continue;
  }

  const keys = ["orderId", "state", "origin", "destination", "updateTime", "ps"];
  const vals = [t.id, t.state, t.origin, t.destination, t.updateTime, t.ps]
    .map((v) => (v != null ? `"${String(v).replaceAll('"', '\\"')}"` : "null"))
    .join(",");

  await utils.execGetRes(`INSERT INTO orders(${keys}) VALUES(${vals})`);
  inserted++;
  console.log(`已同步: orderId=${t.id}`);
}

console.log(`\n迁移完成: 共同步 ${inserted} 条，跳过 ${tracks.length - inserted} 条已存在`);
process.exit(0);
