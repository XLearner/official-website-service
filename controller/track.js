import utils from "../utils/index.js";

const TABLE_NAME = "track";

async function Search(ctx) {
  const id = ctx.query.id;
  let updateSt = "";
  if (id) {
    updateSt = `SELECT * from zh_office_website.${TABLE_NAME} where id='${id}';`;
  } else {
    updateSt = `SELECT * from zh_office_website.${TABLE_NAME};`;
  }

  const res = await utils.execGetRes(updateSt);

  if (res.length > 0) {
    ctx.body = utils.jsonback(0, res, "");
  } else {
    ctx.body = utils.jsonback(0, null, "");
  }
}

async function Add(ctx) {
  const { id, state, origin, destination, updateTime, ps } = ctx.request.body;

  if (!id || !destination || !updateTime) {
    ctx.body = utils.jsonback(-1, "", "参数不全");
    return;
  }

  const keys = ["id", "state", "origin", "destination", "updateTime", "ps"];
  const values = [id, state, origin, destination, updateTime, ps]
    .map((ele) => `"${ele}"`)
    .join(",");
  const updateSt = `insert into ${TABLE_NAME}(${keys}) values(${values})`;

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
  if (isNaN(body.state)) {
    ctx.body = utils.jsonback(-1, "", "state输入有误");
    return;
  }

  const id = body.id;
  const modifyParams = {
    history: body.history,
    state: body.state,
  };
  const params = utils.toSentence(modifyParams);

  const updateSt = `update ${TABLE_NAME} set ${params} where ${TABLE_NAME}.id='${id}'`;

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

export default {
  Search,
  Add,
  Update,
  Delete,
};
