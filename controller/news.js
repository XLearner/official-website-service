import utils, { baseUrl } from "../utils/index.js";

const TABLE_NAME = "news";

async function Search(ctx) {
  const updateSt = `SELECT * from zh_office_website.${TABLE_NAME};`;
  const res = await utils.execGetRes(updateSt);

  if (res.length > 0) {
    const imgList = res.map((ele) => ({
      ...ele,
      outImg: `${baseUrl}${ele.outImg}`,
    }));
    ctx.body = utils.jsonback(0, imgList, "");
  } else {
    ctx.body = utils.jsonback(0, null, "");
  }
}

/**
 *
 * @param {Object} ctx [
 *    {
 *      title: string;
 *      time: string;
 *      outImg: string;
 *      content: string;
 *    }
 * ]
 * @returns
 */
async function Add(ctx) {
  const { title, time, outImg, content } = ctx.request.body;

  if (utils.isEmpty([title, time, outImg, content])) {
    ctx.body = utils.jsonback(-1, "", "参数不全");
    return;
  }
  const date = utils.getCurrentTime();
  const keys = ["title", "time", "outImg", "content", "date"];
  const values = [title, time, outImg, content, date]
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

export default {
  Search,
  Add,
  Update,
  Delete,
};
