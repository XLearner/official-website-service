import { createHash } from "crypto";
import utils from "../utils/index.js";
import baseInfoControl from "./baseinfo.js";
import bannerControl from "./banner.js";
import businessControl from "./business.js";
import contactusControl from "./contactus.js";
import customControl from "./custom.js";
import imageControl from "./image.js";
import advantageControl from "./advantage.js";
import relativeServiceControl from "./relativeService.js";
import newsControl from "./news.js";
import recruitControl from "./recruit.js";

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

export default {
  Check,
  Login,
  Logout,
  advantageControl,
  baseInfoControl,
  bannerControl,
  businessControl,
  contactusControl,
  customControl,
  imageControl,
  newsControl,
  recruitControl,
  relativeServiceControl,
};
