import utils from "../utils/index.js";

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
    ctx.body = utils.jsonback(0, res, "");
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
  } = ctx.request.body;

  if (!orderId || !name || realWeight === undefined || weight === undefined || !ifCustoms) {
    ctx.body = utils.jsonback(-1, "", "参数不全: orderId, name, realWeight, weight, ifCustoms 为必填");
    return;
  }

  const keys = [
    "orderId", "name", "number", "length", "width", "height",
    "realWeight", "weight", "ifCustoms", "ps", "inPic", "outPic",
  ];
  const vals = [orderId, name, number, length, width, height, realWeight, weight, ifCustoms, ps, inPic, outPic]
    .map((ele) => (ele !== undefined && ele !== null ? `"${ele}"` : "null"))
    .join(",");
  const updateSt = `insert into ${TABLE_NAME}(${keys}) values(${vals})`;

  try {
    const res = await utils.execGetRes(updateSt);

    if (res.affectedRows > 0) {
      ctx.body = utils.jsonback(0, "success", "更新1条数据");
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
      ctx.body = utils.jsonback(0, "success", "更新1条数据");
    } else {
      ctx.body = utils.jsonback(0, null, "无更新");
    }
  } catch (error) {
    ctx.body = utils.jsonback(-10000, error.toString(), "删除有误");
  }
}

async function delByOrderId(orderId) {
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
