# Flare Stack Blog

基于 Cloudflare Workers 的现代化全栈博客 CMS。

## 核心功能

- **文章管理** — 富文本编辑器，支持代码高亮、图片上传、草稿/发布流程
- **标签系统** — 灵活的文章分类
- **评论系统** — 支持嵌套回复、邮件通知、审核机制
- **全文搜索** — 基于 Orama 的高性能搜索
- **媒体库** — R2 对象存储，图片管理与优化
- **用户认证** — GitHub OAuth 登录，权限控制
- **数据统计** — Umami 集成，访问分析与热门文章
- **AI 辅助** — Cloudflare Workers AI 集成

## 技术栈

### Cloudflare 生态

| 服务            | 用途                         |
| :-------------- | :--------------------------- |
| Workers         | 边缘计算与托管               |
| D1              | SQLite 数据库                |
| R2              | 对象存储（媒体文件）         |
| KV              | 缓存层                       |
| Durable Objects | 分布式限流                   |
| Workflows       | 异步任务（邮件、内容审核等） |
| Workers AI      | AI 能力                      |

### 前端

- **框架**：React 19 + TanStack Router/Query
- **样式**：TailwindCSS 4
- **表单**：React Hook Form + Zod
- **图表**：Recharts

### 后端

- **网关层**：Hono（认证路由、媒体服务、缓存控制）
- **业务层**：TanStack Start（SSR、Server Functions）
- **数据库**：Drizzle ORM + drizzle-zod
- **认证**：Better Auth（GitHub OAuth）

### 编辑器

TipTap 富文本 + Shiki 代码高亮

### 目录结构

```
src/
├── features/
│   ├── posts/                  # 文章管理（其他模块结构类似）
│   │   ├── api/                # Server Functions（对外接口）
│   │   ├── data/               # 数据访问层（Drizzle 查询）
│   │   ├── posts.service.ts    # 业务逻辑
│   │   ├── posts.schema.ts     # Zod Schema + 缓存 Key 工厂
│   │   ├── components/         # 功能专属组件
│   │   ├── queries/            # TanStack Query Hooks
│   │   └── workflows/          # Cloudflare Workflows
│   ├── comments/    # 评论、嵌套回复、审核
│   ├── tags/        # 标签管理
│   ├── media/       # 媒体上传、R2 存储
│   ├── search/      # Orama 全文搜索
│   ├── auth/        # 认证、权限控制
│   ├── dashboard/   # 管理后台数据统计
│   ├── email/       # 邮件通知（Resend）
│   ├── cache/       # KV 缓存服务
│   ├── config/      # 博客配置
│   └── ai/          # Workers AI 集成
├── routes/
│   ├── _public/     # 公开页面（首页、文章列表/详情、搜索）
│   ├── _auth/       # 登录/注册相关页面
│   ├── _user/       # 用户相关页面
│   ├── admin/       # 管理后台（文章、评论、媒体、标签、设置）
│   ├── rss[.]xml.ts     # RSS Feed
│   ├── sitemap[.]xml.ts # Sitemap
│   └── robots[.]txt.ts  # Robots.txt
├── components/      # UI 组件（ui/, common/, layout/, tiptap-editor/）
├── lib/             # 基础设施（db/, auth/, hono/, middlewares）
└── hooks/           # 自定义 Hooks
```

### 请求流程

```
请求 → Cloudflare CDN（边缘缓存）
         ↓ 未命中
      server.ts（Hono 入口）
         ├── /api/auth/* → Better Auth
         ├── /images/*   → R2 媒体服务
         └── 其他        → TanStack Start
                              ↓
                         中间件注入（db, auth, session）
                              ↓
                         路由匹配 + Loader 执行
                              ↓
                  KV 缓存 ←→ Service 层 ←→ D1 数据库
                              ↓
                         SSR 渲染（带缓存头）
```

## 部署指南

### 前置准备

1. **Cloudflare 账号** — 需绑定付款方式以启用 R2、Workers AI、Images 等服务（免费额度充足，个人博客基本用不完）
2. **创建 Cloudflare 资源**：
   - R2 存储桶（名称必须为 `blog`）
   - D1 数据库（记录 Database ID）
   - KV 命名空间（记录 Namespace ID）
3. **域名托管** — 将域名 DNS 托管到 Cloudflare 以使用免费 CDN
4. **获取 Cloudflare 凭证**：
   - Dashboard 中获取 Zone ID 和 Account ID
   - 创建 API Token（需要 Purge CDN 权限）
   - 创建 API Token（需要 Worker 部署 + D1 读写权限）
5. **GitHub OAuth App** — 在 GitHub Developer Settings 创建 OAuth App，获取 Client ID 和 Secret
   - Authorization callback URL：`https://<your-domain>/api/auth/callback/github`

---

### 方式一：GitHub Actions 自动部署

> 使用 GitHub Actions CI/CD（每月 2000 分钟免费额度）。后续更新只需 Sync Fork 即可自动触发部署。

1. Fork 本仓库
2. 在 GitHub 仓库 **Settings → Secrets and variables → Actions** 中配置变量
3. 进入 Actions 页面，手动触发 `Deploy` 工作流

CI/CD 会自动完成数据库迁移、构建、部署和 CDN 缓存清理。

#### GitHub Secrets（必填）

| 变量名                       | 类型   | 说明                                              |
| :--------------------------- | :----- | :------------------------------------------------ |
| `CLOUDFLARE_API_TOKEN`       | CI/CD  | Cloudflare API Token（Worker 部署 + D1 读写权限） |
| `CLOUDFLARE_ACCOUNT_ID`      | CI/CD  | Cloudflare Account ID                             |
| `D1_DATABASE_ID`             | CI/CD  | D1 数据库 ID                                      |
| `KV_NAMESPACE_ID`            | CI/CD  | KV 命名空间 ID                                    |
| `BETTER_AUTH_SECRET`         | 运行时 | 会话加密密钥，运行 `openssl rand -hex 32` 生成    |
| `BETTER_AUTH_URL`            | 运行时 | 应用 URL（如 `https://blog.example.com`）         |
| `ADMIN_EMAIL`                | 运行时 | 管理员邮箱，注册的用户会按照该邮箱授予管理员权限  |
| `GH_CLIENT_ID`               | 运行时 | GitHub OAuth Client ID                            |
| `GH_CLIENT_SECRET`           | 运行时 | GitHub OAuth Client Secret                        |
| `CLOUDFLARE_ZONE_ID`         | 运行时 | Cloudflare Zone ID                                |
| `CLOUDFLARE_PURGE_API_TOKEN` | 运行时 | 具有 Purge CDN 权限的 API Token                   |
| `DOMAIN`                     | 运行时 | 博客域名（如 `blog.example.com`）                 |

> **类型说明**：
>
> - **CI/CD**：仅用于 GitHub Actions 构建部署，方式二用户无需配置
> - **运行时**：Worker 运行时使用，方式二用户在 Worker Settings 中配置

#### GitHub Secrets（可选，Umami 统计）

| 变量名           | 类型   | 说明                         |
| :--------------- | :----- | :--------------------------- |
| `UMAMI_SRC`      | 运行时 | Umami 实例 URL               |
| `UMAMI_API_KEY`  | 运行时 | Umami API Key（Umami Cloud） |
| `UMAMI_USERNAME` | 运行时 | Umami 用户名（自部署）       |
| `UMAMI_PASSWORD` | 运行时 | Umami 密码（自部署）         |

#### GitHub Variables（可选，客户端配置）

| 变量名                  | 类型   | 说明                       |
| :---------------------- | :----- | :------------------------- |
| `VITE_UMAMI_WEBSITE_ID` | 构建时 | Umami Website ID           |
| `VITE_BLOG_TITLE`       | 构建时 | 博客标题                   |
| `VITE_BLOG_NAME`        | 构建时 | 博客短名称，显示在导航栏上 |
| `VITE_BLOG_AUTHOR`      | 构建时 | 作者名称                   |
| `VITE_BLOG_DESCRIPTION` | 构建时 | 博客描述，显示在主页上     |
| `VITE_BLOG_GITHUB`      | 构建时 | GitHub 主页链接            |
| `VITE_BLOG_EMAIL`       | 构建时 | 联系邮箱                   |

> **构建时变量**：在 Vite 构建时注入到客户端代码，方式二用户在 Build Variables 中配置

---

### 方式二：Cloudflare Dashboard 自动部署

> 使用 Cloudflare Workers Builds CI/CD（每月 3000 分钟免费额度）。后续更新 Sync Fork 后会自动触发部署，`wrangler.jsonc` 通常可自动合并无冲突。

1. Fork 本仓库
2. 复制 `wrangler.example.jsonc` 为 `wrangler.jsonc`，填入 D1、KV 的资源 ID 和你的域名（替换 `DOMAIN_PLACEHOLDER`）
3. 在 Cloudflare Dashboard 创建 Worker，连接你的 GitHub 仓库
4. 配置构建设置：
   - Build command: `bun run build`
   - Deploy command: `bun run deploy`
   - 构建时变量：`BUN_VERSION`: `1.3.5`
   - 构建时变量：所有 `VITE_*` 开头的客户端变量
5. 部署完成后，在 **Worker Settings → Variables and Secrets** 中配置运行时变量

> **注意**：运行时变量名与方式一略有不同：
>
> - `GH_CLIENT_ID` → `GITHUB_CLIENT_ID`
> - `GH_CLIENT_SECRET` → `GITHUB_CLIENT_SECRET`
>
> 其余变量名保持一致。Cloudflare 会自动创建带 D1 权限的 API Token，数据库迁移会在部署时自动执行。
>
> **CDN 缓存**：方式二不会自动清除 CDN 缓存，部署后可在博客后台「设置」页面手动清除。

---

## 本地开发

由于 Vite 和 Wrangler 读取不同的配置文件：

| 文件        | 用途                                   |
| :---------- | :------------------------------------- |
| `.env`      | 客户端变量（`VITE_*`），Vite 读取      |
| `.dev.vars` | 服务端变量，Wrangler 注入 Worker `env` |
