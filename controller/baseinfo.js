import utils, { baseUrl } from "../utils/index.js";
import imageManager from "../utils/imageManager.js";

const TABLE_NAME = "base_info";

/**
 * 获取公司基本信息
 */
async function Index(ctx) {
  const url = new URL(ctx.request.url, "https://localhost");
  const params = Object.fromEntries(url.searchParams.entries());

  const updateSt = `SELECT * from zh_office_website.${TABLE_NAME} t1 where t1.name like "%${params.name}%"`;
  const res = await utils.execGetRes(updateSt);

  if (res.length > 0) {
    const imgList = res.map((ele) => ({
      ...ele,
      baseUrl,
    }));
    ctx.body = utils.jsonback(0, imgList[0], "");
  } else {
    ctx.body = utils.jsonback(0, null, "");
  }
}

/**
 * 设置公司基本信息
 */
async function SetInfo(ctx, next) {
  const body = ctx.request.body;

  await imageManager.removeUsage(TABLE_NAME, String(body.id));
  const promoted = await imageManager.promoteFromBody(body, TABLE_NAME, String(body.id));
  for (const p of promoted) {
    if (p.old === body.logo) body.logo = p.new;
    if (p.old === body.descImg) body.descImg = p.new;
  }

  delete body.baseUrl;
  const params = utils.toSentence(body);

  const updateSt = `update ${TABLE_NAME} set ${params} where ${TABLE_NAME}.id="${body.id}"`;

  const res = await utils.execGetRes(updateSt);

  if (res.changedRows === 1) {
    await imageManager.executePromotion(promoted);
    ctx.body = utils.jsonback(0, "success", "更新1条数据");
  } else {
    ctx.body = utils.jsonback(0, null, "无更新");
  }
}

/**
 * 新增公司基本信息
 * insert into base_info(name, tel, address) values("深圳中瀚物流服务有限公司", "0755-00000", "测试地址");
 */
async function AddInfo(ctx, next) {
  const body = ctx.request.body;

  const keys = Object.keys(body);
  const values = Object.values(body)
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
          if (p.old === ctx.request.body.logo) updates.logo = p.new;
          if (p.old === ctx.request.body.descImg) updates.descImg = p.new;
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
  }
}

/**
 * 新增公司基本信息
 * insert into base_info(name, tel, address) values("深圳中瀚物流服务有限公司", "0755-00000", "测试地址");
 */
async function DeleteInfo(ctx, next) {
  const body = ctx.request.body;

  const name = body.name;
  if (!name) {
    ctx.body = utils.jsonback(-1, "", "待删除名字为空");
    return;
  }

  // 查询记录 id 以清除图片引用
  const rows = await utils.execGetRes(`SELECT id FROM ${TABLE_NAME} where name="${name}"`);
  const recordId = rows.length > 0 ? String(rows[0].id) : null;

  const updateSt = `delete from ${TABLE_NAME} where name="${name}"`;

  try {
    const res = await utils.execGetRes(updateSt);

    if (res.affectedRows > 0) {
      if (recordId) await imageManager.removeUsage(TABLE_NAME, recordId);
      ctx.body = utils.jsonback(0, "success", "更新1条数据");
    } else {
      ctx.body = utils.jsonback(0, null, "无更新");
    }
  } catch (error) {
    ctx.body = utils.jsonback(-10000, error.toString(), "删除有误");
  }
}

export default {
  Get: Index,
  Set: SetInfo,
  Add: AddInfo,
  Delete: DeleteInfo,
};
