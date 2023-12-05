import { createHash } from "crypto";
import utils, { baseUrl } from "../utils/index.js";
import bannerControl from "./banner.js";
import businessControl from "./business.js";
import customControl from "./custom.js";
import advantageControl from "./advantage.js";
import relativeServiceControl from "./relativeService.js";
import newsControl from "./news.js";
import recruitControl from "./recruit.js";

const TABLE_NAME = "base_info";

async function Check(ctx) {
  const token = ctx.headers.zhtoken;
  if (!token) {
    ctx.body = utils.jsonback(-1, "", "未登录");
    return;
  }
  if (await ifLogin(token)) {
    ctx.body = utils.jsonback(0, "", "已登录");
  } else {
    ctx.body = utils.jsonback(-1, "", "未登录");
  }
}

async function Login(ctx) {
  const { account, pwd } = ctx.request.body;
  const header = ctx.request.header;

  // 检查账密是否正确
  const updateSt = `select pwd from account where account="${account}";`;
  const res = await utils.execGetRes(updateSt);
  if (res[0].pwd !== pwd) {
    ctx.body = utils.jsonback(-3, "", "账号密码错误");
    return;
  }

  // 生成 token
  const token = createHash("sha256")
    .update(`${account}=${pwd}=${header["user-agent"]}=${header.host}`)
    .digest("hex");

  if (await ifLogin(token)) {
    const now = (Date.now() / 1000) >> 0;
    const updateSt = `update token set token="${token}",timestamp="${now}" where token.token="${token}"`;
    const res = await utils.execGetRes(updateSt);
    console.log(ctx);
    if (res.affectedRows > 0) {
      ctx.body = utils.jsonback(
        1,
        {
          token,
        },
        "已重新登录"
      );
    }
  } else {
    const date = (Date.now() / 1000) >> 0;
    const updateSt = `insert into token(token, timestamp) values("${token}", "${date}");`;
    const res = await utils.execGetRes(updateSt);
    if (res.affectedRows > 0) {
      ctx.body = utils.jsonback(
        0,
        {
          token,
        },
        "登录成功"
      );
    }
  }
}

/**
 * 判断是否已登录
 */
async function ifLogin(token) {
  const updateSt = `select * from token where token.token="${token}"`;

  const res = await utils.execGetRes(updateSt);

  // 是否已登录
  if (res.length > 0) {
    // 已有登录态
    return true;
  }
  return false;
}

/**
 * 是否登录超时
 */
export async function ifOvertime(token) {
  if (!token) {
    return true;
  } else {
    const updateSt = `select * from token where token.token="${token}"`;
    const res = await utils.execGetRes(updateSt);
    if (res.length > 0) {
      const now = (Date.now() / 1000) >> 0;
      const diff = now - res[0].timestamp;
      if (diff < 6 * 60 * 60) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
}

async function Logout(ctx) {
  const token = ctx.headers.zhtoken;
  const updateSt = `delete from token where token="${token}"`;
  const res = await utils.execGetRes(updateSt);

  if (res.affectedRows > 0) {
    ctx.body = utils.jsonback(0, "", "成功登出");
  } else {
    ctx.body = utils.jsonback(-10002, "", "登出失败");
  }
}

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
      logo: `${baseUrl}${ele.logo}`,
      descImg: `${baseUrl}${ele.descImg}`,
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

  const params = utils.toSentence(body);

  const updateSt = `update ${TABLE_NAME} set ${params} where ${TABLE_NAME}.id="${body.id}"`;

  const res = await utils.execGetRes(updateSt);

  if (res.changedRows === 1) {
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

/**
 * 新增公司基本信息
 * insert into base_info(name, tel, address) values("深圳中瀚物流服务有限公司", "0755-00000", "测试地址");
 */
async function DeleteInfo(ctx, next) {
  const body = ctx.request.body;

  const params = utils.toSentence(body);

  const name = body.name;
  if (!name) {
    ctx.body = utils.jsonback(-1, "", "待删除名字为空");
    return;
  }

  const updateSt = `delete from ${TABLE_NAME} where name="${name}"`;

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
  Check,
  Login,
  Logout,
  Index,
  SetInfo,
  AddInfo,
  DeleteInfo,
  ...bannerControl,
  businessControl,
  customControl,
  advantageControl,
  relativeServiceControl,
  newsControl,
  recruitControl,
};
