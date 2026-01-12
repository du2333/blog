---
trigger: always_on
description: 当你需要添加新功能模块、编写 Server Functions、处理 KV/CDN 缓存失效逻辑、实现无限滚动或编写自动化测试时，参考此 Rule。
---

# 项目开发模式与实践

本文档记录了 Flare Stack Blog 项目中推荐遵循的编码模式和最佳实践。

---

## 后端模式

### 模块分层

每个功能模块 (features/<name>) 应遵循以下层次结构：

1.  **Data Layer (data/[name].data.ts)**
    - **职责**: 纯粹的数据访问。所有 Drizzle ORM 查询封装在此。
    - **依赖**: 仅接收 DB 实例。
    - **禁止**: 不包含业务逻辑、缓存操作、API 交互。
    - **示例**: PostRepo.findPostById(db, id) 直接返回 Drizzle 查询结果。

2.  **Service Layer ([name].service.ts)**
    - **职责**: 业务逻辑编排。处理数据转换、缓存策略、调用其他 Service 或 Data 函数。
    - **依赖**: 接收 Context 对象（包含 db, env, executionCtx 等）。
    - **缓存**: Service 层是调用 CacheService.get 和 CacheService.bumpVersion 的唯一位置。
    - **示例**:
      ```typescript
      // posts.service.ts
      export async function findPostBySlug(context, data) {
        const fetcher = () => PostRepo.findPostBySlug(context.db, data.slug);
        const version = await CacheService.getVersion(context, "posts:detail");
        return CacheService.get(
          context,
          [version, data.slug],
          PostSchema,
          fetcher,
        );
      }
      ```

3.  **API Layer (api/[name].api.ts)**
    - **职责**: 定义 Server Functions 作为前端 RPC 入口。处理权限校验、输入校验。
    - **工具函数**:
      - createCachedFn(): 用于公开接口，应用 cachedMiddleware 添加 SWR 响应头。
      - createAdminFn(): 用于管理接口，应用 noCacheMiddleware (私有缓存) 和 adminMiddleware (权限校验)。
      - createAuthedFn(): 用于已登录用户接口，仅校验用户身份。
    - **示例**:
      ```typescript
      // posts.admin.api.ts
      export const updatePostFn = createAdminFn({ method: "POST" })
        .inputValidator(UpdatePostInputSchema) // Zod 校验
        .handler(({ data, context }) => PostService.updatePost(context, data));
      ```

### Schema 定义 ([name].schema.ts)

- 使用 drizzle-zod 的 createSelectSchema, createInsertSchema, createUpdateSchema 从 Drizzle 表结构自动生成基础 Schema。
- 在此基础上使用 Zod 的 .extend(), .pick(), .omit() 派生出 API 参数 and 返回值 Schema。
- **类型导出**: 同时导出 z.infer<typeof Schema> 类型。

---

## 前端模式

### 数据获取

项目遵循 **TanStack Start / TanStack Query** 的标准实践，以实现 SSR 和客户端缓存的无缝衔接。

1.  **Query Definition ([name].query.ts)**
    - 集中定义 TanStack Query 查询配置。使用 queryOptions 和 infiniteQueryOptions 工厂函数。
    - **示例**:
      ```typescript
      // posts.query.ts
      export function postBySlugQuery(slug: string) {
        return queryOptions({
          queryKey: ["post", slug],
          queryFn: () => findPostBySlugFn({ data: { slug } }),
        });
      }
      ```

2.  **Route Loader (routes/<path>.tsx)**
    - 使用 loader 函数和 context.queryClient.ensureQueryData()（或 prefetchQuery/prefetchInfiniteQuery）进行预取。
    - loader 的返回值可通过 loaderData 在 head 函数中用于 SEO (如动态 Title)。
    - **示例**:
      ```typescript
      // $slug.tsx
      export const Route = createFileRoute("/_public/post/$slug")({
        loader: async ({ context, params }) => {
          const post = await context.queryClient.ensureQueryData(
            postBySlugQuery(params.slug),
          );
          if (!post) throw notFound();
          return post;
        },
        head: ({ loaderData: post }) => ({
          meta: [{ title: post?.title }],
        }),
        // ...
      });
      ```

3.  **Component Data Access**
    - 组件中使用 useSuspenseQuery 或 useSuspenseInfiniteQuery 读取数据。由于 Loader 已预取，此过程通常是同步的。
    - **示例**:
      ```typescript
      function PostComponent() {
        const { data: post } = useSuspenseQuery(postBySlugQuery(params.slug));
        // ...
      }
      ```

4.  **无限滚动 (Infinite Scroll)**
    - 使用 IntersectionObserver 观察一个底部占位元素。
    - 当元素进入视口时，调用 fetchNextPage()。
    - 配合 hasNextPage 和 isFetchingNextPage 控制 UI 状态。

### Skeleton / Pending

- 为关键路由定义 pendingComponent，在数据加载时 (特别是客户端导航时) 显示骨架屏。

---

## 缓存策略

项目采用双层缓存策略：

### CDN 层 (HTTP Headers)

- 通过 TanStack 中间件 (如 cachedMiddleware) 设置 Cache-Control 响应头 (Stale-While-Revalidate)。
- **失效**: 调用 purgePostCDNCache 或 Cloudflare API 进行 CDN 缓存清除。

### KV 层 (Cloudflare KV)

- 用于持久化较长生命周期的数据（如博文列表、详情）。
- **缓存键策略 (Versioned Key Invalidation)**:
  1.  使用 CacheService.getVersion(context, "<namespace>") 获取当前缓存版本号 (如 "v1")。
  2.  将版本号作为缓存键数组的第一个元素，如 [version, "post", slug]。
  3.  **失效**: 调用 CacheService.bumpVersion(context, "<namespace>") 升级版本号。旧版本键会自动过期（TTL）或立即失效（键未命中）。
  4.  **直接删除**: 对于单条记录，可使用 CacheService.deleteKey(context, ['post', slug]) 进行精确删除。

---

## 中间件

### Hono 中间件 (lib/hono/middlewares.ts)

- 全局中间件，如基础 cacheMiddleware 和 rateLimitMiddleware。
- 在 routes.ts 中通过 app.get/post 直接应用。

### TanStack 中间件 (lib/middlewares.ts)

- 用于 Server Functions 鉴权与业务级控制。
- 使用 createMiddleware() 定义，通过 .middleware([...]) 链式调用。
- 标准中间件:
  - authMiddleware: 校验用户登录状态。
  - adminMiddleware: 校验管理员权限 (依赖 authMiddleware)。
  - cachedMiddleware / noCacheMiddleware: 设置缓存响应头。
  - createRateLimitMiddleware: 调用 Durable Object 进行限流。

---

## 测试规范

项目使用 **Vitest** 结合 **Cloudflare Workers Vitest Pool** 进行测试。

> **详细指南**: 请参考 [Testing Rule](testing.md) 获取完整的测试架构、依赖注入模式、Mocking 策略和最佳实践。

### 常用命令

- `bun test`: 运行所有测试。
- `bun test <pattern>`: 运行匹配特定模式的测试。

---

## 代码质量检查

每次完成代码变更后，**必须**运行以下命令确保代码质量：

1.  **类型检查**:

    ```bash
    bun tsc --noEmit
    ```

    确保 TypeScript 类型无误。

2.  **Lint & Format**:

    ```bash
    bun check
    ```

    该命令执行 bun lint:fix && bun format，自动修复 ESLint 问题并格式化代码。

3.  **测试** (如有相关变更):
    ```bash
    bun test
    ```

---

## 环境变量

项目仅使用服务端环境变量，通过 Zod 进行类型安全校验。

### 文件位置

- src/lib/env/server.env.ts

### 使用方式

```typescript
import { serverEnv } from "@/lib/env/server.env";

// 在需要访问环境变量的地方调用
const env = serverEnv(context.env); // context.env 来自 Cloudflare Bindings
const domain = env.DOMAIN;
```

### Zod Schema 定义

所有环境变量在 serverEnvSchema 中定义。新增环境变量时，需同步更新该 Schema。

### 配置文件

- .dev.vars: 本地开发环境变量 (不提交)
- Cloudflare Dashboard / Wrangler Secrets: 生产环境变量

---

## Cloudflare Workflows

用于复杂的、需要持久化状态的异步任务编排。

### 结构

- 继承 WorkflowEntrypoint<Env, Params>。
- 在 run(event, step) 方法中定义流程。
- 使用 step.do("step name", async () => { ... }) 定义可重试的原子步骤。

### 重试配置

```typescript
await step.do("step name", {
  retries: { limit: 3, delay: "5 seconds", backoff: "exponential" },
}, async () => { ... });
```

### 触发

通过 Cloudflare Binding 创建 Workflow 实例:

```typescript
await context.env.POST_PROCESS_WORKFLOW.create({
  params: { postId, isPublished },
});
```

### 注册

Workflow 类需在 src/server.ts 中导出，并在 wrangler.jsonc 的 workflows 数组中声明。

---

## 配置与常量

### 站点配置 (blog.config.ts)

- **职责**: 存放站点级别的静态配置，如站点名称、描述、社交链接。
- **导出**: blogConfig 对象及 BlogConfig 类型。

### 缓存常量 (lib/constants.ts)

- CACHE_CONTROL: 预定义的 HTTP 缓存策略对象，用于中间件设置响应头。
  - swr: Stale-While-Revalidate 策略。
  - immutable: 不可变资源 (如带 Hash 的静态文件)。
  - private: 禁止缓存。
  - notFound / serverError: 错误页短期缓存。

---

## UI 组件结构

### src/components/ 目录

| 子目录  | 职责                                                                                        |
| :------ | :------------------------------------------------------------------------------------------ |
| ui/     | 原子级 UI 组件 (Button, Input, Card 等)，通常使用 cva (class-variance-authority) 定义变体。 |
| common/ | 通用业务组件 (ThemeProvider, LoadingFallback 等)。                                          |
| layout/ | 布局组件 (Header, Footer, Sidebar 等)。                                                     |

### 特性组件

特定于某个 Feature 的组件应放在 features/<name>/components/ 下。

---

## 通用 Hooks (src/hooks/)

存放跨 Feature 可复用的自定义 React Hooks。

| Hook                 | 职责                     |
| :------------------- | :----------------------- |
| use-debounce.ts      | 通用防抖。               |
| use-media-query.ts   | 响应式媒体查询。         |
| use-navigate-back.ts | 带 fallback 的路由返回。 |
| use-active-toc.ts    | 目录激活状态联动。       |

---

## 命名约定

### 文件命名

- **组件与 Hook**: 使用 kebab-case.tsx 或 kebab-case.ts。
  - 示例: post-item.tsx, use-debounce.ts。
- **功能层级**: 使用 [name].[layer].ts 格式。
  - 示例: posts.service.ts, posts.api.ts, posts.schema.ts。

### 代码命名

- **React 组件**: PascalCase (如 PostItem)。
- **变量与函数**: camelCase (如 getPosts)。
- **常量**: SCREAMING_SNAKE_CASE (如 CACHE_CONTROL)。
- **Server Functions**: 以 Fn 结尾 (如 getPostsFn)，以便与 Service 函数区分。
- **类型与接口**: PascalCase (如 PostItemProps)。