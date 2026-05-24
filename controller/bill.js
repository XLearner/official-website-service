import utils from "../utils/index.js";
import goods from "./goods.js";
import ExcelJS from "exceljs";

// 国家代码 → 中文名
const countryMap = {
  AF: "阿富汗", AL: "阿尔巴尼亚", DZ: "阿尔及利亚", AD: "安道尔", AO: "安哥拉",
  AI: "安圭拉", AG: "安提瓜和巴布达", AR: "阿根廷", AM: "亚美尼亚", AU: "澳大利亚",
  AT: "奥地利", AZ: "阿塞拜疆", BS: "巴哈马", BH: "巴林", BD: "孟加拉国", BB: "巴巴多斯",
  BY: "白俄罗斯", BE: "比利时", BZ: "伯利兹", BJ: "贝宁", BM: "百慕大", BT: "不丹",
  BO: "玻利维亚", BA: "波黑", BW: "博茨瓦纳", BR: "巴西", BN: "文莱", BG: "保加利亚",
  BF: "布基纳法索", BI: "布隆迪", KH: "柬埔寨", CM: "喀麦隆", CA: "加拿大", CV: "佛得角",
  KY: "开曼群岛", CF: "中非", TD: "乍得", CL: "智利", CN: "中国", CO: "哥伦比亚",
  KM: "科摩罗", CG: "刚果", CD: "刚果民主共和国", CR: "哥斯达黎加", CI: "科特迪瓦",
  HR: "克罗地亚", CU: "古巴", CY: "塞浦路斯", CZ: "捷克", DK: "丹麦", DJ: "吉布提",
  DM: "多米尼克", DO: "多米尼加", EC: "厄瓜多尔", EG: "埃及", SV: "萨尔瓦多",
  GQ: "赤道几内亚", ER: "厄立特里亚", EE: "爱沙尼亚", ET: "埃塞俄比亚", FK: "福克兰群岛",
  FO: "法罗群岛", FJ: "斐济", FI: "芬兰", FR: "法国", GF: "法属圭亚那", PF: "法属波利尼西亚",
  GA: "加蓬", GM: "冈比亚", GE: "格鲁吉亚", DE: "德国", GH: "加纳", GI: "直布罗陀",
  GR: "希腊", GL: "格陵兰", GD: "格林纳达", GP: "瓜德罗普", GU: "关岛", GT: "危地马拉",
  GN: "几内亚", GW: "几内亚比绍", GY: "圭亚那", HT: "海地", HN: "洪都拉斯", HK: "香港",
  HU: "匈牙利", IS: "冰岛", IN: "印度", ID: "印度尼西亚", IR: "伊朗", IQ: "伊拉克",
  IE: "爱尔兰", IL: "以色列", IT: "意大利", JM: "牙买加", JP: "日本", JO: "约旦",
  KZ: "哈萨克斯坦", KE: "肯尼亚", KI: "基里巴斯", KP: "朝鲜", KR: "韩国", KW: "科威特",
  KG: "吉尔吉斯斯坦", LA: "老挝", LV: "拉脱维亚", LB: "黎巴嫩", LS: "莱索托", LR: "利比里亚",
  LY: "利比亚", LI: "列支敦士登", LT: "立陶宛", LU: "卢森堡", MO: "澳门", MK: "北马其顿",
  MG: "马达加斯加", MW: "马拉维", MY: "马来西亚", MV: "马尔代夫", ML: "马里", MT: "马耳他",
  MH: "马绍尔群岛", MQ: "马提尼克", MR: "毛里塔尼亚", MU: "毛里求斯", YT: "马约特",
  MX: "墨西哥", FM: "密克罗尼西亚", MD: "摩尔多瓦", MC: "摩纳哥", MN: "蒙古", ME: "黑山",
  MS: "蒙特塞拉特", MA: "摩洛哥", MZ: "莫桑比克", MM: "缅甸", NA: "纳米比亚", NR: "瑙鲁",
  NP: "尼泊尔", NL: "荷兰", NC: "新喀里多尼亚", NZ: "新西兰", NI: "尼加拉瓜", NE: "尼日尔",
  NG: "尼日利亚", NU: "纽埃", NF: "诺福克岛", MP: "北马里亚纳群岛", NO: "挪威", OM: "阿曼",
  PK: "巴基斯坦", PW: "帕劳", PS: "巴勒斯坦", PA: "巴拿马", PG: "巴布亚新几内亚", PY: "巴拉圭",
  PE: "秘鲁", PH: "菲律宾", PN: "皮特凯恩", PL: "波兰", PT: "葡萄牙", PR: "波多黎各",
  QA: "卡塔尔", RE: "留尼汪", RO: "罗马尼亚", RU: "俄罗斯", RW: "卢旺达", SH: "圣赫勒拿",
  KN: "圣基茨和尼维斯", LC: "圣卢西亚", MF: "法属圣马丁", PM: "圣皮埃尔和密克隆", VC: "圣文森特和格林纳丁斯",
  WS: "萨摩亚", SM: "圣马力诺", ST: "圣多美和普林西比", SA: "沙特阿拉伯", SN: "塞内加尔",
  RS: "塞尔维亚", SC: "塞舌尔", SL: "塞拉利昂", SG: "新加坡", SK: "斯洛伐克", SI: "斯洛文尼亚",
  SB: "所罗门群岛", SO: "索马里", ZA: "南非", ES: "西班牙", LK: "斯里兰卡", SD: "苏丹",
  SR: "苏里南", SZ: "斯威士兰", SE: "瑞典", CH: "瑞士", SY: "叙利亚", TW: "台湾",
  TJ: "塔吉克斯坦", TZ: "坦桑尼亚", TH: "泰国", TL: "东帝汶", TG: "多哥", TK: "托克劳",
  TO: "汤加", TT: "特立尼达和多巴哥", TN: "突尼斯", TR: "土耳其", TM: "土库曼斯坦",
  TC: "特克斯和凯科斯群岛", TV: "图瓦卢", UG: "乌干达", UA: "乌克兰", AE: "阿联酋",
  GB: "英国", US: "美国", UM: "美国本土外小岛屿", UY: "乌拉圭", UZ: "乌兹别克斯坦",
  VU: "瓦努阿图", VA: "梵蒂冈", VE: "委内瑞拉", VN: "越南", VG: "英属维尔京群岛",
  VI: "美属维尔京群岛", WF: "瓦利斯和富图纳", EH: "西撒哈拉", YE: "也门", ZM: "赞比亚",
  ZW: "津巴布韦", SX: "荷属圣马丁", CW: "库拉索",
};

async function Export(ctx) {
  let { orderIds = [] } = ctx.request.body;

  // 支持 JSON 字符串格式（前端 qs.stringify 编码）
  if (typeof orderIds === "string") {
    try {
      orderIds = JSON.parse(orderIds);
    } catch {
      ctx.body = utils.jsonback(-1, "", "orderIds 格式错误");
      return;
    }
  }

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    ctx.body = utils.jsonback(-1, "", "orderIds 为空");
    return;
  }

  // 查询所有订单
  const placeholders = orderIds.map(id => `"${id}"`).join(",");
  const orderSql = `SELECT * FROM zh_office_website.orders WHERE orderId IN (${placeholders})`;
  const orderList = await utils.execGetRes(orderSql);

  if (orderList.length === 0) {
    ctx.body = utils.jsonback(-1, "", "未找到相关订单");
    return;
  }

  // 批量查询每个订单的货物
  const goodsSql = `SELECT * FROM zh_office_website.goods WHERE orderId IN (${placeholders})`;
  const goodsList = await utils.execGetRes(goodsSql);

  // 按 orderId 分组
  const goodsMap = {};
  for (const g of goodsList) {
    if (!goodsMap[g.orderId]) goodsMap[g.orderId] = [];
    goodsMap[g.orderId].push(g);
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ZhongHan Logistics";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("账单");
  sheet.properties.defaultRowHeight = 20;

  // 表头样式
  const headerStyle = {
    font: { bold: true, size: 11 },
    alignment: { vertical: "middle", horizontal: "center" },
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9D9D9" },
    },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  // 数据行样式
  const dataStyle = {
    alignment: { vertical: "middle", horizontal: "left", wrapText: true },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  // 合计行样式
  const sumStyle = {
    font: { bold: true, color: { argb: "FFFF0000" } },
    alignment: { vertical: "middle", horizontal: "center" },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  // 定义列（18列）
  const columns = [
    { header: "序号", key: "index", width: 6 },
    { header: "接收日期", key: "receiveDate", width: 13 },
    { header: "运单号", key: "orderId", width: 18 },
    { header: "转单号", key: "suplierId", width: 18 },
    { header: "渠道", key: "channel", width: 12 },
    { header: "目的地", key: "destination", width: 12 },
    { header: "收货人", key: "receiver", width: 12 },
    { header: "收货电话", key: "receiverTel", width: 14 },
    { header: "收货地址", key: "receiverAddr", width: 30 },
    { header: "货物名称", key: "goodsName", width: 20 },
    { header: "重量(kg)", key: "realWeight", width: 10 },
    { header: "件数", key: "totalNumber", width: 8 },
    { header: "体积(m³)", key: "volume", width: 10 },
    { header: "计费重量(kg)", key: "chargeWeight", width: 12 },
    { header: "单价", key: "unitPrice", width: 10 },
    { header: "其他费用", key: "extraFee", width: 10 },
    { header: "总价", key: "totalPrice", width: 12 },
    { header: "备注", key: "ps", width: 15 },
  ];

  sheet.columns = columns;

  // 设置表头行
  const headerRow = sheet.getRow(1);
  headerRow.height = 25;
  for (const col of columns) {
    const cell = headerRow.getCell(col.key);
    cell.value = col.header;
    cell.style = headerStyle;
  }
  sheet.views = [{ state: "frozen", activeCell: "A2" }];

  let idx = 0;
  let totalWeight = 0;
  let totalNumber = 0;
  let totalVolume = 0;
  let totalChargeWeight = 0;
  let totalPrice = 0;

  for (const order of orderList) {
    const goodsOfOrder = goodsMap[order.orderId] || [];
    const orderGoods = goodsOfOrder.length > 0 ? goodsOfOrder : [{}];

    // 聚合订单下的货物数据
    const goodsNames = [...new Set(orderGoods.map(g => g.name).filter(Boolean))].join("、");
    const totalRealWeight = orderGoods.reduce((sum, g) => sum + (parseFloat(g.realWeight) || 0), 0);
    const totalGoodsNum = orderGoods.reduce((sum, g) => sum + (parseInt(g.number) || 1), 0);
    const totalVol = orderGoods.reduce((sum, g) => {
      const l = parseFloat(g.length) || 0;
      const w = parseFloat(g.width) || 0;
      const h = parseFloat(g.height) || 0;
      return sum + (l * w * h);
    }, 0) / 1000000; // cm³ → m³
    const totalChargeW = orderGoods.reduce((sum, g) => sum + (parseFloat(g.weight) || 0), 0);

    const formatDate = (ts) => {
      if (!ts) return "";
      const d = new Date(parseInt(ts));
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };

    const row = {
      index: ++idx,
      receiveDate: formatDate(order.updateTime),
      orderId: order.orderId || order.id,
      suplierId: order.suplierId || "",
      channel: order.createAccount || "",
      destination: countryMap[order.destination] || order.destination || "",
      receiver: order.receiver_contactName || "",
      receiverTel: order.receiver_tel || "",
      receiverAddr: order.receiver_addr || "",
      goodsName: goodsNames,
      realWeight: parseFloat(totalRealWeight.toFixed(3)),
      totalNumber: totalGoodsNum,
      volume: parseFloat(totalVol.toFixed(6)),
      chargeWeight: parseFloat(totalChargeW.toFixed(3)),
      unitPrice: "",
      extraFee: "",
      totalPrice: "",
      ps: order.ps || "",
    };

    const dataRow = sheet.addRow(row);
    dataRow.height = 18;
    for (const col of columns) {
      const cell = dataRow.getCell(col.key);
      cell.style = dataStyle;
      // 数字列保留2位小数
      if (["realWeight", "chargeWeight"].includes(col.key)) {
        if (typeof cell.value === "number") {
          cell.numFmt = "0.000";
        }
      }
      if (col.key === "volume") {
        if (typeof cell.value === "number") {
          cell.numFmt = "0.000000";
        }
      }
    }

    totalWeight += totalRealWeight;
    totalNumber += totalGoodsNum;
    totalVolume += totalVol;
    totalChargeWeight += totalChargeW;
  }

  // 合计行
  const sumRow = sheet.addRow({
    index: "合计",
    receiveDate: "",
    orderId: "",
    suplierId: "",
    channel: "",
    destination: "",
    receiver: "",
    receiverTel: "",
    receiverAddr: "",
    goodsName: `共 ${idx} 笔订单`,
    realWeight: parseFloat(totalWeight.toFixed(3)),
    totalNumber: totalNumber,
    volume: parseFloat(totalVolume.toFixed(6)),
    chargeWeight: parseFloat(totalChargeWeight.toFixed(3)),
    unitPrice: "",
    extraFee: "",
    totalPrice: "",
    ps: "",
  });
  sumRow.height = 22;
  for (const col of columns) {
    const cell = sumRow.getCell(col.key);
    cell.style = sumStyle;
  }

  // 自适应列宽
  for (let i = 1; i <= sheet.columnCount; i++) {
    const col = sheet.getColumn(i);
    const rows = sheet.getSheetValues() || [];
    let maxLen = col.header?.length || 0;
    for (const row of rows) {
      if (row && typeof row === 'object') {
        const cellVal = (row[i] != null ? String(row[i]) : "").length;
        if (cellVal > maxLen) maxLen = cellVal;
      }
    }
    col.width = Math.min(maxLen + 2, 40);
  }

  const buffer = await workbook.xlsx.writeBuffer();

  const filename = `bill_${new Date().toISOString().slice(0, 10)}.xlsx`;
  ctx.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  ctx.set("Content-Disposition", `attachment; filename="${filename}"`);
  ctx.set("Content-Length", buffer.length);
  ctx.body = buffer;
}

export default {
  Export,
};