import utils from "../utils/index.js";
import { createCanvas, Image } from "canvas";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

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

// 绘制一条水平线
function drawLine(ctx, x1, y, x2, stroke = "#000", width = 1) {
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
}

// 绘制文本
function drawText(ctx, text, x, y, fontSize = 12, align = "left", color = "#000", bold = false) {
  ctx.font = `${bold ? "bold " : ""}${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.fillText(text, x, y);
}

// 生成条形码图片 (Data URL)
function generateBarcode(orderId) {
  const canvas = createCanvas(300, 80);
  JsBarcode(canvas, orderId, {
    format: "CODE128",
    width: 2,
    height: 60,
    displayValue: true,
    fontSize: 14,
    margin: 5,
    background: "#ffffff",
    lineColor: "#000000",
  });
  return canvas.toDataURL("image/png");
}

// 生成二维码图片 (Data URL)
function generateQRCode(text) {
  return QRCode.toDataURL(text, {
    width: 100,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}

// 绘制单张面单
async function drawWaybill(order, goodsList, goodsIndex, totalGoods, watermark = false) {
  // 面单尺寸: 500 x 320 (单位: px)
  const W = 500;
  const H = 320;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // 白色背景
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // 顶部标题栏
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, W, 36);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ZHONGHAN LOGISTICS", W / 2, 13);

  // 分隔线
  drawLine(ctx, 10, 41, W - 10, "#333", 1);

  const leftX = 10;
  const rightX = W / 2 + 5;
  let y = 48;

  // ===== 物流信息区 =====
  const colW = W / 2 - 15;
  const rowH = 16;

  const formatDate = (ts) => {
    if (!ts) return "-";
    const d = new Date(parseInt(ts));
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  };

  const fields = [
    { label: "Waybill No.", value: order.orderId || order.id || "-" },
    { label: "Transfer No.", value: order.suplierId || "-" },
    { label: "Destination", value: `${order.destination || ""}  ${countryMap[order.destination] || "-"}` },
    { label: "Package", value: `Pkg ${goodsIndex} / ${totalGoods}` },
    { label: "Warehouse", value: order.warehouse || "-" },
    { label: "Inbound Date", value: formatDate(order.inHouseTime) },
  ];

  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    const fx = i % 2 === 0 ? leftX : rightX;
    const fy = y + Math.floor(i / 2) * rowH;
    ctx.fillStyle = "#666";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(f.label + ":", fx, fy);
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(f.value, fx + 70, fy);
  }

  y += Math.ceil(fields.length / 2) * rowH + 8;

  // 分隔线
  drawLine(ctx, 10, y, W - 10, "#ddd", 0.5);
  y += 6;

  // ===== 收货人信息 =====
  const receiver = {
    contactName: order.receiver_contactName || "-",
    company: order.receiver_company || "-",
    tel: order.receiver_tel || "-",
    addr: order.receiver_addr || "-",
    zipcode: order.receiver_zipcode || "-",
  };

  drawText(ctx, "Receiver Information", 10, y, 11, "left", "#333", true);
  y += 16;
  const receiverFields = [
    `Receiver: ${receiver.contactName}`,
    `Tel: ${receiver.tel}`,
    `Company: ${receiver.company}`,
    `Address: ${receiver.addr} ${receiver.zipcode}`,
  ];
  ctx.font = "10px sans-serif";
  ctx.fillStyle = "#333";
  for (const line of receiverFields) {
    ctx.fillText(line, 10, y);
    y += 13;
  }

  y += 4;

  // ===== 条码区 =====
  drawLine(ctx, 10, y, W - 10, "#ddd", 0.5);
  y += 8;

  const barcodeData = generateBarcode(order.orderId || order.id);
  const qrData = await generateQRCode(`http://www.zhonghanlogistics.cn/track/?order_id=${order.orderId || order.id}`);

  // 条形码
  const barcodeImg = await loadImageFromDataURL(ctx, barcodeData);
  if (barcodeImg) ctx.drawImage(barcodeImg, 10, y, 300, 60);
  drawText(ctx, "Scan to update tracking", 160, y + 62, 9, "center", "#888");

  // 二维码
  const qrImg = await loadImageFromDataURL(ctx, qrData);
  if (qrImg) ctx.drawImage(qrImg, W - 115, y, 90, 90);
  drawText(ctx, "Scan to track", W - 70, y + 92, 9, "center", "#888");

  // 水印
  if (watermark) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.font = "bold 48px sans-serif";
    ctx.fillStyle = "#ff0000";
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-0.5);
    ctx.textAlign = "center";
    ctx.fillText("PREVIEW", 0, 0);
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}

// 从 data URL 加载图片到 canvas context
function loadImageFromDataURL(ctx, dataURL) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = dataURL;
  });
}

async function Generate(ctx) {
  const { orderId, goodsIndices, watermark } = ctx.request.body || {};

  if (!orderId) {
    ctx.body = utils.jsonback(-1, "", "缺少 orderId");
    return;
  }

  // 查询订单
  const orderSql = `SELECT * FROM zh_office_website.orders WHERE orderId="${orderId}"`;
  const orderList = await utils.execGetRes(orderSql);
  if (orderList.length === 0) {
    ctx.body = utils.jsonback(-1, "", "订单不存在");
    return;
  }
  const order = orderList[0];

  // 查询货物
  const goodsSql = `SELECT * FROM zh_office_website.goods WHERE orderId="${orderId}"`;
  const goodsList = await utils.execGetRes(goodsSql);

  const showWatermark = watermark === true || watermark === "true";
  const totalGoods = goodsList.length > 0 ? goodsList.length : 1;

  // 判断是全部还是部分
  let indicesToGenerate = [];
  if (goodsIndices && Array.isArray(goodsIndices) && goodsIndices.length > 0) {
    indicesToGenerate = goodsIndices.map(i => parseInt(i)).filter(i => i >= 1 && i <= totalGoods);
  } else {
    indicesToGenerate = Array.from({ length: totalGoods }, (_, i) => i + 1);
  }

  // 生成面单图片列表
  const waybillImages = [];

  for (const idx of indicesToGenerate) {
    const imgData = await drawWaybill(order, goodsList, idx, totalGoods, showWatermark);
    waybillImages.push({
      index: idx,
      total: totalGoods,
      image: imgData,
    });
  }

  ctx.body = utils.jsonback(0, {
    orderId,
    totalGoods,
    waybillCount: waybillImages.length,
    waybills: waybillImages,
  }, "生成成功");
}

export default {
  Generate,
};