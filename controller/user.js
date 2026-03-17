import utils from "../utils/index.js";

const TABLE_NAME = "account";

async function Search(ctx) {
  const id = ctx.query.id;
  let updateSt = "";
  if (id) {
    updateSt = `SELECT id, account, date, permission, ps from zh_office_website.${TABLE_NAME} where id='${id}';`;
  } else {
    updateSt = `SELECT id, account, date, permission, ps from zh_office_website.${TABLE_NAME};`;
  }

  const res = await utils.execGetRes(updateSt);

  if (res.length > 0) {
    ctx.body = utils.jsonback(0, res, "");
  } else {
    ctx.body = utils.jsonback(0, null, "");
  }
}

async function Add(ctx) {
  const { account, permission, pwd, ps } = ctx.request.body;

  if (!account || !permission || !pwd) {
    ctx.body = utils.jsonback(-1, "", "参数不全");
    return;
  }

  const keys = ["account", "permission", "pwd", "ps", "date"];
  const date = new Date().getTime();
  const values = [account, permission, pwd, ps, date]
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

  const id = body.id;
  const modifyParams = {
    permission: body.permission,
    ps: body.ps,
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
