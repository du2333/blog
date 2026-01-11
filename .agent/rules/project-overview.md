---
trigger: always_on
description: 当你需要了解项目的宏观架构、技术栈选型、全栈数据流向或注入上下文（RequestContext）的实现细节时，参考此 Rule。
---

# 项目架构概览：Flare Stack Blog

本网站采用基于 Cloudflare 生态的现代全栈 TypeScript 架构，通过 TanStack Start 与 Hono 的深度整合实现高性能与类型安全。

## 技术栈与基础设施

该项目深度集成了 Cloudflare 的多项服务：
- **运行时**: Bun
- **计算/托管**: Cloudflare Workers (Pages)
- **数据库**: Cloudflare D1 (SQLite) - 使用 Drizzle ORM
- **对象存储**: Cloudflare R2 (Binding: `R2`) - 存储媒体资源
- **缓存层**: 
    - **KV 存储**: Cloudflare KV (Binding: `KV`) - 用于持久化缓存
    - **CDN 缓存**: 通过 Hono 及 TanStack 中间件控制 SWR (Stale-While-Revalidate) 和 Immutable 缓存头
- **有状态计算**: Durable Objects (Binding: `RATE_LIMITER`) - 实现分布式限流
- **编排流**: Cloudflare Workflows - 处理异步任务（邮件发送、内容后处理、评论审核）
- **人工智能**: Cloudflare Workers AI - 辅助内容生成或搜索
- **身份认证**: Better Auth (与 D1 集成)
- **编辑器与渲染**: 
    - **TipTap**: 用于富文本编辑，集成了多种扩展
    - **Shiki**: 用于代码块的高性能语法高亮

## 核心架构设计

### 路由与分工
项目采用双层路由架构，职责明确：
- **Hono (底层/前置容器)**: 
    - 处理 `Better Auth` 路由 (`/api/auth/*`)
    - 处理媒体资源请求 (`/images/*`)
    - 全局缓存策略控制与 404/500 错误捕捉
    - 代理所有其他请求至 TanStack Start
- **TanStack Start (主业务层)**: 
    - 负责网站大部分业务逻辑路由
    - 通过文件路由 (`src/routes/`) 管理页面渲染与数据 Loaders

### 依赖注入与运行时环境
项目在 `src/server.ts` (Server Entry) 中实现了运行时依赖的手动注入：
- **RequestContext 规范**: 通过 `declare module "@tanstack/react-start"` 自定义 `Register['server']['requestContext']` 类型。
- **DI 注入**: 在 Hono 的全匹配路由中，将 `db` (Drizzle 实例)、`auth`、`env` (Cloudflare Bindings) 以及 `executionCtx` 手动注入到 TanStack Start 的 RequestContext 中，供后续路由和 Server Functions 使用。

### 中间件体系
- **Hono 中间件**: 主要负责全路径的基础控制，如基础限流 (`rateLimitMiddleware`) 和全局缓存头设置。
- **TanStack 中间件**: 位于 `src/lib/middlewares.ts`，利用 `createMiddleware` 定义业务级拦截：
    - `authMiddleware` / `adminMiddleware`: 基于注入的 `context.auth` 进行权限校验。
    - `cachedMiddleware`: 控制 Server Functions 的 SWR 响应头。
    - `createRateLimitMiddleware`: 调用 Durable Object 绑定的限流逻辑。

## 目录结构（src/）

| 目录 | 职责 |
| :--- | :--- |
| `src/features/` | **按功能划分的业务模块。** 每个 Feature 通常包含 `api` (Hono 扩充)、`services` (业务逻辑)、`data` (数据查询及缓存定义)、`schemas.ts` (Schema 与 Zod 定义)。 |
| `src/routes/` | **TanStack 业务路由。** 包含页面组件及数据获取逻辑。 |
| `src/lib/` | **基础设施与公共层。** 包含数据库初始化 (`db/`)、环境定义 (`env/`)、中间件 (`middlewares.ts`) 等。 |
| `src/components/` | **通用 UI 组件。** 原子化的基础 UI 及布局组件。 |

## 数据与逻辑流

1. **入口**: 所有请求首先经过 `src/server.ts` 中的 Hono 容器。
2. **底层路由**: Hono 处理特定的 API 或资源路径；其余路径调用 `handler.fetch`。
3. **注入上下文**: 在进入 TanStack Start 前，手动构造并传递 `context`，确保所有 Server 函数均可访问 `db`、`auth` 和 `env`。
4. **业务路由**: TanStack Router 根据路径匹配组件，调用 Loaders。
5. **逻辑执行**: Loaders 或 Server Functions 通过中间件层校验后，调用 `features/` 下的 Service 执行业务。
6. **渲染**: 结果经 SSR 渲染后返回，并通过中间件定义的缓存头进行 CDN 优化。