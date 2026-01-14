---
name: backend-development
description: Backend development patterns for the Flare Stack Blog. Use when creating new feature modules, writing Server Functions, defining Zod schemas, implementing Cloudflare Workflows, or working with middlewares.
---

# Backend Development Patterns

This skill covers the backend module architecture, Server Functions, schema definitions, and async workflows.

## Module Layering

Each feature module (`features/<name>`) follows a strict three-layer architecture:

### 1. Data Layer (`data/[name].data.ts`)

- **Responsibility**: Pure data access. All Drizzle ORM queries live here.
- **Dependencies**: Only receives the DB instance.
- **Prohibited**: No business logic, no caching, no API interactions.

```typescript
// posts.data.ts
export const PostRepo = {
  findPostById: (db: DB, id: number) =>
    db.select().from(posts).where(eq(posts.id, id)).get(),
};
```

### 2. Service Layer (`[name].service.ts`)

- **Responsibility**: Business logic orchestration. Data transformation, caching, calling other services.
- **Dependencies**: Receives typed Context object. Use the most specific type needed:
  - `DbContext` for database-only operations
  - `DbContext & { executionCtx: ExecutionContext }` for operations with background tasks
  - `AuthContext` for authenticated operations
- **Caching**: This is the ONLY layer that calls `CacheService.get()` and `CacheService.bumpVersion()`.

```typescript
// posts.service.ts
export async function findPostBySlug(
  context: DbContext & { executionCtx: ExecutionContext },
  data: { slug: string }
) {
  const fetcher = () => PostRepo.findPostBySlug(context.db, data.slug);
  const version = await CacheService.getVersion(context, "posts:detail");
  return CacheService.get(context, [version, data.slug], PostSchema, fetcher);
}

export async function createEmptyPost(context: DbContext) {
  // No executionCtx needed - simple DB operation
  return await PostRepo.insertPost(context.db, { ... });
}
```

### 3. API Layer (`api/[name].api.ts`)

- **Responsibility**: Define Server Functions as frontend RPC entry points. Handle auth and input validation.
- **Pattern**: Use `createServerFn()` with middleware chains to progressively build context.

#### Middleware Composition

```typescript
import { createServerFn } from "@tanstack/react-start";
import {
  adminMiddleware,
  createCacheHeaderMiddleware,
  createRateLimitMiddleware,
} from "@/lib/middlewares";

// Public endpoint with caching
export const getPostsFn = createServerFn()
  .middleware([
    createRateLimitMiddleware({
      capacity: 60,
      interval: "1m",
      key: "posts:list",
    }),
    createCacheHeaderMiddleware("swr"), // Sets Cache-Control headers
  ])
  .inputValidator(GetPostsInputSchema)
  .handler(({ data, context }) => PostService.getPosts(context, data));

// Admin endpoint (private cache + auth required)
export const updatePostFn = createServerFn()
  .middleware([adminMiddleware]) // Includes dbMiddleware + sessionMiddleware + auth check + private cache
  .inputValidator(UpdatePostInputSchema)
  .handler(({ data, context }) => PostService.updatePost(context, data));
```

#### Cache Header Strategies

| Strategy      | Header                 | Use Case             |
| :------------ | :--------------------- | :------------------- |
| `"private"`   | no-store, private      | Auth/admin responses |
| `"immutable"` | Long-term immutable    | Hashed static assets |
| `"swr"`       | Stale-while-revalidate | General caching      |

## Schema Definitions (`[name].schema.ts`)

Use `drizzle-zod` to auto-generate base schemas from Drizzle table definitions:

```typescript
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { posts } from "@/lib/db/schema";

// Base schemas
export const PostSelectSchema = createSelectSchema(posts);
export const PostInsertSchema = createInsertSchema(posts);

// Derived API schemas
export const CreatePostInputSchema = PostInsertSchema.pick({
  title: true,
  content: true,
});
export const PostResponseSchema = PostSelectSchema.extend({
  author: UserSchema,
});

// Type exports
export type Post = z.infer<typeof PostSelectSchema>;
export type CreatePostInput = z.infer<typeof CreatePostInputSchema>;
```

## TanStack Middlewares (`lib/middlewares.ts`)

Middlewares progressively inject dependencies and enforce policies.

### Infrastructure Middlewares (DI)

| Middleware          | Injects           | Depends On     |
| :------------------ | :---------------- | :------------- |
| `dbMiddleware`      | `db`              | (base context) |
| `sessionMiddleware` | `auth`, `session` | `dbMiddleware` |

### Policy Middlewares

| Middleware                              | Purpose                                 | Depends On          |
| :-------------------------------------- | :-------------------------------------- | :------------------ |
| `authMiddleware`                        | Requires valid session (401 if missing) | `sessionMiddleware` |
| `adminMiddleware`                       | Requires admin role (403 if not admin)  | `authMiddleware`    |
| `createCacheHeaderMiddleware(strategy)` | Sets Cache-Control headers              | (none)              |
| `createRateLimitMiddleware(options)`    | Calls Durable Object for rate limiting  | `sessionMiddleware` |

### Middleware Chain Example

```typescript
// adminMiddleware already includes the full chain:
// dbMiddleware -> sessionMiddleware -> private cache -> auth check -> admin check
export const adminMiddleware = createMiddleware()
  .middleware([authMiddleware]) // authMiddleware includes sessionMiddleware which includes dbMiddleware
  .server(async ({ next, context }) => {
    if (context.session.user.role !== "admin") {
      throw json({ message: "PERMISSION_DENIED" }, { status: 403 });
    }
    return next({ context: { session } });
  });
```

## Cloudflare Workflows

For complex async task orchestration with persistent state.

### Structure

```typescript
export class PostProcessWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    await step.do("process-content", async () => {
      // Atomic, retryable step
    });
  }
}
```

### Retry Configuration

```typescript
await step.do("step-name", {
  retries: { limit: 3, delay: "5 seconds", backoff: "exponential" },
}, async () => { ... });
```

### Triggering

```typescript
await context.env.POST_PROCESS_WORKFLOW.create({
  params: { postId, isPublished },
});
```

### Registration

1. Export workflow class in `src/server.ts`
2. Declare in `wrangler.jsonc` workflows array

## Environment Variables

Server-only env vars with Zod validation in `src/lib/env/server.env.ts`:

```typescript
import { serverEnv } from "@/lib/env/server.env";

const env = serverEnv(context.env);
const domain = env.DOMAIN;
```

**Config Files**:

- `.dev.vars`: Local development (not committed)
- Cloudflare Dashboard / Wrangler Secrets: Production

## Code Quality Checks

After any code changes, **always** run:

```bash
# Type checking
bun tsc --noEmit

# Lint & Format
bun check
```

## Naming Conventions

| Type             | Convention              | Example            |
| :--------------- | :---------------------- | :----------------- |
| Files (layers)   | `[name].[layer].ts`     | `posts.service.ts` |
| Server Functions | camelCase + `Fn` suffix | `getPostsFn`       |
| Constants        | SCREAMING_SNAKE_CASE    | `CACHE_CONTROL`    |
