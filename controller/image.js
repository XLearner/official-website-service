import utils from "../utils/index.js";

const TABLE_NAME1 = "img_repo";

/**
 * 上传图片 并返回图片路径和文件名
 */
async function Upload(ctx) {
  if (ctx.file) {
    const imgName = ctx.file.filename;
    const imgurl = "/photo/" + ctx.file.filename;
    const type = ctx.request.body.type || "banner";
    const updateSt = `insert into ${TABLE_NAME1}(imgName, path, type) values("${imgName}", "${imgurl}", "${type}")`;
    try {
      const res = await utils.execGetRes(updateSt);

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
    } catch (error) {
      Logger(error);
    }
  }
}

/**
 * 请求数据库获取对应类型的图片
 */
async function getFromDb(type) {
  const updateSt = `select * from ${TABLE_NAME1} where type="${type}"`;
  try {
    const res = await utils.execGetRes(updateSt);

    if (res.length > 0) {
      return res;
    }
    return [];
  } catch (error) {
    Logger(error);
  }
}

/**
 * 获取图片
 */
async function GetImg(ctx) {
  const type = ctx.request.body.type;
  const imgList = await getFromDb(type);

  ctx.body = utils.jsonback(0, imgList);
}

export default {
  Upload,
  getFromDb,
  GetImg,
};
