import utils, { baseUrl } from "../utils/index.js";
import imageManager from "../utils/imageManager.js";

const TABLE_NAME = "goods";

async function Search(ctx) {
  const orderId = ctx.query.orderId;
  let updateSt = "";
  if (orderId) {
    updateSt = `SELECT * from zh_office_website.${TABLE_NAME} where orderId='${orderId}';`;
  } else {
    updateSt = `SELECT * from zh_office_website.${TABLE_NAME};`;
  }

  const res = await utils.execGetRes(updateSt);

  if (res.length > 0) {
    const data = res.map((item) => ({
      ...item,
      baseUrl,
    }));
    ctx.body = utils.jsonback(0, data, "");
  } else {
    ctx.body = utils.jsonback(0, [], "");
  }
}

async function Add(ctx) {
  const {
    orderId,
    name,
    number,
    length,
    width,
    height,
    realWeight,
    weight,
    ifCustoms,
    ps,
    inPic,
    outPic,
    signPic,
  } = ctx.request.body;

  if (
    !orderId ||
    !name ||
    realWeight === undefined ||
    weight === undefined ||
    !ifCustoms
  ) {
    ctx.body = utils.jsonback(
      -1,
      "",
      "参数不全: orderId, name, realWeight, weight, ifCustoms 为必填",
    );
    return;
  }

  const keys = [
    "orderId",
    "name",
    "number",
    "length",
    "width",
    "height",
    "realWeight",
    "weight",
    "ifCustoms",
    "ps",
    "inPic",
    "outPic",
    "signPic",
  ];
  const vals = [
    orderId,
    name,
    number,
    length,
    width,
    height,
    realWeight,
    weight,
    ifCustoms,
    ps,
    inPic,
    outPic,
    signPic,
  ]
    .map((ele) => (ele !== undefined && ele !== null ? `"${ele}"` : "null"))
    .join(",");
  const updateSt = `insert into ${TABLE_NAME}(${keys}) values(${vals})`;

  try {
    const res = await utils.execGetRes(updateSt);

    if (res.affectedRows > 0) {
      // 自动 promote temp 图片并记录引用
      const entityId = String(res.insertId);
      const promoted = await imageManager.promoteFromBody(
        ctx.request.body,
        "goods",
        entityId,
      );
      // 将 promote 后的新 URL 回写到 DB（如果路径有变化）
      if (promoted.length > 0) {
        const updates = {};
        for (const p of promoted) {
          if (p.old === ctx.request.body.inPic) updates.inPic = p.new;
          if (p.old === ctx.request.body.outPic) updates.outPic = p.new;
        }
        if (Object.keys(updates).length > 0) {
          const setClause = utils.toSentence(updates);
          await utils.execGetRes(
            `update ${TABLE_NAME} set ${setClause} where id=${entityId}`,
          );
        }
      }
      ctx.body = utils.jsonback(0, { id: entityId }, "更新1条数据");
    } else {
      ctx.body = utils.jsonback(0, null, "无更新");
    }
  } catch (error) {
    ctx.body = utils.jsonback(-10000, error.toString(), "插入有误");
  }
}

async function Update(ctx) {
  const body = ctx.request.body;
  if (!body.id) {
    ctx.body = utils.jsonback(-1, "", "缺少id");
    return;
  }

  const id = body.id;

  // 清除旧引用，扫描新图片并 promote
  await imageManager.removeUsage("goods", String(id));
  const promoted = await imageManager.promoteFromBody(
    body,
    "goods",
    String(id),
  );

  // 如果 temp 图片被 promote 到 photo，更新 body 中的 URL
  for (const p of promoted) {
    if (p.old === body.inPic) body.inPic = p.new;
    if (p.old === body.outPic) body.outPic = p.new;
  }

  delete body.id;
  const params = utils.toSentence(body);

  const updateSt = `update ${TABLE_NAME} set ${params} where ${TABLE_NAME}.id=${id}`;

  const res = await utils.execGetRes(updateSt);

  if (res.changedRows === 1) {
    ctx.body = utils.jsonback(0, "success", "更新1条数据");
  } else {
    ctx.body = utils.jsonback(0, null, "无更新");
  }
}

async function Delete(ctx) {
  const id = ctx.request.body.id;
  if (!id) {
    ctx.body = utils.jsonback(-1, "", "待删除id为空");
    return;
  }

  const updateSt = `delete from ${TABLE_NAME} where id="${id}"`;

  try {
    const res = await utils.execGetRes(updateSt);

    if (res.affectedRows > 0) {
      // 清除图片引用
      await imageManager.removeUsage("goods", String(id));
      ctx.body = utils.jsonback(0, "success", "更新1条数据");
    } else {
      ctx.body = utils.jsonback(0, null, "无更新");
    }
  } catch (error) {
    ctx.body = utils.jsonback(-10000, error.toString(), "删除有误");
  }
}

async function delByOrderId(orderId) {
  // 先查出这批货物的 id，清除图片引用
  const goodsList = await utils.execGetRes(
    `SELECT id FROM ${TABLE_NAME} WHERE orderId="${orderId}"`,
  );
  for (const g of goodsList) {
    await imageManager.removeUsage("goods", String(g.id));
  }

  const updateSt = `delete from ${TABLE_NAME} where orderId="${orderId}"`;
  try {
    const res = await utils.execGetRes(updateSt);
    return [res.affectedRows, `删除${res.affectedRows}条货物数据`];
  } catch (error) {
    return [-1, error.toString()];
  }
}

export default {
  Search,
  Add,
  Update,
  Delete,
  delByOrderId,
};
