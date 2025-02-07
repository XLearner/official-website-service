import utils from "../utils/index.js";

const TABLE_NAME = "track";

async function getFromDb(ctx) {
  const id = ctx.query.id;
  let updateSt = "";
  if (id) {
    updateSt = `SELECT * from zh_office_website.${TABLE_NAME} where id='${id}';`;
  } else {
    updateSt = `SELECT * from zh_office_website.${TABLE_NAME};`;
  }

  const res = await utils.execGetRes(updateSt);

  if (res.length > 0) {
    return [res.length, res];
  } else {
    return [0, null];
  }
}

async function Search(ctx) {
  const res = await getFromDb(ctx);
  if (res[0] > 0) {
    ctx.body = utils.jsonback(0, res[1], "");
  } else {
    ctx.body = utils.jsonback(0, null, "");
  }
}

async function addToDb(ctx) {
  const { id, state, origin, destination, updateTime, ps } = ctx.request.body;

  if (!id || !destination || !updateTime) {
    return [-1, "参数不全"];
  }

  const keys = ["id", "state", "origin", "destination", "updateTime", "ps"];
  const values = [id, state, origin, destination, updateTime, ps]
    .map((ele) => `"${ele}"`)
    .join(",");
  const updateSt = `insert into ${TABLE_NAME}(${keys}) values(${values})`;
  try {
    const res = await utils.execGetRes(updateSt);

    if (res.affectedRows > 0) {
      // ctx.body = utils.jsonback(0, "success", "更新1条数据");
      return [1, "更新1条数据"];
    } else {
      // ctx.body = utils.jsonback(0, null, "无更新");
      return [0, "无更新"];
    }
  } catch (error) {
    // ctx.body = utils.jsonback(-10000, error.toString(), "插入有误");
    return [-10001, error.toString() + "- 插入有误"];
  }
}

async function Add(ctx) {
  const res = await addToDb(ctx);

  if (res[0] > 0) {
    ctx.body = utils.jsonback(res[0], "success", res[1]);
  } else if (res[0] == 0) {
    ctx.body = utils.jsonback(res[0], null, res[1]);
  } else {
    ctx.body = utils.jsonback(res[0], res[1], "插入有误");
  }
}

async function updateToDb(ctx) {
  const body = ctx.request.body;
  if (!body.id) {
    return [-1, "缺少id"];
  }
  if (isNaN(body.state)) {
    return [-2, "state输入有误"];
  }

  const id = body.id;
  const modifyParams = {
    history: body.history,
    state: body.state,
  };
  const params = utils.toSentence(modifyParams);

  const updateSt = `update ${TABLE_NAME} set ${params} where ${TABLE_NAME}.id='${id}'`;

  const res = await utils.execGetRes(updateSt);

  if (res.changedRows === 1) {
    return [res.changedRows, "数据已更新"];
  } else {
    return [0, "无更新"];
  }
}
async function Update(ctx) {
  const res = await updateToDb(ctx);

  if (res[0] > 0) {
    ctx.body = utils.jsonback(res[0], "success", res[1]);
  } else {
    ctx.body = utils.jsonback(res[0], null, res[1]);
  }
}
async function delFromDb(ctx) {
  const id = ctx.request.body.id;
  if (!id) {
    return [-1, "待删除id为空"];
  }

  const updateSt = `delete from ${TABLE_NAME} where id="${id}"`;

  try {
    const res = await utils.execGetRes(updateSt);

    if (res.affectedRows > 0) {
      return [res.affectedRows, `更新${res.affectedRows}条数据`];
    } else {
      return [res.affectedRows, `无更新`];
    }
  } catch (error) {
    // ctx.body = utils.jsonback(-10000, error.toString(), "删除有误");
    return [-10002, error.toString() + "- 删除有误"];
  }
}
async function Delete(ctx) {
  const res = await delFromDb(ctx);

  if (res[0] > 0) {
    ctx.body = utils.jsonback(res[0], "success", res[1]);
  } else if (res[0] == 0) {
    ctx.body = utils.jsonback(res[0], null, res[1]);
  } else {
    ctx.body = utils.jsonback(res[0], res[1], "删除有误");
  }
}

export default {
  Search,
  Add,
  Update,
  Delete,
  getFromDb,
  addToDb,
  updateToDb,
  delFromDb,
};
