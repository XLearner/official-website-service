import utils from "../utils/index.js";
import imageManager from "../utils/imageManager.js";

const TABLE_NAME = "customer";

// 生成客户编号 C + 年月日 + 3位随机
async function generateCustomerNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const dateStr = `${y}${m}${d}`;

  let no;
  let exists = true;
  while (exists) {
    const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    no = `C${dateStr}${rand}`;
    const res = await utils.execGetRes(
      `SELECT COUNT(*) as cnt FROM ${TABLE_NAME} WHERE customer_no="${no}"`
    );
    exists = res[0].cnt > 0;
  }
  return no;
}

async function Search(ctx) {
  const { keyword, page, pageSize } = ctx.query;
  let where = "";
  if (keyword) {
    where = ` WHERE company_name LIKE "%${keyword}%" OR contact_name LIKE "%${keyword}%" OR customer_no LIKE "%${keyword}%"`;
  }

  // 总数
  const countSql = `SELECT COUNT(*) as total FROM ${TABLE_NAME}${where}`;
  const countRes = await utils.execGetRes(countSql);
  const total = countRes[0].total;

  // 分页
  const p = parseInt(page) || 1;
  const ps = parseInt(pageSize) || 10;
  const offset = (p - 1) * ps;

  let sql = `SELECT * FROM ${TABLE_NAME}${where} ORDER BY id DESC LIMIT ${ps} OFFSET ${offset}`;
  const res = await utils.execGetRes(sql);

  ctx.body = utils.jsonback(0, {
    list: res,
    total,
    page: p,
    pageSize: ps,
  }, "");
}

async function GetById(ctx) {
  const id = ctx.query.id || ctx.query.customer_no;
  if (!id) {
    ctx.body = utils.jsonback(-1, "", "缺少 id 或 customer_no");
    return;
  }

  const sql = `SELECT * FROM ${TABLE_NAME} WHERE id="${id}" OR customer_no="${id}" LIMIT 1`;
  const res = await utils.execGetRes(sql);

  if (res.length > 0) {
    ctx.body = utils.jsonback(0, res[0], "");
  } else {
    ctx.body = utils.jsonback(-1, "", "客户不存在");
  }
}

async function Add(ctx) {
  const body = ctx.request.body;
  const customerNo = await generateCustomerNo();

  const keys = ["customer_no", "company_name", "contact_name", "position", "phone", "email", "address", "license_pic", "card_pic", "remark"];
  const vals = [
    `"${customerNo}"`,
    ...keys.slice(1).map(k => {
      const v = body[k];
      return v !== undefined && v !== null && v !== "" ? `"${v}"` : "null";
    }),
  ];

  const sql = `INSERT INTO ${TABLE_NAME}(${keys.join(",")}) VALUES(${vals.join(",")})`;

  try {
    const res = await utils.execGetRes(sql);
    if (res.affectedRows > 0) {
      const entityId = String(res.insertId);
      const promoted = await imageManager.promoteFromBody(body, "customer", entityId);
      if (promoted.length > 0) {
        const updates = {};
        for (const p of promoted) {
          if (p.old === body.license_pic) updates.license_pic = p.new;
          if (p.old === body.card_pic) updates.card_pic = p.new;
        }
        if (Object.keys(updates).length > 0) {
          const setClause = utils.toSentence(updates);
          await utils.execGetRes(`UPDATE ${TABLE_NAME} SET ${setClause} WHERE id=${entityId}`);
        }
      }
      await imageManager.executePromotion(promoted);
      ctx.body = utils.jsonback(0, { id: entityId, customer_no: customerNo }, "添加成功");
    } else {
      ctx.body = utils.jsonback(0, null, "无更新");
    }
  } catch (error) {
    ctx.body = utils.jsonback(-10000, error.toString(), "添加失败");
  }
}

async function Update(ctx) {
  const body = ctx.request.body;
  const id = body.id;
  if (!id) {
    ctx.body = utils.jsonback(-1, "", "缺少 id");
    return;
  }

  await imageManager.removeUsage("customer", String(id));
  const promoted = await imageManager.promoteFromBody(body, "customer", String(id));
  for (const p of promoted) {
    if (p.old === body.license_pic) body.license_pic = p.new;
    if (p.old === body.card_pic) body.card_pic = p.new;
  }

  delete body.id;
  delete body.create_time;
  delete body.update_time;
  delete body.customer_no;

  const params = utils.toSentence(body);
  const sql = `UPDATE ${TABLE_NAME} SET ${params} WHERE id=${id}`;

  try {
    const res = await utils.execGetRes(sql);
    if (res.changedRows === 1) {
      await imageManager.executePromotion(promoted);
      ctx.body = utils.jsonback(0, "success", "更新成功");
    } else {
      ctx.body = utils.jsonback(0, null, "无更新");
    }
  } catch (error) {
    ctx.body = utils.jsonback(-10000, error.toString(), "更新失败");
  }
}

async function Delete(ctx) {
  const id = ctx.request.body.id;
  if (!id) {
    ctx.body = utils.jsonback(-1, "", "缺少 id");
    return;
  }

  // 检查是否有订单关联（orders 表需有 customer_id 字段才生效）
  try {
    const orderRes = await utils.execGetRes(
      `SELECT COUNT(*) as cnt FROM zh_office_website.orders WHERE customer_id="${id}"`
    );
    if (orderRes[0].cnt > 0) {
      ctx.body = utils.jsonback(-2, "", "该客户有订单关联，请先解除关联关系");
      return;
    }
  } catch (_) {
    // orders 表若无 customer_id 字段，跳过检查
  }

  await imageManager.removeUsage("customer", String(id));
  const sql = `DELETE FROM ${TABLE_NAME} WHERE id="${id}"`;

  try {
    const res = await utils.execGetRes(sql);
    if (res.affectedRows > 0) {
      ctx.body = utils.jsonback(0, "success", "删除成功");
    } else {
      ctx.body = utils.jsonback(-1, "", "客户不存在");
    }
  } catch (error) {
    ctx.body = utils.jsonback(-10000, error.toString(), "删除失败");
  }
}

export default {
  Search,
  GetById,
  Add,
  Update,
  Delete,
};