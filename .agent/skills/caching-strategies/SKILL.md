---
name: caching-strategies
description: Dual-layer caching strategies for the Flare Stack Blog. Use when implementing CDN cache headers, KV caching with versioned invalidation, or debugging cache-related issues.
---

# Caching Strategies

The project employs a dual-layer caching architecture: CDN (HTTP headers) and KV (Cloudflare KV storage).

## CDN Layer (HTTP Headers)

Control browser and CDN caching via response headers set by middlewares.

### Setting Cache Headers

Use `createCacheHeaderMiddleware(strategy)` in Server Functions to set `Cache-Control` headers:

```typescript
import { createServerFn } from "@tanstack/react-start";
import {
  createCacheHeaderMiddleware,
  createRateLimitMiddleware,
} from "@/lib/middlewares";

export const getPostsFn = createServerFn()
  .middleware([
    createRateLimitMiddleware({
      capacity: 60,
      interval: "1m",
      key: "posts:list",
    }),
    createCacheHeaderMiddleware("swr"), // Sets SWR Cache-Control headers
  ])
  .handler(({ context }) => PostService.getPosts(context));
```

### Cache Header Strategies

| Strategy      | Header                 | Use Case             |
| :------------ | :--------------------- | :------------------- |
| `"swr"`       | Stale-While-Revalidate | Public API responses |
| `"immutable"` | Long-term immutable    | Hashed static assets |
| `"private"`   | no-store, private      | Auth/admin responses |

### Cache Control Constants (`lib/constants.ts`)

These constants are used by the middleware factory. Additional constants for error pages:

| Constant                    | Use Case  |
| :-------------------------- | :-------- |
| `CACHE_CONTROL.notFound`    | 404 pages |
| `CACHE_CONTROL.serverError` | 500 pages |

### Invalidation

Purge CDN cache using the Cloudflare API:

```typescript
await purgePostCDNCache(context, post.slug);
```

## KV Layer (Cloudflare KV)

Used for persistent caching of longer-lived data (post lists, details).

### Versioned Key Invalidation Strategy

This pattern enables efficient bulk invalidation without iterating through keys:

#### 1. Get Current Version

```typescript
const version = await CacheService.getVersion(context, "posts:detail");
// Returns something like "v1", "v2"
```

#### 2. Include Version in Cache Key

The version becomes the first element of the cache key array:

```typescript
return CacheService.get(
  context,
  [version, "post", slug], // Key: ["v1", "post", "hello-world"]
  PostSchema,
  fetcher,
);
```

#### 3. Bump Version to Invalidate

When data changes, increment the version number:

```typescript
await CacheService.bumpVersion(context, "posts:detail");
// Version changes from "v1" to "v2"
// All old keys with "v1" become orphaned (TTL expiry or miss)
```

#### 4. Direct Key Deletion

For single-record invalidation, delete the specific key:

```typescript
await CacheService.deleteKey(context, ["post", slug]);
```

## Complete Example

```typescript
// posts.service.ts
export async function findPostBySlug(
  context: DbContext & { executionCtx: ExecutionContext },
  data: { slug: string },
) {
  // 1. Define the data fetcher
  const fetcher = () => PostRepo.findPostBySlug(context.db, data.slug);

  // 2. Get current cache version
  const version = await CacheService.getVersion(context, "posts:detail");

  // 3. Get from cache or fetch
  return CacheService.get(context, [version, data.slug], PostSchema, fetcher);
}

export async function updatePost(
  context: DbContext & { executionCtx: ExecutionContext },
  data: UpdatePostInput,
) {
  // 1. Update in database
  const post = await PostRepo.updatePost(context.db, data);

  // 2. Invalidate KV cache (bump version for list, delete specific for detail)
  await CacheService.bumpVersion(context, "posts:list");
  const version = await CacheService.getVersion(context, "posts:detail");
  await CacheService.deleteKey(context, [version, "post", post.slug]);

  // 3. Purge CDN cache
  await purgePostCDNCache(context.env, post.slug);

  return post;
}
```

## Cache Namespace Conventions

| Namespace       | Data Type        | Invalidation Trigger          |
| :-------------- | :--------------- | :---------------------------- |
| `posts:list`    | Post listings    | Post create/update/delete     |
| `posts:detail`  | Individual posts | Post update/delete            |
| `tags:list`     | Tag listings     | Tag create/update/delete      |
| `comments:list` | Comment listings | Comment create/approve/delete |

## When to Use Each Layer

| Scenario             | CDN          | KV               |
| :------------------- | :----------- | :--------------- |
| Public API responses | ✅ SWR       | ✅ Version-keyed |
| Admin API responses  | ❌ Private   | Optional         |
| Static assets        | ✅ Immutable | ❌               |
| User-specific data   | ❌ Private   | Depends          |

## Debugging Cache Issues

1. **Stale data after update?**
   - Check if `bumpVersion()` was called
   - Verify CDN purge completed
   - Check cache key construction

2. **Cache misses?**
   - Verify version string consistency
   - Check TTL settings
   - Inspect key serialization

3. **Memory issues?**
   - Review cached data size
   - Consider selective field caching
