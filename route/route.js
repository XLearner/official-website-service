import Route from "koa-router";
import controller from "../controller/index.js";
import Multer from "@koa/multer";

const route = new Route();

route.post("/v1/login", controller.Login);
route.post("/v1/logout", controller.Logout);
route.post("/v1/check", controller.Check);

// 公司信息
route.get("/v1/get/info", controller.baseInfoControl.Get);
route.post("/v1/set/info", controller.baseInfoControl.Set);
route.post("/v1/add/info", controller.baseInfoControl.Add);
route.post("/v1/delete/info", controller.baseInfoControl.Delete);

const storage = Multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./assets/photo");
  },
  filename: (req, file, cb) => {
    let type = file.originalname.replace(/.+\./, ".");
    cb(null, file.fieldname + "-" + Date.now() + type);
  },
});
const upload = Multer({ storage: storage });

// 图片
route.post(
  "/v1/upload",
  upload.single("files"),
  controller.imageControl.Upload
);
route.get("/v1/get/img", controller.imageControl.GetImg);

// 轮播图
route.get("/v1/get/banner", controller.bannerControl.Get);
route.post("/v1/save/banner", controller.bannerControl.Add);
route.post("/v1/delete/banner", controller.bannerControl.Delete);

// 亮点业务
route.get("/v1/get/business", controller.businessControl.Search);
route.post("/v1/add/business", controller.businessControl.Add);
route.post("/v1/set/business", controller.businessControl.Update);
route.post("/v1/delete/business", controller.businessControl.Delete);

// 合作客户
route.get("/v1/get/custom", controller.customControl.Search);
route.post("/v1/add/custom", controller.customControl.Add);
route.post("/v1/set/custom", controller.customControl.Update);
route.post("/v1/delete/custom", controller.customControl.Delete);

// 优势内容
route.get("/v1/get/advantage", controller.advantageControl.Search);
route.post("/v1/add/advantage", controller.advantageControl.Add);
route.post("/v1/set/advantage", controller.advantageControl.Update);
route.post("/v1/delete/advantage", controller.advantageControl.Delete);

// 相关服务
route.get("/v1/get/relativeService", controller.relativeServiceControl.Search);
route.post("/v1/add/relativeService", controller.relativeServiceControl.Add);
route.post("/v1/set/relativeService", controller.relativeServiceControl.Update);
route.post(
  "/v1/delete/relativeService",
  controller.relativeServiceControl.Delete
);

// 新闻动态
route.get("/v1/get/news", controller.newsControl.Search);
route.post("/v1/add/news", controller.newsControl.Add);
route.post("/v1/set/news", controller.newsControl.Update);
route.post("/v1/delete/news", controller.newsControl.Delete);

// 招聘信息
route.get("/v1/get/recruit", controller.recruitControl.Search);
route.post("/v1/add/recruit", controller.recruitControl.Add);
route.post("/v1/set/recruit", controller.recruitControl.Update);
route.post("/v1/delete/recruit", controller.recruitControl.Delete);

// 联系我们
route.post("/v1/add/contactus", controller.contactusControl.Add);
route.post("/v1/get/contactus-all", controller.contactusControl.GetAll);

// 轨迹
route.get("/v1/get/track", controller.trackControl.Search);
route.post("/v1/add/track", controller.trackControl.Add);
route.post("/v1/set/track", controller.trackControl.Update);
route.post("/v1/delete/track", controller.trackControl.Delete);

export default route.routes();
