# 接口请求

### 登陆

- path： /v1/login
- params: {
  account: string;
  pwd: string;
  }
- return

```
res {
    code: number;
    data: Object{};
    msg: string;
}
```

### 登出

- path： /v1/logout
- method: POST
- return

```
res {
    code: number;
    data: Object{};
    msg: string;
}
```

### 确认登陆状态

- path： /v1/login
- method: POST
- return

```
res {
    code: number;
    data: Object{};
    msg: string;
}
```

## 公司信息

### 获取

- path： /v1/get/info
- method: GET
- params: {
  name: string;
  }
- return

```
res {
    code: number;
    data: Object{};
    msg: string;
}
```

### 设置

- path： /v1/set/info
- method: POST
- params: {
  name: string;
  }
- return

```
res {
    code: number;
    data: Object{};
    msg: string;
}
```

### 新增

### 删除

## 轮播图

### 获取

### 保存

### 删除

## 亮点业务

### 获取

### 设置

### 新增

### 删除

## 合作伙伴

### 获取

### 设置

### 新增

### 删除

## 优势内容

### 获取

### 设置

### 新增

### 删除

## 相关服务

### 获取

### 设置

### 新增

### 删除

## 新闻动态

### 获取

- path： /v1/get/news
- method: POST
- params: {
  name: string;
  }
- return

```
res {
    code: number;
    data: Object{};
    msg: string;
}
```

### 设置

- path： /v1/set/news
- method: POST
- params: {
  name: string;
  }
- return

```
res {
    code: number;
    data: Object{};
    msg: string;
}
```

### 新增

- path： /v1/add/news
- method: POST
- params: {
  name: string;
  }
- return

```
res {
    code: number;
    data: Object{};
    msg: string;
}
```

### 删除

- path： /v1/delete/news
- method: POST
- params: {
  name: string;
  }
- return

```
res {
    code: number;
    data: Object{};
    msg: string;
}
```

## 招聘信息

### 获取

### 设置

### 新增

### 删除

## 联系我们

### 新增

## 获取
