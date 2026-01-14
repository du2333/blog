---
name: testing-guide
description: Testing architecture and best practices for the Flare Stack Blog. Use when writing, debugging, or refactoring tests with Vitest and Cloudflare Workers pool.
---

# Testing Architecture Guide

The project uses **Vitest** with **Cloudflare Workers Vitest Pool** for testing in a near-production Miniflare environment.

## Core Architecture

### Integration over Unit

We favor integration tests over pure unit tests. Tests run in isolated Miniflare environments with real D1, KV, and R2 bindings.

### Workers Pool Isolation

Each test file (worker) gets its own D1 database and KV namespace copy (configured in `vitest.config.ts`). This guarantees test isolation without manual cleanup.

### Dependency Injection vs HTTP

For speed and convenience, we **don't** start an HTTP server. Instead, we manually inject Context and call services/handlers directly.

**Benefits**:

- Faster execution (no HTTP parsing)
- Easier session mocking
- Strong typing on return values

## Test Utilities (`tests/test-utils.ts`)

All tests should use these helpers. **Never manually construct `any` typed Context.**

| Function                            | Returns       | Description                                       |
| :---------------------------------- | :------------ | :------------------------------------------------ |
| `createTestDb()`                    | `DB`          | Creates a Drizzle DB instance from test env       |
| `createTestContext(overrides)`      | `AuthContext` | Base context with real DB/KV, mocked Workflows    |
| `createAuthTestContext(overrides)`  | `AuthContext` | Context with regular user session                 |
| `createAdminTestContext(overrides)` | `AuthContext` | Context with **admin** session                    |
| `createMockSession(overrides)`      | `Session`     | Creates a mock session object                     |
| `createMockAdminSession()`          | `Session`     | Creates a mock admin session                      |
| `seedUser(db, user)`                | `void`        | Insert user into DB (for foreign key constraints) |
| `waitForBackgroundTasks(ctx)`       | `void`        | Wait for `waitUntil` tasks to complete            |

## Writing Tests

### Service Layer Tests (Recommended)

Service layer contains core business logic. Test by calling services with mocked Context:

```typescript
import { createAdminTestContext, seedUser } from "tests/test-utils";
import * as PostService from "./posts.service";

describe("PostService", () => {
  it("should create post", async () => {
    // 1. Setup Context
    const context = createAdminTestContext();
    await seedUser(context.db, context.session.user);

    // 2. Execute
    const post = await PostService.createEmptyPost(context);

    // 3. Verify
    expect(post.title).toBe("");
    expect(post.status).toBe("draft");
  });
});
```

### Testing Async Tasks & Cache

When logic includes `waitUntil` (cache writes, async requests), explicitly wait before assertions:

```typescript
import { waitForBackgroundTasks } from "tests/test-utils";

it("should cache data", async () => {
  // Trigger logic that writes to KV
  await PostService.findPostBySlug(context, { slug: "hello" });

  // Critical: Wait for background tasks
  await waitForBackgroundTasks(context.executionCtx);

  // Assert KV state
  const cached = await context.env.KV.get("key");
  expect(cached).not.toBeNull();
});
```

### Mocking Workflows

`test-utils.ts` spies on all Workflow `create` methods by default:

```typescript
// Default behavior in test-utils.ts
vi.spyOn(context.env.POST_PROCESS_WORKFLOW, "create").mockResolvedValue({
  id: "mock-id",
});

// Verify in tests
it("should trigger workflow", async () => {
  await PostService.publishPost(context, { id: 1 });

  expect(context.env.POST_PROCESS_WORKFLOW.create).toHaveBeenCalledWith({
    params: { postId: 1 },
  });
});
```

### Mocking Dates

Use Vitest's fake timers for time-sensitive logic:

```typescript
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-01-15"));
});

afterEach(() => {
  vi.useRealTimers();
});

it("should check expiry", async () => {
  // Test with controlled time
});
```

## Common Issues & Solutions

### Foreign Key Errors

D1 strictly enforces foreign keys. If you see `FOREIGN KEY constraint failed`:

```typescript
// Solution: Seed the user first
await seedUser(context.db, context.session.user);
```

### Type Safety

- **Never use `as any`**
- If mock types don't match, update `test-utils.ts` instead of forcing types in tests

### File Organization

Test files live alongside source files:

```
src/features/posts/
├── posts.service.ts
├── posts.service.test.ts  # <-- Here
└── ...
```

## Running Tests

```bash
# Run all tests
bun run test

# Run specific pattern
bun run test posts

# Run single file
bun run test src/features/posts/posts.service.test.ts
```

## Test Structure Template

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createAdminTestContext,
  seedUser,
  waitForBackgroundTasks,
} from "tests/test-utils";
import * as MyService from "./my.service";

describe("MyService", () => {
  describe("myFunction", () => {
    it("should do expected behavior", async () => {
      // Arrange
      const context = createAdminTestContext();
      await seedUser(context.db, context.session.user);

      // Act
      const result = await MyService.myFunction(context, { input: "value" });

      // Assert
      expect(result).toMatchObject({ expected: "output" });
    });

    it("should handle edge case", async () => {
      // ...
    });
  });
});
```
