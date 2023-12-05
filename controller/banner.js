import mysql from "mysql";
import utils, { baseUrl } from "../utils/index.js";
import connection from "../utils/mysql.js";

const TABLE_NAME1 = "img_repo";

/**
 * 上传图片 并返回图片路径和文件名
 */
async function UploadImg(ctx) {
  if (ctx.file) {
    const imgName = ctx.file.filename;
    const imgurl = "/photo/" + ctx.file.filename;
    const type = ctx.request.body.type || "banner";
    const updateSt = `insert into ${TABLE_NAME1}(imgName, path, type) values("${imgName}", "${imgurl}", "${type}")`;

    const pro = utils.execQuery(connection, updateSt);

    const res = await pro;

    // @ts-ignore
    if (res.affectedRows > 0) {
      ctx.body = utils.jsonback(
        0,
        {
          imgName: ctx.file.filename,
          imgurl: imgurl,
        },
        "存储成功"
      );
    } else {
      ctx.body = utils.jsonback(-10000, null, "存储失败");
    }
  }
}

/**
 * 请求数据库获取对应类型的图片
 */
async function getImg(type) {
  const updateSt = `select * from ${TABLE_NAME1} where type="${type}"`;

  const pro = utils.execQuery(connection, updateSt);

  const res = await pro;

  // @ts-ignore
  if (res.length > 0) {
    return res;
  }
  return [];
}

/**
 * 获取图片
 */
async function GetImg(ctx) {
  const type = ctx.request.body.type;
  const imgList = await getImg(type);

  ctx.body = utils.jsonback(0, imgList);
}

/**
 * 保存轮播图片
 */
async function SaveBanner(ctx) {
  const { title, description, imgurl } = ctx.request.body;

  if (!title || !description || !imgurl) {
    ctx.body = utils.jsonback(-1, null, "参数填写不完整");
    return;
  }
  const now = new Date();
  const date = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`;
  const updateSt = `insert into banner(imgurl, title, description, date) values("${imgurl}", "${title}", "${description}", "${date}")`;

  const pro = utils.execQuery(connection, updateSt);

  const res = await pro;
  // @ts-ignore
  if (res.affectedRows > 0) {
    ctx.body = utils.jsonback(0, "", "成功添加banner");
  } else {
    ctx.body = utils.jsonback(0, "", "添加banner失败");
  }
}

/**
 * 获取轮播图片
 */
async function GetBannerImg(ctx) {
  const updateSt = `select * from banner`;
  const pro = utils.execQuery(connection, updateSt);
  const res = await pro;

  if (res.length > 0) {
    const imgList = res.map((ele) => ({
      ...ele,
      imgurl: `${baseUrl}${ele.imgurl}`,
    }));

    ctx.body = utils.jsonback(0, imgList);
  } else {
    ctx.body = utils.jsonback(0, []);
  }
}

async function DeleteBanner(ctx) {
  const id = ctx.request.body.id;
  if (!id) {
    ctx.body = utils.jsonback(-1, "", "待删除banner id为空");
    return;
  }

  const updateSt = `delete from banner where id="${id}"`;

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
  UploadImg,
  GetImg,
  SaveBanner,
  GetBannerImg,
  DeleteBanner,
};
