---
trigger: model_decision
description: 当你需要编写、调试或重构测试时，参考此 Rule。包含了测试架构、依赖注入模式、数据库与 Auth Mocking 以及 Workflow 测试的最佳实践。
---

# 测试架构与实践指南

本项目采用 **Vitest** 结合 **Cloudflare Workers Vitest Pool** 进行测试。这意味着测试在极其接近生产环境的 Miniflare 隔离环境中运行，可以直接访问模拟的 D1 数据库、KV 存储和 R2 存储。

---

## 核心架构

### 1. 运行环境

- **Integration over Unit**: 我们倾向于编写集成测试而非纯粹的单元测试。
- **Workers Pool**: 每个测试文件（或 worker）拥有独立的 D1 数据库和 KV 命名空间副本（基于 `vitest.config.ts` 配置）。这保证了测试间的隔离性，无需手动清理数据库。

### 2. 依赖注入 (DI) vs HTTP Server

为了提高测试速度和便捷性，我们通常**不**直接启动 Hono HTTP Server 发起 `fetch` 请求。相反，我们采用 **手动注入 Context** 的方式直接调用 Service 或 API Handler。

- **优势**: 
  - 更快的执行速度（跳过 HTTP 解析）。
  - 更容易 Mock 用户 Session 和 环境变量。
  - 直接获得强类型的返回值。

---

## 测试工具库 (`tests/test-utils.ts`)

所有测试应依赖 `tests/test-utils.ts` 提供的 Helper 函数，严禁手动构造 `any` 类型的 Context。

| 函数 | 描述 |
| :--- | :--- |
| `createTestContext(overrides)` | 创建基础 `Context`，包含真实的 DB/KV 绑定和 Mock 的 Workflow/Env。 |
| `createAuthTestContext(overrides)` | 创建包含普通用户 Session 的 Context。 |
| `createAdminTestContext(overrides)` | 创建包含 **管理员** Session 的 Context。 |
| `seedUser(db, user)` | 在 DB 中预先插入用户数据（用于满足外键约束）。 |
| `waitForBackgroundTasks(executionCtx)` | 等待 `waitUntil` 中的异步任务（如缓存写入）完成。 |

---

## 编写测试模式

### 1. Service 层测试 (推荐)

Service 层包含主要业务逻辑。测试时，直接调用 Service 函数并传入 Mock Context。

```typescript
import { createAdminTestContext, seedUser } from "tests/test-utils";
import * as PostService from "./posts.service";

describe("PostService", () => {
  it("should create post", async () => {
    // 1. Setup Context
    const context = createAdminTestContext();
    await seedUser(context.db, context.session.user); // 写入当前用户到 DB

    // 2. Execute
    const post = await PostService.createEmptyPost(context);

    // 3. Verify
    expect(post.title).toBe("");
    expect(post.status).toBe("draft");
  });
});
```

### 2. 测试异步任务与缓存

当业务逻辑包含 `context.executionCtx.waitUntil` (如写缓存、发送异步请求) 时，必须显式等待任务完成，否则测试可能在断言前结束或导致资源泄漏。

```typescript
import { waitForBackgroundTasks } from "tests/test-utils";

it("should cache data", async () => {
  // Trigger logic that writes to KV using waitUntil
  await PostService.findPostBySlug(context, { slug: "hello" });

  // Critical: Wait for KV write
  await waitForBackgroundTasks(context.executionCtx);

  // Assert KV state
  const cached = await context.env.KV.get("key");
  expect(cached).not.toBeNull();
});
```

### 3. Mocking Workflows

项目使用了 Cloudflare Workflows。在 `test-utils.ts` 中，我们默认 spy 了所有 Workflow 的 `create` 方法。

```typescript
// test-utils.ts 默认行为
vi.spyOn(context.env.POST_PROCESS_WORKFLOW, "create").mockResolvedValue({ id: "mock-id" });

// 在测试中验证
import { expect } from "vitest";

it("should trigger workflow", async () => {
  await PostService.publishPost(context, { id: 1 });
  
  expect(context.env.POST_PROCESS_WORKFLOW.create).toHaveBeenCalledWith({
    params: { postId: 1 }
  });
});
```

---

## 常见问题与最佳实践

1.  **数据库外键错误**: 
    - D1 严格执行外键约束。如果你在创建 Post 时报错 `FOREIGN KEY constraint failed`，通常是因为 `authorId` 对应的 User 不在 `users` 表中。
    - **解决**: 使用 `await seedUser(context.db, context.session.user)` 预先插入用户。

2.  **Mock 日期**: 
    - 使用 `vi.useFakeTimers()` 和 `vi.setSystemTime()` 来测试时间敏感逻辑（如 Ban 过期、发布时间）。
    - 测试结束记得 `vi.useRealTimers()`。

3.  **类型安全**:
    - 严禁使用 `as any`。
    - 如果 `test-utils` 的 Mock 类型不匹配，请更新 `test-utils.ts` 而不是在测试文件中强行转类。

4.  **文件位置**:
    - 测试文件应与源文件同目录，命名为 `[filename].test.ts`。