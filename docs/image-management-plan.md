# 图片管理模块 — 设计方案

> 状态: **已确认，开始实施** | 2026-05-15

---

## 一、现状分析

| 项目 | 现状 |
|------|------|
| 上传接口 | `POST /v1/upload` → multer 接收，存入 `assets/photo/` |
| 图片引用 | goods 表 `inPic/outPic`、news 内容等，各模块各自存储 URL 字符串 |
| 存储方式 | 所有图片堆在一个 `assets/photo/` 大文件夹，无分类/无清理 |
| 压缩 | 无，原图直接存（部分 PNG 达 3.6MB） |
| img_repo 表 | 代码引用但 **DB 中不存在**，upload 实际会报错 |
| 清理机制 | 无，废弃图片永久占用磁盘 |

---

## 二、目标架构

```
上传请求
   │
   ▼
┌─────────────────┐
│  sharp 压缩      │  ← 有损压缩，quality≈85，大幅缩小体积
└────────┬────────┘
         ▼
┌─────────────────┐
│ assets/temp/    │  ← 临时缓存（未确认使用）
│ 保留 ≤24h        │
└────────┬────────┘
         │ 实体保存时调用 promoteImage()
         ▼
┌─────────────────┐
│ assets/photo/   │  ← 永久存储（已关联实体）
│ 由 image_usage   │
│ 表跟踪引用关系    │
└─────────────────┘
```

**定时任务**（应用内 setInterval）：
- **每小时**：清理 `assets/temp/` 中超过 24h 的文件
- **每天**：对比 `image_usage` 表，清理 `assets/photo/` 中未被引用的孤立文件

---

## 三、新增 NPM 依赖

```bash
npm install sharp
```

**选型理由**：sharp 基于 libvips (C++)，比 imagemagick/gm 快 4-5 倍，内存占用低，支持 JPEG/PNG/WebP/AVIF 输出，quality 参数精准控制画质。

---

## 四、新增文件

### 4.1 `utils/imageManager.js` — 图片管理核心模块

```
imageManager
├── compress(inputPath, outputPath, options)  → 调用 sharp 压缩
├── promoteImage(tempUrl)                      → temp→photo 移动，写入 image_usage
├── cleanupTemp(maxAgeMs)                      → 清理过期 temp 文件
├── cleanupOrphans()                           → 清理未被引用的 photo 文件
├── recordUsage(imageUrl, entityType, entityId)→ 记录图片引用
├── removeUsage(entityType, entityId)          → 删除实体时清除引用
└── startScheduler()                           → 启动定时清理任务
```

### 4.2 新增 DB 表

```sql
CREATE TABLE IF NOT EXISTS image_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  imageUrl VARCHAR(500) NOT NULL COMMENT '图片相对路径，如 /photo/files-xxx.jpg',
  entityType VARCHAR(50) NOT NULL COMMENT '引用实体类型: goods.inPic / goods.outPic / news.content ...',
  entityId VARCHAR(255) NOT NULL COMMENT '引用实体ID',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_url (imageUrl),
  INDEX idx_entity (entityType, entityId)
);
```

### 4.3 新增文件夹

```
assets/
├── photo/        ← 永久（已有）
└── temp/         ← 临时缓存（新建，.gitkeep 占位）
```

---

## 五、需要改动的现有文件

### 5.1 `index.js` — 启动入口

- 引入 `startScheduler()`，在 `app.listen()` 后调用
- 注册 `assets/temp/` 为静态目录（与 photo 一致，使前端可预览）

### 5.2 `controller/image.js` — 上传逻辑重写

| 函数 | 改动 |
|------|------|
| `Upload` | multer destination 改为 `assets/temp/`；上传后调用 `compress()` 压缩；返回 temp URL |
| `GetImg` | 保持不变（后续按需从 image_usage 查） |
| 新增 `Commit` | `POST /v1/commit/images` — 接收 `{ urls: [] }`，调用 `promoteImage()` 批量确认 |

### 5.3 `route/route.js`

- multer `destination` 改为 `./assets/temp`
- 新增 `POST /v1/commit/images` 路由

### 5.4 各业务 Controller（改动量小）

在 goods/order/news 等模块的 **Add/Update** 成功保存后，调用：

```js
import imageManager from '../utils/imageManager.js';

// 保存成功后，扫描 body 中的 temp 图片 URL 并 promote
await imageManager.promoteFromBody(ctx.request.body, entityType, entityId);
```

在 **Delete** 成功后调用：

```js
await imageManager.removeUsage(entityType, entityId);
```

---

## 六、压缩策略

| 格式 | 策略 | 预估效果 |
|------|------|----------|
| JPEG | `sharp().jpeg({ quality: 85, progressive: true })` | 原 900KB → ~120KB |
| PNG | `sharp().png({ quality: 85, palette: true })` | 原 3.6MB → ~400KB |
| 超大图 | 限制最大宽度 1920px，等比缩放 | 避免 4000px+ 原图 |

不转换格式 — JPEG 保持 JPEG，PNG 保持 PNG，仅压缩不改变类型。

---

## 七、前端对接说明

| 变化点 | 说明 |
|--------|------|
| 上传返回 URL | 从 `/photo/xxx` 变为 `/temp/xxx`（前端无需改动，路径由响应决定）|
| 新增 commit 接口 | 实体保存成功后，前端调用 `POST /v1/commit/images { urls: [...] }` 确认图片 |
| 静态访问 | `/temp/` 目录同样开放静态访问，预览无影响 |

> 如果前端不便改动，可将 `promoteImage` 逻辑内嵌在各 Add/Update controller 中自动执行，前端无感知。

---

## 八、已确认决策

| 决策项 | 结论 |
|--------|------|
| commit 方式 | **后端自动 promote** — 各 Controller Add/Update 中自动扫描并移动 temp 图片 |
| temp 保留时长 | **24 小时** |
| 保留原图 | **不保留** — 压缩后直接覆盖 |
| PNG 透明 | **不需要** — 使用 palette 压缩 |
| orphan 清理 | **每天自动执行** — 对比 `image_usage` 表清理 photo 孤儿文件 |
