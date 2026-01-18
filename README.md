# Flare Stack Blog

基于 Hono、Cloudflare Workers 和 TanStack Start 构建的现代化博客 CMS。

## 环境变量配置 (Environment Variables)

本项目使用标准环境变量进行配置。

### 本地开发 (Local Development)

由于 Vite 和 Cloudflare Wrangler 读取不同的文件，本地开发需要配置两个文件：

| 文件        | 用途                                                    | Git 追踪 |
| :---------- | :------------------------------------------------------ | :------: |
| `.env`      | 客户端变量 (`VITE_*`)，被 Vite 读取注入前端。           |    否    |
| `.dev.vars` | 服务端变量，被 Wrangler 读取注入 Worker 的 `env` 对象。 |    否    |

### CI/CD

在 GitHub Repository 的 Settings -> Secrets and variables -> Actions 中设置 Secrets。

### 环境变量列表

| 变量名                       |   作用域 (Scope)    |  必填  | 说明                                                                          |
| :--------------------------- | :-----------------: | :----: | :---------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`         |       Server        | **是** | 用于 Better Auth 会话加密和签名的密钥。                                       |
| `BETTER_AUTH_URL`            |       Server        | **是** | 应用的基础 URL (例如 `https://blog.example.com` 或 `http://localhost:3000`)。 |
| `ADMIN_EMAIL`                |       Server        | **是** | 管理员邮箱地址。用于初始化设置或接收通知。                                    |
| `GITHUB_CLIENT_ID`           |       Server        | **是** | GitHub OAuth App Client ID (用于GitHub登录)。                                 |
| `GITHUB_CLIENT_SECRET`       |       Server        | **是** | GitHub OAuth App Client Secret。                                              |
| `CLOUDFLARE_ZONE_ID`         |       Server        | **是** | Cloudflare Zone ID，用于通过 API 清除 CDN 缓存。                              |
| `CLOUDFLARE_PURGE_API_TOKEN` |       Server        | **是** | 具有清除该区域缓存权限的 Cloudflare API Token。                               |
| `DOMAIN`                     |       Server        | **是** | 博客的域名 (例如 `blog.example.com`)。用于安全检查和路由。                    |
| `D1_DATABASE_ID`             |        CI/CD        | **是** | D1 数据库 ID (用于 GitHub Actions 注入 `wrangler.jsonc`)。                    |
| `KV_NAMESPACE_ID`            |        CI/CD        | **是** | KV 缓存命名空间 ID (用于 GitHub Actions 注入 `wrangler.jsonc`)。              |
| `ENVIRONMENT`                |       Server        |   否   | 环境标识：`dev`, `prod`, 或 `test`。默认为`undefined`。                       |
| `UMAMI_API_KEY`              |       Server        |   否   | Umami 统计 API Key (如果你使用Umami Cloud)。                                  |
| `UMAMI_USERNAME`             |       Server        |   否   | Umami 用户名 (如果你使用自部署)。                                             |
| `UMAMI_PASSWORD`             |       Server        |   否   | Umami 密码 (如果你使用自部署)。                                               |
| `UMAMI_SRC`                  |       Server        |   否   | Umami 统计实例的 URL (例如 `https://analytics.example.com`)。                 |
| `VITE_UMAMI_WEBSITE_ID`      | **Client & Server** |   否   | Umami 统计脚本的 Website ID (服务端和客户端均需使用)。                        |
| `VITE_BLOG_TITLE`            |       Client        |   否   | 博客标题。                                                                    |
| `VITE_BLOG_NAME`             |       Client        |   否   | 博客短名称或 ID。                                                             |
| `VITE_BLOG_AUTHOR`           |       Client        |   否   | 作者名称。                                                                    |
| `VITE_BLOG_DESCRIPTION`      |       Client        |   否   | 博客首页的 SEO 描述。                                                         |
| `VITE_BLOG_GITHUB`           |       Client        |   否   | GitHub 个人主页链接。                                                         |
| `VITE_BLOG_EMAIL`            |       Client        |   否   | 联系邮箱。                                                                    |
