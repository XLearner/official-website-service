# 订单管理模块 — 接口文档

> 使用页面: `src/views/order/index.vue` (订单列表)、`src/views/order/orderDetail.vue` (订单详情)
> 当前 API 函数: `src/api/index.ts`
> 基础 URL: `http://localhost:8903`

## 通用约定

- 所有 POST 请求 Content-Type: `application/x-www-form-urlencoded`（使用 qs.stringify 序列化）
- 所有接口统一返回:

```json
{
  "code": 0,       // number, 0=成功, <0=失败
  "data": "...",   // 具体数据，类型见各接口
  "msg": ""        // string, 错误信息
}
```

---

## 一、订单 (Order)

### 1.1 获取订单列表

**页面**: index.vue 列表区（onMounted 加载）

| 项目 | 说明 |
|------|------|
| URL | `GET /v1/get/order` |
| 参数 | 无 |
| 前端函数 | `apiGetOrders()` |

**Response data** — 返回数组 `Order[]`:

```json
{
  "code": 0,
  "data": [
    {
      "id": 5,                    // number, 数据库主键
      "orderId": "order1",        // string, 运单号 (前端优先展示此字段)
      "suplierId": "",            // string, 转单号
      "updateTime": "1714953600000", // string, 日期 (Unix 毫秒时间戳)
      "state": "0",               // string, 物流状态, 见下方枚举
      "destination": "US",        // string, 目的国代码 (ISO 3166-1 alpha-2)
      "warehouse": "",            // string, 交货仓库
      "inHouseTime": "",          // string, 入仓时间 (Unix 毫秒时间戳)
      "goodsName": "",            // string, 商品名称 (摘要)
      "ps": "",                   // string, 备注
      "history": "[...]",         // string, 轨迹历史 JSON (可空)
      "shipper": { ... },         // object, 发件人信息 (可空)
      "receiver": { ... },        // object, 收件人信息 (可空)
      "origin": "CN",             // string, 始发国代码
      "createAccount": "admin"    // string, 创建人
    }
  ]
}
```

**前端表格展示字段**:

| 表格列 | 数据字段 | 类型 | 说明 |
|--------|----------|------|------|
| 序号 | (index) | - | 前端自增 |
| 运单号 | `orderId \|\| id` | string | 优先 orderId |
| 转单号 | `suplierId` | string | |
| 日期 | `updateTime` | string | 前端转为 YYYY/MM/DD HH:mm:ss |
| 最新状态 | `state` | string | 枚举映射: 0=待上网, 1=运输中, 2=派送中, 3=投递失败, 4=成功签收, 5=可能异常 |
| 目的地 | `destination` | string | 国家代码 → 中文名 |
| 交货仓库 | `warehouse` | string | |
| 入仓时间 | `inHouseTime` | string | 前端转为 YYYY/MM/DD HH:mm:ss |
| 商品名称 | `goodsName` | string | |
| 备注 | `ps` | string | |

> **注意**: 前端兼容 `data` 为单个 object 或数组两种情况。

---

### 1.2 获取单个订单

**页面**: index.vue 编辑区（点击「编辑」时调用）、orderDetail.vue

| 项目 | 说明 |
|------|------|
| URL | `GET /v1/get/order` |
| 参数 | `id` (string, query) — 运单号 `orderId` |
| 前端函数 | `apiGetOrder(id)` |

**Response data** — 返回单个 `Order` 对象:

```json
{
  "code": 0,
  "data": {
    "id": 5,
    "orderId": "order1",
    "suplierId": "",
    "updateTime": "1714953600000",
    "state": "0",
    "destination": "US",
    "warehouse": "",
    "inHouseTime": "",
    "goodsName": "",
    "ps": "",
    "origin": "CN",
    "createAccount": "admin",
    "history": "[{\"updateTime\":\"2024-01-01T00:00:00.000Z\",\"txt\":\"已出库\"}]",
    "shipper": {
      "contactPeople": "",
      "companyName": "",
      "tel": "",
      "addr": ""
    },
    "receiver": {
      "contactPeople": "Tom",
      "companyName": "",
      "tel": "13312394737",
      "email": "",
      "addr": "Tom home",
      "zipCode": "1038",
      "country": ""
    }
  }
}
```

**Order 完整字段定义**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | number | 是 | 数据库主键 |
| `orderId` | string | 是 | **运单号** (业务主键，前端编辑区展示用此字段) |
| `suplierId` | string | 否 | 转单号 |
| `updateTime` | string | 是 | 日期 (Unix 毫秒时间戳字符串) |
| `state` | string | 是 | 货物状态: `"0"`~`"5"` |
| `destination` | string | 是 | 目的国代码 (ISO 3166-1 alpha-2) |
| `warehouse` | string | 否 | 交货仓库名称 |
| `inHouseTime` | string | 否 | 入仓时间 (Unix 毫秒时间戳字符串) |
| `goodsName` | string | 否 | 商品名称摘要 |
| `ps` | string | 否 | 订单备注 |
| `origin` | string | 否 | 始发国代码, 默认 `"CN"` |
| `createAccount` | string | 否 | 创建人账号 |
| `history` | string | 否 | 轨迹历史 JSON 字符串 (见 4.2 节) |
| `shipper` | object | 否 | 发件人信息 (见下方) |
| `receiver` | object | 否 | 收件人信息 (见下方) |

**state 枚举**:

| 值 | 含义 |
|----|------|
| `"0"` | 待上网 |
| `"1"` | 运输中 |
| `"2"` | 派送中 |
| `"3"` | 投递失败 |
| `"4"` | 成功签收 |
| `"5"` | 可能异常 |

**shipper (发件人)**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contactPeople` | string | 否 | 联系人 |
| `companyName` | string | 否 | 公司名称 |
| `tel` | string | 否 | 电话 |
| `addr` | string | 否 | 地址 |

**receiver (收件人)**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contactPeople` | string | **是** | 联系人 |
| `companyName` | string | 否 | 公司名称 |
| `tel` | string | **是** | 联系电话 |
| `email` | string | **是** | 邮箱 |
| `addr` | string | **是** | 详细地址 |
| `zipCode` | string | **是** | 邮政编码 |
| `country` | string | 否 | 收件国家代码 (不传时前端默认填入 `destination`) |

---

### 1.3 新增订单

**页面**: index.vue / orderDetail.vue（保存时，当 `isEdit=false`）

| 项目 | 说明 |
|------|------|
| URL | `POST /v1/add/order` |
| Content-Type | `application/x-www-form-urlencoded` |
| 前端函数 | `apiAddOrder(params)` |

**Request Body** (qs 序列化):

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | **是** | 运单号 (同 orderId) |
| `suplierId` | string | 否 | 转单号 |
| `state` | string | **是** | 状态枚举 `"0"`~`"5"` |
| `updateTime` | string | **是** | 日期 (Unix 毫秒时间戳字符串) |
| `destination` | string | **是** | 目的国代码 |
| `ps` | string | 否 | 备注 |
| `inHouseTime` | string | 否 | 入库时间 (Unix 毫秒时间戳字符串) |
| `warehouse` | string | 否 | 仓库信息 |
| `origin` | string | 否 | 始发国，默认 `"CN"` |
| `createAccount` | string | 否 | 创建人 (取自 localStorage.ms_username) |
| `shipper[contactPeople]` | string | 否 | 发件人-联系人 |
| `shipper[companyName]` | string | 否 | 发件人-公司 |
| `shipper[tel]` | string | 否 | 发件人-电话 |
| `shipper[addr]` | string | 否 | 发件人-地址 |
| `receiver[contactPeople]` | string | **是** | 收件人-联系人 |
| `receiver[companyName]` | string | 否 | 收件人-公司 |
| `receiver[tel]` | string | **是** | 收件人-电话 |
| `receiver[email]` | string | **是** | 收件人-邮箱 |
| `receiver[addr]` | string | **是** | 收件人-地址 |
| `receiver[zipCode]` | string | **是** | 收件人-邮编 |
| `receiver[country]` | string | 否 | 收件人-国家代码 (前端默认填入 destination) |

> 注意: 嵌套对象 (shipper, receiver) 通过 qs.stringify 序列化为 `shipper[contactPeople]=xxx` 格式。

**Response**:
```json
{ "code": 0, "msg": "" }
```

---

### 1.4 更新订单

**页面**: index.vue / orderDetail.vue（保存时，当 `isEdit=true`）

| 项目 | 说明 |
|------|------|
| URL | `POST /v1/set/order` |
| Content-Type | `application/x-www-form-urlencoded` |
| 前端函数 | `apiSetOrder(params)` |

**Request Body**: 同 1.3 新增订单

**Response**:
```json
{ "code": 0, "msg": "" }
```

---

### 1.5 删除订单

**页面**: index.vue 列表操作列

| 项目 | 说明 |
|------|------|
| URL | `POST /v1/delete/order` |
| Content-Type | `application/x-www-form-urlencoded` |
| 前端函数 | `apiDeleteOrder({ id })` |

**Request Body**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | **是** | 运单号 `orderId` |

**Response**:
```json
{ "code": 0, "msg": "" }
```

---

## 二、货物 (Goods)

### 2.1 获取货物列表

**页面**: index.vue 货物 Tab、orderDetail.vue 货物区

| 项目 | 说明 |
|------|------|
| URL | `GET /v1/get/goods` |
| 参数 | `orderId` (string, query) — 运单号 |
| 前端函数 | `apiGetGoods(orderId)` |

**Response data** — 返回数组 `Goods[]`:

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,              // number, 货物主键 (用于更新/删除)
      "orderId": "order1",  // string, 关联运单号
      "name": "soup1",      // string, 品名
      "number": 7,          // number, 件数
      "length": "2",        // string, 长 (cm)
      "width": "3",         // string, 宽 (cm)
      "height": "4",        // string, 高 (cm)
      "realWeight": 100,    // number, 实际重量 (kg)
      "weight": 302,        // number, 计费重量 (kg)
      "ifCustoms": "1",     // string, 报关类型: "1"=单证报关, "0"=买单报关
      "ps": "",             // string, 备注 (海关编码、用途等)
      "inPic": "",          // string, 入库图片 URL
      "outPic": ""          // string, 出库图片 URL
    }
  ]
}
```

**Goods 字段定义**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | number | 是 | 货物主键 (新增时无此字段，后端自动生成) |
| `orderId` | string | **是** | 关联运单号 |
| `name` | string | **是** | 品名 |
| `number` | number | 否 | 件数 |
| `length` | string | 否 | 长 (cm) |
| `width` | string | 否 | 宽 (cm) |
| `height` | string | 否 | 高 (cm) |
| `realWeight` | number | **是** | 实际重量 (kg) |
| `weight` | number | **是** | 计费重量 (kg) |
| `ifCustoms` | string | **是** | 报关类型: `"1"`=单证报关, `"0"`=买单报关 |
| `ps` | string | 否 | 备注 |
| `inPic` | string | 否 | 入库图片 URL (上传后得到) |
| `outPic` | string | 否 | 出库图片 URL (上传后得到) |

**前端货物表格展示**:

| 列 | 字段 | 说明 |
|----|------|------|
| 品名 | `name` | |
| 件数 | `number` | |
| 尺寸 | `length` x `width` x `height` | |
| 实际重量 | `realWeight` | |
| 计费重量 | `weight` | |
| 报关类型 | `ifCustoms` | "1"→单证报关, "0"→买单报关 |
| 备注 | `ps` | |

---

### 2.2 新增货物

**页面**: index.vue / orderDetail.vue 货物 Tab 内联表单（点击「添加货物」→填写→确认）

| 项目 | 说明 |
|------|------|
| URL | `POST /v1/add/goods` |
| Content-Type | `application/x-www-form-urlencoded` |
| 前端函数 | `apiAddGoods(params)` |

**Request Body**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `orderId` | string | **是** | 关联运单号 |
| `name` | string | **是** | 品名 |
| `number` | number | 否 | 件数 |
| `length` | string | 否 | 长 |
| `width` | string | 否 | 宽 |
| `height` | string | 否 | 高 |
| `realWeight` | number | **是** | 实际重量 |
| `weight` | number | **是** | 计费重量 |
| `ifCustoms` | string | **是** | 报关类型 `"1"`/`"0"` |
| `ps` | string | 否 | 备注 |
| `inPic` | string | 否 | 入库图片 URL (上传返回) |
| `outPic` | string | 否 | 出库图片 URL (上传返回) |

**Response**:
```json
{ "code": 0, "msg": "" }
```

---

### 2.3 更新货物

**页面**: index.vue / orderDetail.vue 货物 Tab（点击货物行的「编辑」→修改→确认）

| 项目 | 说明 |
|------|------|
| URL | `POST /v1/set/goods` |
| Content-Type | `application/x-www-form-urlencoded` |
| 前端函数 | `apiSetGoods(params)` |

**Request Body**: 同 2.2 + 额外字段:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | number/string | **是** | 货物主键 |
| (其余字段同 2.2 新增) | | | |

**Response**:
```json
{ "code": 0, "msg": "" }
```

---

### 2.4 删除货物

**页面**: index.vue / orderDetail.vue 货物 Tab

| 项目 | 说明 |
|------|------|
| URL | `POST /v1/delete/goods` |
| Content-Type | `application/x-www-form-urlencoded` |
| 前端函数 | `apiDeleteGoods({ id })` |

**Request Body**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | **是** | 货物主键 |

**Response**:
```json
{ "code": 0, "msg": "" }
```

---

## 三、轨迹 (Track)

> 轨迹数据与订单关联，通过运单号 `id` (即 orderId) 关联。

### 3.1 更新轨迹

**页面**: index.vue 轨迹 Tab / orderDetail.vue 轨迹 Tab（保存订单时同步调用）

| 项目 | 说明 |
|------|------|
| URL | `POST /v1/set/track` |
| Content-Type | `application/x-www-form-urlencoded` |
| 前端函数 | `apiSetTrack(params)` |

**Request Body**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | **是** | 运单号 `orderId` |
| `state` | string | 否 | 当前轨迹状态 `"0"`~`"5"` |
| `ps` | string | 否 | 备注 |
| `history` | string | 否 | 轨迹历史 JSON 字符串 (见下方) |

**history JSON 结构** (数组):

```json
[
  {
    "updateTime": "2024-05-15T10:30:00.000Z",   // Date 对象 JSON 序列化
    "txt": "包裹已入库"                           // string, 轨迹描述
  },
  {
    "updateTime": "2024-05-16T14:00:00.000Z",
    "txt": "已出库，发往目的地"
  }
]
```

| history 单条字段 | 类型 | 必填 | 说明 |
|-----------------|------|------|------|
| `updateTime` | string/Date | **是** | 轨迹时间点 |
| `txt` | string | **是** | 轨迹描述文本 |

**Response**:
```json
{ "code": 0, "msg": "" }
```

> **注意**: 前端在保存订单 (`apiAddOrder` / `apiSetOrder`) 成功后，紧接着调用 `apiSetTrack` 保存轨迹信息。两个接口建议放在同一事务或确保数据一致性。

---

## 四、文件上传 (Upload)

**页面**: index.vue / orderDetail.vue 货物内联表单（入库图片/出库图片）

| 项目 | 说明 |
|------|------|
| URL | `POST /v1/upload` |
| Content-Type | `multipart/form-data` |
| Headers | `zhtoken`: localStorage 中的认证 token |
| 前端变量 | `uploadImgUrl` |

**Request**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `files` | File | **是** | 上传的图片文件 (field name: `files`) |

**Response**:
```json
{
  "code": 0,
  "data": {
    "imgurl": "https://example.com/uploads/xxx.png"   // string, 图片访问 URL
  }
}
```

前端将返回的 `imgurl` 存入货物表单的 `inPic` 或 `outPic` 字段，随货物新增/更新接口一起提交。

---

## 五、接口调用关系总览

| 页面 | 操作 | 调用的接口 (按顺序) |
|------|------|---------------------|
| index.vue — 列表加载 | onMounted | `GET /v1/get/order` (无参) |
| index.vue — 点击「编辑」 | 回填表单 | `GET /v1/get/order?id=xxx` → `GET /v1/get/goods?orderId=xxx` |
| index.vue — 保存 (新增) | 提交 | `POST /v1/add/order` → `POST /v1/set/track` |
| index.vue — 保存 (编辑) | 提交 | `POST /v1/set/order` → `POST /v1/set/track` |
| index.vue — 删除订单 | 删除 | `POST /v1/delete/order` |
| index.vue — 货物 CRUD | 即时生效 | `GET/POST /v1/*/goods` (独立调用，不等待订单保存) |
| index.vue — 上传图片 | 即时上传 | `POST /v1/upload` (返回 imgurl 存入 goodsForm) |
| orderDetail.vue — 加载 | show(id) | `GET /v1/get/order?id=xxx` → `GET /v1/get/goods?orderId=xxx` |
| orderDetail.vue — 保存 | submit | `POST /v1/add\|set/order` → `POST /v1/set/track` |

---

## 六、身份认证

所有需要认证的请求通过 Cookie/Session 机制，前端请求由 axios 实例 (`src/utils/request.ts`) 统一处理。文件上传接口额外需要 Header `zhtoken` (取自 `localStorage.getItem('zh_token')`)。
