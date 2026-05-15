import utils from "../utils/index.js";
import track from "./track.js";
import goods from "./goods.js";

const TABLE_NAME = "orders";

async function Search(ctx) {
  const id = ctx.query.id;
  let updateSt = "";
  if (id) {
    updateSt = `SELECT * from zh_office_website.${TABLE_NAME} where orderId='${id}';`;
  } else {
    updateSt = `SELECT * from zh_office_website.${TABLE_NAME};`;
  }

  const res = await utils.execGetRes(updateSt);

  if (res.length > 0) {
    if (id) {
      const r = await track.getFromDb({ query: { id: id } });
      if (r[0] > 0) {
        Object.assign(res[0], r[1][0]);
      }
      ctx.body = utils.jsonback(0, convertToRequestBody(res[0]), "");
    } else {
      ctx.body = utils.jsonback(0, res.map(convertToRequestBody), "");
    }
  } else {
    ctx.body = utils.jsonback(0, id ? null : [], "");
  }
}

async function Add(ctx) {
  const { key, value } = extractObj(ctx.request.body);

  const checkedRes = checkRequiredFields(ctx.request.body);
  if (!checkedRes[0]) {
    ctx.body = utils.jsonback(-1, "", checkedRes[1]);
    return;
  }

  const updateSt = `insert into ${TABLE_NAME}(${key}) values(${value
    .map((ele) => `"${ele}"`)
    .join(",")})`;

  try {
    const res = await utils.execGetRes(updateSt);

    if (res.affectedRows > 0) {
      const trackRes = await track.addToDb(ctx);

      if (trackRes[0] > 0) {
        ctx.body = utils.jsonback(0, "success", "订单和轨迹信息已更新");
      } else {
        ctx.body = utils.jsonback(
          0,
          "订单已更新，但轨迹信息更新失败",
          trackRes[1],
        );
      }
    } else {
      ctx.body = utils.jsonback(0, null, "无更新");
    }
  } catch (error) {
    ctx.body = utils.jsonback(-10000, error.toString(), "插入有误");
  }
}

async function Update(ctx) {
  const { key, value } = extractObj(ctx.request.body);

  const id = ctx.request.body.id;
  if (!id) {
    ctx.body = utils.jsonback(-1, "", "缺少id");
    return;
  }

  const modifyParams = {};
  for (let i = 0, len = key.length; i < len; i++) {
    const k = key[i];
    modifyParams[k] = value[i];
  }
  const params = utils.toSentence(modifyParams);

  const updateSt = `update ${TABLE_NAME} set ${params} where ${TABLE_NAME}.orderId='${id}'`;

  const res = await utils.execGetRes(updateSt);

  if (res.changedRows === 1) {
    ctx.body = utils.jsonback(0, "success", "更新1条数据");
  } else {
    ctx.body = utils.jsonback(0, null, "无更新");
  }
}

async function Delete(ctx) {
  const id = ctx.request.body.id;
  if (!id) {
    ctx.body = utils.jsonback(-1, "", "待删除id为空");
    return;
  }

  // 联动删除轨迹和货物数据（不阻塞订单删除）
  const trackRes = await track.delFromDb(ctx);
  const goodsRes = await goods.delByOrderId(id);

  const updateSt = `delete from ${TABLE_NAME} where orderId="${id}"`;

  try {
    const res = await utils.execGetRes(updateSt);

    if (res.affectedRows > 0) {
      const parts = ["订单已删除"];
      if (trackRes[0] > 0) parts.push(`轨迹(${trackRes[0]}条)`);
      if (goodsRes[0] > 0) parts.push(`货物(${goodsRes[0]}条)`);
      ctx.body = utils.jsonback(0, "success", parts.join("，") + "已联动删除");
    } else {
      ctx.body = utils.jsonback(0, null, "订单不存在");
    }
  } catch (error) {
    ctx.body = utils.jsonback(-10000, error.toString(), "删除有误");
  }
}

function extractObj(form) {
  const {
    id: orderId,
    suplierId,
    state,
    updateTime,
    destination,
    ps,
    inHouseTime,
    warehouse,
    origin,
    createAccount,
    shipper,
    receiver,
  } = form;
  const {
    contactPeople: send_contactName,
    companyName: send_company,
    tel: send_tel,
    addr: send_addr,
  } = shipper || {};
  const {
    contactPeople: receiver_contactName,
    companyName: receiver_company,
    tel: receiver_tel,
    email: receiver_email,
    addr: receiver_addr,
    zipCode: receiver_zipcode,
    country: receiver_country,
  } = receiver || {};

  const result = { key: [], value: [] };

  function addIfDefined(key, value) {
    if (value !== undefined && value !== null && value !== "") {
      result.key.push(key);
      result.value.push(value);
    }
  }

  addIfDefined("orderId", orderId);
  addIfDefined("suplierId", suplierId);
  addIfDefined("state", state);
  addIfDefined("updateTime", updateTime);
  addIfDefined("destination", destination);
  addIfDefined("ps", ps);
  addIfDefined("inHouseTime", inHouseTime);
  addIfDefined("warehouse", warehouse);
  addIfDefined("origin", origin);
  addIfDefined("createAccount", createAccount);
  addIfDefined("send_contactName", send_contactName);
  addIfDefined("send_company", send_company);
  addIfDefined("send_tel", send_tel);
  addIfDefined("send_addr", send_addr);
  addIfDefined("receiver_contactName", receiver_contactName);
  addIfDefined("receiver_company", receiver_company);
  addIfDefined("receiver_tel", receiver_tel);
  addIfDefined("receiver_email", receiver_email);
  addIfDefined("receiver_addr", receiver_addr);
  addIfDefined("receiver_zipcode", receiver_zipcode);
  addIfDefined("receiver_country", receiver_country);

  return result;
}

function checkRequiredFields(form) {
  const requiredFields = {
    id: form.id,
    state: form.state,
    updateTime: form.updateTime,
    destination: form.destination,
    receiver: {
      contactPeople: form.receiver?.contactPeople,
      tel: form.receiver?.tel,
      email: form.receiver?.email,
      addr: form.receiver?.addr,
      zipCode: form.receiver?.zipCode,
    },
  };

  const emptyFields = [];

  for (const key in requiredFields) {
    if (requiredFields[key] === "" || requiredFields[key] === null) {
      emptyFields.push(key);
    } else if (typeof requiredFields[key] === "object") {
      for (const subKey in requiredFields[key]) {
        if (
          requiredFields[key][subKey] === "" ||
          requiredFields[key][subKey] === null
        ) {
          emptyFields.push(`${key}.${subKey}`);
        }
      }
    }
  }

  if (emptyFields.length > 0) {
    console.warn("以下必填字段为空:", emptyFields);
    return [false, "以下必填字段为空:" + emptyFields.join(", ")];
  } else {
    return [true, null];
  }
}

function convertToRequestBody(dbData) {
  const {
    id,
    orderId,
    suplierId,
    state,
    updateTime,
    destination,
    ps,
    inHouseTime,
    warehouse,
    goodsName,
    origin,
    createAccount,
    history,
    send_contactName,
    send_company,
    send_tel,
    send_addr,
    receiver_contactName,
    receiver_company,
    receiver_tel,
    receiver_email,
    receiver_addr,
    receiver_zipcode,
    receiver_country,
  } = dbData;

  const shipper = {
    contactPeople: send_contactName,
    companyName: send_company,
    tel: send_tel,
    addr: send_addr,
  };

  const receiver = {
    contactPeople: receiver_contactName,
    companyName: receiver_company,
    tel: receiver_tel,
    email: receiver_email,
    addr: receiver_addr,
    zipCode: receiver_zipcode,
    country: receiver_country,
  };

  return {
    id,
    orderId,
    suplierId,
    updateTime,
    state,
    destination,
    warehouse,
    inHouseTime,
    goodsName,
    ps,
    history,
    shipper,
    receiver,
    origin,
    createAccount,
  };
}

export default {
  Search,
  Add,
  Update,
  Delete,
};
