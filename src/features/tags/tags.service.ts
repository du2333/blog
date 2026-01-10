import { z } from "zod";
import type {
  CreateTagInput,
  DeleteTagInput,
  GetTagsByPostIdInput,
  GetTagsInput,
  SetPostTagsInput,
  UpdateTagInput,
} from "@/features/tags/tags.schema";
import { TagSelectSchema } from "@/features/tags/tags.schema";
import * as TagRepo from "@/features/tags/data/tags.data";
import * as CacheService from "@/features/cache/cache.service";

/**
 * Get all tags (cached)
 */
export async function getTags(
  context: Context,
  data: GetTagsInput & { skipCache?: boolean } = {}, // Extend input to support skipCache
) {
  const fetcher = async () =>
    await TagRepo.getAllTags(context.db, {
      sortBy: data.sortBy === "postCount" ? "name" : data.sortBy,
      sortDir: data.sortDir,
    });

  const cacheKey = [
    "tags",
    "list",
    data.sortBy ?? "name",
    data.sortDir ?? "asc",
  ];
  if (data.skipCache) {
    return await fetcher();
  }

  return await CacheService.get(
    context,
    cacheKey,
    z.array(TagSelectSchema),
    fetcher,
    { ttl: 60 * 60 * 24 }, // 24 hours
  );
}

/**
 * Get all tags with counts
 */
export async function getTagsWithCount(
  context: Context,
  data: GetTagsInput = {},
) {
  // We don't cache this for now as it's for admin management
  return await TagRepo.getAllTagsWithCount(context.db, data);
}

/**
 * Get tags for a specific post
 */
export async function getTagsByPostId(
  context: Context,
  data: GetTagsByPostIdInput,
) {
  return await TagRepo.getTagsByPostId(context.db, data.postId);
}

// ============ Admin Service Methods ============

/**
 * Create a new tag
 */
export async function createTag(context: Context, data: CreateTagInput) {
  // Check if name already exists
  const exists = await TagRepo.nameExists(context.db, data.name);
  if (exists) {
    throw new Error("Tag name already exists");
  }

  const tag = await TagRepo.insertTag(context.db, {
    name: data.name,
  });

  // Invalidate tag list cache
  context.executionCtx.waitUntil(
    CacheService.deleteKey(context, ["tags", "list"]),
  );

  return tag;
}

/**
 * Update a tag
 */
export async function updateTag(context: Context, data: UpdateTagInput) {
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

  const tag = await TagRepo.updateTag(context.db, data.id, data.data);

  // Invalidate caches
  context.executionCtx.waitUntil(
    CacheService.deleteKey(context, ["tags", "list"]),
  );

  return tag;
}

/**
 * Delete a tag
 */
export async function deleteTag(context: Context, data: DeleteTagInput) {
  const tag = await TagRepo.findTagById(context.db, data.id);
  if (!tag) return;

  await TagRepo.deleteTag(context.db, data.id);

  // Invalidate caches
  context.executionCtx.waitUntil(
    CacheService.deleteKey(context, ["tags", "list"]),
  );
}

/**
 * Set tags for a post
 */
export async function setPostTags(context: Context, data: SetPostTagsInput) {
  await TagRepo.setPostTags(context.db, data.postId, data.tagIds);

  // Invalidate tag list caches
  context.executionCtx.waitUntil(
    Promise.all([
      CacheService.deleteKey(context, ["tags", "list"]),
      // We might need a broader invalidation depending on how specific counts are
    ]),
  );
}
