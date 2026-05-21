import utils, { baseUrl } from "../utils/index.js";
import { Logger } from "../utils/logger.js";
import imageManager from "../utils/imageManager.js";

const TABLE_NAME = "advantage";

async function Search(ctx) {
  const updateSt = `SELECT * from zh_office_website.${TABLE_NAME};`;
  try {
    const res = await utils.execGetRes(updateSt);

    if (res.length > 0) {
      const imgList = res.map((ele) => ({
        ...ele,
        baseUrl,
      }));
      ctx.body = utils.jsonback(0, imgList, "");
    } else {
      ctx.body = utils.jsonback(0, null, "");
    }
  } catch (error) {
    Logger(error);
  }
}

async function Add(ctx) {
  const { img, title, description, ifShow } = ctx.request.body;

  if (!img || !title || !description || !ifShow) {
    ctx.body = utils.jsonback(-1, "", "参数不全");
    return;
  }

  const keys = ["img", "title", "description", "ifShow"];
  const values = [img, title, description, ifShow]
    .map((ele) => `"${ele}"`)
    .join(",");
  const updateSt = `insert into ${TABLE_NAME}(${keys}) values(${values})`;

  try {
    const res = await utils.execGetRes(updateSt);

    if (res.affectedRows > 0) {
      const entityId = String(res.insertId);
      const promoted = await imageManager.promoteFromBody(ctx.request.body, TABLE_NAME, entityId);
      if (promoted.length > 0) {
        const updates = {};
        for (const p of promoted) {
          if (p.old === ctx.request.body.img) updates.img = p.new;
        }
        if (Object.keys(updates).length > 0) {
          const setClause = utils.toSentence(updates);
          await utils.execGetRes(`update ${TABLE_NAME} set ${setClause} where id=${entityId}`);
        }
      }
      await imageManager.executePromotion(promoted);
      ctx.body = utils.jsonback(0, { id: entityId }, "更新1条数据");
    } else {
      ctx.body = utils.jsonback(0, null, "无更新");
    }
  } catch (error) {
    ctx.body = utils.jsonback(-10000, error.toString(), "插入有误");
    Logger(error);
  }
}

async function Update(ctx) {
  const body = ctx.request.body;
  if (!body.id) {
    ctx.body = utils.jsonback(-1, "", "缺少id");
    return;
  }

  const id = body.id;

  await imageManager.removeUsage(TABLE_NAME, String(id));
  const promoted = await imageManager.promoteFromBody(body, TABLE_NAME, String(id));
  for (const p of promoted) {
    if (p.old === body.img) body.img = p.new;
  }

  delete body.id;
  delete body.baseUrl;
  const params = utils.toSentence(body);

  const updateSt = `update ${TABLE_NAME} set ${params} where ${TABLE_NAME}.id=${id}`;
  try {
    const res = await utils.execGetRes(updateSt);

    if (res.changedRows === 1) {
      await imageManager.executePromotion(promoted);
      ctx.body = utils.jsonback(0, "success", "更新1条数据");
    } else {
      ctx.body = utils.jsonback(0, null, "无更新");
    }
  } catch (error) {
    Logger(error);
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
      await imageManager.removeUsage(TABLE_NAME, String(id));
      ctx.body = utils.jsonback(0, "success", "更新1条数据");
    } else {
      ctx.body = utils.jsonback(0, null, "无更新");
    }
  } catch (error) {
    ctx.body = utils.jsonback(-10000, error.toString(), "删除有误");
    Logger(error);
  }
}

export default {
  Search,
  Add,
  Update,
  Delete,
};
