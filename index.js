import Koa from "koa";
import bodyParser from "koa-bodyparser";
import KoaStatic from "koa-static";
import path from "path";
import router from "./route/route.js";
import { ifOvertime } from "./controller/index.js";
import utils from "./utils/index.js";

const dirname = path.resolve();
const app = new Koa();

// 配置静态文件访问目录
app.use(KoaStatic(dirname + "/assets"));

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set("X-Response-time", `${ms}ms`);
});

// Logger
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} - ${ctx.url} - ${ms}`);
});

// body-parser
app.use(
  bodyParser({
    jsonLimit: "10000000",
    formLimit: "10000000",
  })
);

// response
app.use(async (ctx, next) => {
  const origin = ctx.request.header.origin;
  ctx.set("Access-Control-Allow-Origin", origin);
  ctx.set(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Credentials, Access-Control-Allow-Methods, Access-Control-Allow-Origin, zhtoken, Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild"
  );
  ctx.set("Access-Control-Allow-Credentials", true);
  ctx.set("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  if (ctx.method == "OPTIONS") {
    ctx.body = 200;
  } else {
    await next();
  }
});

// check token
app.use(async (ctx, next) => {
  console.log("token = ", ctx.headers.zhtoken);
  const token = ctx.headers.zhtoken;
  if (
    ctx.url.indexOf("login") < 0 &&
    ctx.url.indexOf("logout") &&
    ctx.url.indexOf("/get/") < 0
  ) {
    if (await ifOvertime(token)) {
      ctx.body = utils.jsonback(-10001, "", "登录超时，请重新登录");
      return;
    }
  }
  await next();
});

app.use(router);
app.listen(8903);
console.log("成功启动, 请求 http://localhost:8903");
