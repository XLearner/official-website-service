import utils from "../utils/index.js";

const TABLE_NAME = "permission";

/**
 * 查询菜单，并按照结构返回
 */
async function Search(ctx) {
  const name = ctx.query.name; // admin / user
  let updateSt = `SELECT * from zh_office_website.${TABLE_NAME};`;

  try {
    const res = await utils.execGetRes(updateSt);
    if (res.length > 0) {
      ctx.body = utils.jsonback(res.length, handleNav(res, name), "");
    } else {
      ctx.body = utils.jsonback(0, null, "无记录");
    }
  } catch (error) {
    ctx.body = utils.jsonback(-1, error.toString(), "查询错误");
  }
}

function handleNav(list, tag) {
  let result = [];
  let flag = [];
  let checked = [];

  while (list.length > 0) {
    const item = list.pop();
    if (!item.parent) {
      result.push({
        id: item.id,
        label: item.label,
      });
      if (item.class.indexOf(tag) >= 0) {
        checked.push(item.id);
      }
      flag.push(item.id);
    } else {
      const ind = flag.indexOf(item.parent);
      if (ind < 0) {
        list.unshift(item);
        continue;
      }
      if (!(result[ind].children instanceof Array)) {
        result[ind].children = [];
      }
      result[ind].children.push({
        id: item.id,
        label: item.label,
      });
      if (item.class.indexOf(tag) >= 0) {
        checked.push(item.id);
      }
    }
  }

  return {
    treeData: result,
    checked,
  };
}

/**
 * 更新菜单权限情况
 */
async function Set(ctx) {}

export default {
  Search,
  Set,
};
