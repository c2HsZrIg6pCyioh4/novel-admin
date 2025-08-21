# Novel Admin

## 启动
```bash
# 1) 初始化
pnpm i   # 或 npm i / yarn

# 2) 本地开发
pnpm dev # 默认 http://localhost:5174

# 3) 构建
pnpm build && pnpm preview
```

## 配置
- 修改 `.env.development` 的 `VITE_API_BASE` 指向你的 Go 服务（例如 `http://localhost:31371`）。
- 如果后端开启了 Token 中间件，把 `VITE_AUTH_ENABLED=true`，并在页面右上角粘贴 Token。

## CORS 提示
- 前端仅设置 `Authorization` / `Content-Type` 请求头。
- 预检放行需要 **后端** 设置：
  - `Access-Control-Allow-Origin: http://localhost:5174`
  - `Access-Control-Allow-Headers: Authorization, Content-Type`
  - `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`

## 接口字段兼容
- 小说主键在结构体是 `Novel_Id`，JSON tag 是 `novel_id`。本项目对 `novel_id | novel_Id | Novel_Id` 均做了兼容读取。

## 对接清单
- 小说：列表/详情/新增/编辑/删除
- 章节目录：`GET /novels/{novel_id}/chapters`
- 章节正文：阅读/新增（自动续章）/编辑/删除（仅最新章）
