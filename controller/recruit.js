import mysql from "mysql";
import utils from "../utils/index.js";
import connection from "../utils/mysql.js";

const TABLE_NAME = "recruit";

async function Search(ctx) {
  const updateSt = `SELECT * from zh_office_website.${TABLE_NAME};`;
  const pro = utils.execQuery(connection, updateSt);

  const res = await pro;

  if (res.length > 0) {
    ctx.body = utils.jsonback(0, res, "");
  } else {
    ctx.body = utils.jsonback(0, null, "");
  }
}

async function Add(ctx) {
  const { name, jobDesc, requirement } = ctx.request.body;

  if (!name || !jobDesc || !requirement) {
    ctx.body = utils.jsonback(-1, "", "参数不全");
    return;
  }

  const keys = ["name", "jobDesc", "requirement", "date"];
  const now = new Date();
  const date = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`;
  const values = [name, jobDesc, requirement]
    .map((ele) => `"${ele}"`)
    .join(",");
  const updateSt = `insert into ${TABLE_NAME}(${keys}) values(${values}, ${date})`;

  const pro = utils.execQuery(connection, updateSt);

  try {
    const res = await pro;

    // @ts-ignore
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
  const now = new Date();
  body.date = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`;
  const params = utils.toSentence(body);

  const updateSt = `update ${TABLE_NAME} set ${params} where ${TABLE_NAME}.id=${id}`;

  const pro = utils.execQuery(connection, updateSt);

  const res = await pro;

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

  const pro = utils.execQuery(connection, updateSt);

  try {
    const res = await pro;

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
