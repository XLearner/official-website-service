import utils, { baseUrl } from "../utils/index.js";
import { Logger } from "../utils/logger.js";
import imageManager from "../utils/imageManager.js";

const TABLE_NAME1 = "banner";

/**
 * 保存轮播图片
 */
async function Add(ctx) {
  const { title, description, imgurl } = ctx.request.body;

  if (!title || !description || !imgurl) {
    ctx.body = utils.jsonback(-1, null, "参数填写不完整");
    return;
  }
  const date = utils.getCurrentTime();
  const updateSt = `insert into ${TABLE_NAME1}(imgurl, title, description, date) values("${imgurl}", "${title}", "${description}", "${date}")`;
  try {
    const res = await utils.execGetRes(updateSt);
    if (res.affectedRows > 0) {
      const entityId = String(res.insertId);
      const promoted = await imageManager.promoteFromBody(ctx.request.body, TABLE_NAME1, entityId);
      if (promoted.length > 0) {
        const updates = {};
        for (const p of promoted) {
          if (p.old === ctx.request.body.imgurl) updates.imgurl = p.new;
        }
        if (Object.keys(updates).length > 0) {
          const setClause = utils.toSentence(updates);
          await utils.execGetRes(`update ${TABLE_NAME1} set ${setClause} where id=${entityId}`);
        }
      }
      await imageManager.executePromotion(promoted);
      ctx.body = utils.jsonback(0, "", "成功添加banner");
    } else {
      ctx.body = utils.jsonback(0, "", "添加banner失败");
    }
  } catch (error) {
    Logger(error);
  }
}

/**
 * 获取轮播图片
 */
async function Get(ctx) {
  const updateSt = `select * from ${TABLE_NAME1}`;
  try {
    const res = await utils.execGetRes(updateSt);

    if (res.length > 0) {
      const imgList = res.map((ele) => ({
        ...ele,
        baseUrl,
      }));

      ctx.body = utils.jsonback(0, imgList);
    } else {
      ctx.body = utils.jsonback(0, []);
    }
  } catch (error) {
    Logger(error);
  }
}

async function Delete(ctx) {
  const id = ctx.request.body.id;
  if (!id) {
    ctx.body = utils.jsonback(-1, "", "待删除banner id为空");
    return;
  }

  const updateSt = `delete from ${TABLE_NAME1} where id="${id}"`;

  try {
    const res = await utils.execGetRes(updateSt);
    if (res.affectedRows > 0) {
      await imageManager.removeUsage(TABLE_NAME1, String(id));
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
  Add,
  Get,
  Delete,
};
