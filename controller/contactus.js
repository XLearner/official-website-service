import utils from "../utils/index.js";

const TABLE_NAME = "contactus";

/**
 * 新增公司基本信息
 * insert into base_info(name, tel, address) values("深圳中瀚物流服务有限公司", "0755-00000", "测试地址");
 */
async function Add(ctx) {
  const { name, tel, email, content } = ctx.request.body;

  if (!name || !tel || !email || !content) {
    ctx.body = utils.jsonback(-1, "", "参数填写不完整");
    return;
  }

  const keys = Object.keys(body);
  const values = Object.values(body)
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

async function GetAll(ctx) {
  const updateSt = `select * from ${TABLE_NAME}`;
  try {
    const res = await utils.execGetRes(updateSt);
    if (res.length > 0) {
      ctx.body = utils.jsonback(0, res, "");
    } else {
      ctx.body = utils.jsonback(0, null, "");
    }
  } catch (error) {
    ctx.body = error;
  }
}

export default {
  Add,
  GetAll,
};
