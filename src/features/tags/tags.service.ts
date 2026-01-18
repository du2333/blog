import { z } from "zod";
import type {
  CreateTagInput,
  DeleteTagInput,
  GetTagsByPostIdInput,
  GetTagsInput,
  SetPostTagsInput,
  UpdateTagInput,
} from "@/features/tags/tags.schema";

import {
  TAGS_CACHE_KEYS,
  TagWithCountSchema,
} from "@/features/tags/tags.schema";
import { POSTS_CACHE_KEYS } from "@/features/posts/posts.schema";
import * as TagRepo from "@/features/tags/data/tags.data";
import * as CacheService from "@/features/cache/cache.service";
import { purgeCDNCache } from "@/lib/invalidate";

/**
 * Get all tags (cached)
 */
export async function getTags(context: DbContext, data: GetTagsInput = {}) {
  const {
    sortBy = "name",
    sortDir = "asc",
    withCount = false,
    publicOnly = false,
  } = data;

  if (withCount) {
    return await TagRepo.getAllTagsWithCount(context.db, {
      sortBy,
      sortDir,
      publicOnly,
    });
  }
  return await TagRepo.getAllTags(context.db, {
    sortBy: sortBy === "postCount" ? "name" : sortBy,
    sortDir,
  });
}

/**
 * Get public tags list (KV-only, populated by publish workflow)
 * This ensures public site only shows "published" tag associations.
 */
export async function getPublicTags(
  context: DbContext & {
    executionCtx: ExecutionContext;
  },
) {
  return await CacheService.get(
    context,
    TAGS_CACHE_KEYS.publicList,
    z.array(TagWithCountSchema),
    async () => {
      return await TagRepo.getAllTagsWithCount(context.db, {
        publicOnly: true,
        sortBy: "postCount",
        sortDir: "desc",
      });
    },
    { ttl: "7d" },
  );
}

/**
 * Get all tags with counts
 */
export async function getTagsWithCount(
  context: DbContext,
  data: GetTagsInput = {},
) {
  // We don't cache this for now as it's for admin management
  return await TagRepo.getAllTagsWithCount(context.db, data);
}

/**
 * Get tags for a specific post
 */
export async function getTagsByPostId(
  context: DbContext,
  data: GetTagsByPostIdInput,
) {
  return await TagRepo.getTagsByPostId(context.db, data.postId);
}

// ============ Admin Service Methods ============

/**
 * Create a new tag
 */

/**
 * Helper to invalidate caches related to tags and their associated posts.
 *
 * 采用保守策略：
 * 1. 无论如何都清除 publicList（标签变动必然影响标签云）
 * 2. 如果有受影响的文章，精确失效这些文章的缓存
 * 3. 如果没有受影响的文章（可能是 DB/KV 不同步），bump 所有版本号
 */
async function invalidateTagRelatedCache(
  context: DbContext,
  affectedPosts: Array<{ id: number; slug: string }>,
) {
  // 1. 无论如何都清除 publicList
  await CacheService.deleteKey(context, TAGS_CACHE_KEYS.publicList);

  if (affectedPosts.length > 0) {
    // 2. 精确失效受影响的文章
    const tasks: Array<Promise<void>> = [];

    // Bump post list version
    tasks.push(CacheService.bumpVersion(context, "posts:list"));

    // Invalidate each affected post's detail cache
    const version = await CacheService.getVersion(context, "posts:detail");
    for (const post of affectedPosts) {
      tasks.push(
        CacheService.deleteKey(
          context,
          POSTS_CACHE_KEYS.detail(version, post.slug),
        ),
      );
    }

    // Purge CDN for affected posts and list pages
    const cdnUrls = ["/", "/posts"];
    for (const post of affectedPosts) {
      cdnUrls.push(`/post/${post.slug}`);
    }
    tasks.push(purgeCDNCache(context.env, { urls: cdnUrls }));

    await Promise.all(tasks);
  } else {
    // 3. 保守策略：可能是 DB/KV 不同步，bump 所有版本号
    await Promise.all([
      CacheService.bumpVersion(context, "posts:detail"),
      CacheService.bumpVersion(context, "posts:list"),
      purgeCDNCache(context.env, { urls: ["/", "/posts"] }),
    ]);
  }
}

export const createTag = async (context: DbContext, data: CreateTagInput) => {
  // Check if name already exists
  const exists = await TagRepo.nameExists(context.db, data.name);
  if (exists) {
    throw new Error("Tag name already exists");
  }

  const tag = await TagRepo.insertTag(context.db, {
    name: data.name,
  });

  return tag;
};

/**
 * Update a tag
 */
export async function updateTag(
  context: DbContext & { executionCtx: ExecutionContext },
  data: UpdateTagInput,
) {
  const existingTag = await TagRepo.findTagById(context.db, data.id);
  if (!existingTag) {
    throw new Error("Tag not found");
  }

  // Check if new name already exists (if name is being updated)
  if (data.data.name && data.data.name !== existingTag.name) {
    const exists = await TagRepo.nameExists(context.db, data.data.name, {
      excludeId: data.id,
    });
    if (exists) {
      throw new Error("Tag name already exists");
    }
  }

  // Fetch published posts associated with this tag BEFORE updating
  const affectedPosts = await TagRepo.getPublishedPostsByTagId(
    context.db,
    data.id,
  );

  const tag = await TagRepo.updateTag(context.db, data.id, data.data);

  context.executionCtx.waitUntil(
    invalidateTagRelatedCache(context, affectedPosts),
  );

  return tag;
}

/**
 * Delete a tag
 */
export async function deleteTag(
  context: DbContext & { executionCtx: ExecutionContext },
  data: DeleteTagInput,
) {
  const tag = await TagRepo.findTagById(context.db, data.id);
  if (!tag) return;

  // Fetch published posts associated with this tag BEFORE deleting
  const affectedPosts = await TagRepo.getPublishedPostsByTagId(
    context.db,
    data.id,
  );

  await TagRepo.deleteTag(context.db, data.id);

  context.executionCtx.waitUntil(
    invalidateTagRelatedCache(context, affectedPosts),
  );
}

/**
 * Set tags for a post (edit only, no cache invalidation)
 *
 * 编辑页面改标签只影响 DB，不触发 KV 变化。
 * KV 只在"发布"时刷新。
 */
export async function setPostTags(context: DbContext, data: SetPostTagsInput) {
  await TagRepo.setPostTags(context.db, data.postId, data.tagIds);
}
