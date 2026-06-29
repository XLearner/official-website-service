import utils from "../utils/index.js";

// ===================== role 表操作 =====================

const TABLE = "zh_office_website.role";

async function generateRoleNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const dateStr = `${y}${m}${d}`;

  let no;
  let exists = true;
  while (exists) {
    const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    no = `R${dateStr}${rand}`;
    const res = await utils.execGetRes(
      `SELECT COUNT(*) as cnt FROM ${TABLE} WHERE role_no="${no}"`
    );
    exists = res[0].cnt > 0;
  }
  return no;
}

// ===================== 角色 CRUD =====================

async function SearchRoles(ctx) {
  const sql = `SELECT * FROM ${TABLE} ORDER BY id ASC`;
  const res = await utils.execGetRes(sql);
  ctx.body = utils.jsonback(0, res, "");
}

async function AddRole(ctx) {
  const { name, keys, remark } = ctx.request.body;
  if (!name) {
    ctx.body = utils.jsonback(-1, "", "角色名称不能为空");
    return;
  }

  const roleNo = await generateRoleNo();
  const keysStr = Array.isArray(keys) ? JSON.stringify(keys) : (keys || "[]");
  const sql = `INSERT INTO ${TABLE}(role_no, name, \`keys\`, remark) VALUES("${roleNo}", "${name}", '${keysStr}', "${remark || ""}")`;

  try {
    const res = await utils.execGetRes(sql);
    if (res.affectedRows > 0) {
      ctx.body = utils.jsonback(0, { id: res.insertId, role_no: roleNo }, "添加成功");
    } else {
      ctx.body = utils.jsonback(0, null, "无更新");
    }
  } catch (error) {
    ctx.body = utils.jsonback(-10000, error.toString(), "添加失败");
  }
}

async function UpdateRole(ctx) {
  const { id, name, keys, remark } = ctx.request.body;
  if (!id) {
    ctx.body = utils.jsonback(-1, "", "缺少 id");
    return;
  }

  const updates = [];
  if (name !== undefined) updates.push(`name="${name}"`);
  if (keys !== undefined) updates.push(`\`keys\`='${Array.isArray(keys) ? JSON.stringify(keys) : keys}'`);
  if (remark !== undefined) updates.push(`remark="${remark || ""}"`);

  if (updates.length === 0) {
    ctx.body = utils.jsonback(-1, "", "无更新内容");
    return;
  }

  const sql = `UPDATE ${TABLE} SET ${updates.join(",")} WHERE id=${id}`;
  try {
    const res = await utils.execGetRes(sql);
    if (res.changedRows === 1) {
      ctx.body = utils.jsonback(0, "success", "更新成功");
    } else {
      ctx.body = utils.jsonback(0, null, "无更新");
    }
  } catch (error) {
    ctx.body = utils.jsonback(-10000, error.toString(), "更新失败");
  }
}

async function DeleteRole(ctx) {
  const { id } = ctx.request.body;
  if (!id) {
    ctx.body = utils.jsonback(-1, "", "缺少 id");
    return;
  }

  // 不允许删除内置角色
  const checkSql = `SELECT role_no FROM ${TABLE} WHERE id=${id}`;
  const check = await utils.execGetRes(checkSql);
  if (check.length > 0 && ["R000000001", "R000000002", "R000000003"].includes(check[0].role_no)) {
    ctx.body = utils.jsonback(-2, "", "内置角色不可删除");
    return;
  }

  const sql = `DELETE FROM ${TABLE} WHERE id=${id}`;
  try {
    const res = await utils.execGetRes(sql);
    if (res.affectedRows > 0) {
      ctx.body = utils.jsonback(0, "success", "删除成功");
    } else {
      ctx.body = utils.jsonback(-1, "", "角色不存在");
    }
  } catch (error) {
    ctx.body = utils.jsonback(-10000, error.toString(), "删除失败");
  }
}

// ===================== 用户-角色关联 =====================

const ACCOUNT_TABLE = "zh_office_website.account";

// ===================== 用户-角色关联 =====================

async function AssignRole(ctx) {
  const { accountId, roleId } = ctx.request.body;
  if (!accountId) {
    ctx.body = utils.jsonback(-1, "", "缺少 accountId");
    return;
  }

  const sql = `UPDATE ${ACCOUNT_TABLE} SET role_id=${roleId || "NULL"} WHERE id=${accountId}`;
  try {
    await utils.execGetRes(sql);
    ctx.body = utils.jsonback(0, "success", "分配成功");
  } catch (error) {
    ctx.body = utils.jsonback(-10000, error.toString(), "分配失败");
  }
}

async function GetUserRole(ctx) {
  const accountId = ctx.query.accountId;
  if (!accountId) {
    ctx.body = utils.jsonback(-1, "", "缺少 accountId");
    return;
  }

  const sql = `
    SELECT r.* FROM ${TABLE} r
    INNER JOIN ${ACCOUNT_TABLE} a ON a.role_id = r.id
    WHERE a.id = ${accountId}
  `;
  const res = await utils.execGetRes(sql);
  ctx.body = utils.jsonback(0, res.length > 0 ? res[0] : null, "");
}

// ===================== 初始化内置角色 =====================

async function initDefaultRoles() {
  const defaults = [
    { no: "R000000001", name: "超级管理员", keys: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"], remark: "系统内置，不可删除" },
    { no: "R000000002", name: "管理员",      keys: ["1","8","11","12"], remark: "系统内置，不可删除" },
    { no: "R000000003", name: "普通用户",    keys: ["1","8","11"],       remark: "系统内置，不可删除" },
  ];

  for (const d of defaults) {
    const check = await utils.execGetRes(`SELECT id FROM ${TABLE} WHERE role_no="${d.no}"`);
    if (check.length === 0) {
      const keysStr = JSON.stringify(d.keys);
      const sql = `INSERT INTO ${TABLE}(role_no, name, \`keys\`, remark) VALUES("${d.no}", "${d.name}", '${keysStr}', "${d.remark}")`;
      try {
        await utils.execGetRes(sql);
        console.log(`[permission] 默认角色 "${d.name}" 已创建`);
      } catch (e) {
        console.error(`[permission] 默认角色 "${d.name}" 创建失败:`, e.message);
      }
    }
  }
}

export {
  SearchRoles,
  AddRole,
  UpdateRole,
  DeleteRole,
  AssignRole,
  GetUserRole,
  initDefaultRoles,
};