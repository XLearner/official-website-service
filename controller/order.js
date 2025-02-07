import utils from "../utils/index.js";
import track from "./track.js"; // 导入track模块

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
    }
    ctx.body = utils.jsonback(0, convertToRequestBody(res[0]), "");
  } else {
    ctx.body = utils.jsonback(0, null, "");
  }
}

async function Add(ctx) {
  const { key, value } = extractObj(ctx.request.body);

  const checkedRes = checkRequiredFields(ctx.request.body);
  if (!checkedRes[0]) {
    ctx.body = utils.jsonback(-1, "", checkedRes[1]);
    return;
  }

  //   const key = ["orderId", "state", "origin", "destination", "updateTime", "ps"];
  const updateSt = `insert into ${TABLE_NAME}(${key}) values(${value
    .map((ele) => `"${ele}"`)
    .join(",")})`;

  try {
    const res = await utils.execGetRes(updateSt);

    if (res.affectedRows > 0) {
      // 添加订单成功后，添加对应的轨迹信息
      const trackRes = await track.addToDb(ctx);

      if (trackRes[0] > 0) {
        ctx.body = utils.jsonback(0, "success", "订单和轨迹信息已更新");
      } else {
        ctx.body = utils.jsonback(
          0,
          "订单已更新，但轨迹信息更新失败",
          trackRes[1]
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

  // 删除订单前，先删除对应的轨迹信息
  const trackRes = await track.delFromDb(ctx);

  if (trackRes[0] > 0) {
    const updateSt = `delete from ${TABLE_NAME} where orderId="${id}"`;

    try {
      const res = await utils.execGetRes(updateSt);

      if (res.affectedRows > 0) {
        ctx.body = utils.jsonback(0, "success", "订单和轨迹信息已删除");
      } else {
        ctx.body = utils.jsonback(0, null, "无更新");
      }
    } catch (error) {
      ctx.body = utils.jsonback(-10000, error.toString(), "删除有误");
    }
  } else {
    ctx.body = utils.jsonback(0, "轨迹信息删除失败", trackRes[1]);
  }
}

function extractObj(form) {
  const { orderId, shipper, receiver, goods, createAccount } = form;
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
    addr: receiver_addr,
    zipCode: receiver_zipcode,
  } = receiver || {};
  const {
    name: goods_name,
    weight: goods_weight,
    number: goods_number,
  } = goods || {};
  const goods_size = goods
    ? [goods.length, goods.width, goods.height].join(",")
    : null;

  // 创建一个空的对象来存储有效的键值对
  const result = { key: [], value: [] };

  // 定义一个函数来动态添加有效的键值对
  function addIfDefined(key, value) {
    if (value !== undefined && value !== null && value !== "") {
      result.key.push(key);
      result.value.push(value);
    }
  }

  // 动态添加所有有效的键值对
  addIfDefined("orderId", orderId);
  addIfDefined("createAccount", createAccount);
  addIfDefined("send_contactName", send_contactName);
  addIfDefined("send_company", send_company);
  addIfDefined("send_tel", send_tel);
  addIfDefined("send_addr", send_addr);
  addIfDefined("receiver_contactName", receiver_contactName);
  addIfDefined("receiver_company", receiver_company);
  addIfDefined("receiver_tel", receiver_tel);
  addIfDefined("receiver_addr", receiver_addr);
  addIfDefined("receiver_zipcode", receiver_zipcode);
  addIfDefined("goods_name", goods_name);
  addIfDefined("goods_weight", goods_weight);
  addIfDefined("goods_number", goods_number);
  addIfDefined("goods_size", goods_size);

  return result;
}

function checkRequiredFields(form) {
  const requiredFields = {
    orderId: form.orderId,
    state: form.state,
    time: form.time,
    destination: form.destination,
    receiver: {
      contactPeople: form.receiver.contactPeople,
      tel: form.receiver.tel,
      addr: form.receiver.addr,
      zipCode: form.receiver.zipCode,
    },
    goods: {
      name: form.goods.name,
      weight: form.goods.weight,
    },
  };

  const emptyFields = [];

  // 检查顶级字段
  for (const key in requiredFields) {
    if (requiredFields[key] === "" || requiredFields[key] === null) {
      emptyFields.push(key);
    } else if (typeof requiredFields[key] === "object") {
      // 检查嵌套字段
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
    createAccount,
    state,
    updateTime,
    ps,
    destination,
    ///
    send_contactName,
    send_company,
    send_tel,
    send_addr,
    receiver_contactName,
    receiver_company,
    receiver_tel,
    receiver_addr,
    receiver_zipcode,
    goods_name,
    goods_weight,
    goods_number,
    goods_size,
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
    addr: receiver_addr,
    zipCode: receiver_zipcode,
  };

  const size = goods_size.split(",");
  const goods = {
    name: goods_name,
    weight: goods_weight,
    number: goods_number,
    length: size[0],
    width: size[1],
    height: size[2],
  };

  const form = {
    id,
    orderId,
    shipper,
    receiver,
    goods,
    createAccount,
    state,
    updateTime,
    ps,
    destination,
  };

  return form;
}

export default {
  Search,
  Add,
  Update,
  Delete,
};
