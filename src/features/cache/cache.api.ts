import * as CacheService from "@/features/cache/cache.service";
import * as TagService from "@/features/tags/tags.service";
import { purgeSiteCDNCache } from "@/lib/invalidate";
import { createAdminFn } from "@/lib/middlewares";

export const invalidateSiteCacheFn = createAdminFn().handler(
  async ({ context }) => {
    // 1. Purge CDN
    const purgeTask = purgeSiteCDNCache(context.env);

    // 2. Bump KV Versions (Invalidate all KV caches)
    const kvTasks = [
      CacheService.bumpVersion(context, "posts:list"),
      CacheService.bumpVersion(context, "posts:detail"),
      CacheService.deleteKey(context, [...TagService.PUBLIC_TAGS_CACHE_KEY]),
    ];

    await Promise.all([purgeTask, ...kvTasks]);
  },
);
