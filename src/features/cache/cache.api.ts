import { createServerFn } from "@tanstack/react-start";
import * as CacheService from "@/features/cache/cache.service";
import { TAGS_CACHE_KEYS } from "@/features/tags/tags.schema";
import { purgeSiteCDNCache } from "@/lib/invalidate";
import { adminMiddleware } from "@/lib/middlewares";

export const invalidateSiteCacheFn = createServerFn()
  .middleware([adminMiddleware])
  .handler(async ({ context }) => {
    // 1. Purge CDN
    const purgeTask = purgeSiteCDNCache(context.env);

    // 2. Bump KV Versions (Invalidate all KV caches)
    const kvTasks = [
      CacheService.bumpVersion(context, "posts:list"),
      CacheService.bumpVersion(context, "posts:detail"),
      CacheService.deleteKey(context, TAGS_CACHE_KEYS.publicList),
    ];

    await Promise.all([purgeTask, ...kvTasks]);
  });
