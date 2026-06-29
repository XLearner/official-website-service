import utils from "../utils/index.js";

const TABLE_NAME = "account";

async function Search(ctx) {
  const id = ctx.query.id;
  let updateSt = "";
  if (id) {
    updateSt = `SELECT a.id, a.account, a.date, a.permission, a.ps, a.role_id, r.name as role_name, r.role_no as role_no
      FROM zh_office_website.${TABLE_NAME} a
      LEFT JOIN zh_office_website.role r ON a.role_id = r.id
      WHERE a.id='${id}';`;
  } else {
    updateSt = `SELECT a.id, a.account, a.date, a.permission, a.ps, a.role_id, r.name as role_name, r.role_no as role_no
      FROM zh_office_website.${TABLE_NAME} a
      LEFT JOIN zh_office_website.role r ON a.role_id = r.id;`;
  }

  const res = await utils.execGetRes(updateSt);

  if (res.length > 0) {
    ctx.body = utils.jsonback(0, res, "");
  } else {
    ctx.body = utils.jsonback(0, null, "");
  }
}

async function Add(ctx) {
  const { account, permission, pwd, ps, role_id } = ctx.request.body;

  if (!account || !pwd) {
    ctx.body = utils.jsonback(-1, "", "参数不全");
    return;
  }

  const keys = ["account", "permission", "pwd", "ps", "date", "role_id"];
  const date = new Date().getTime();
  const values = [account, permission || "", pwd, ps || "", date, role_id || "NULL"]
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
    permission: body.permission || "",
    ps: body.ps || "",
    role_id: body.role_id || "NULL",
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
