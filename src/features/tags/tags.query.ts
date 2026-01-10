import { queryOptions } from "@tanstack/react-query";
import type { GetTagsInput } from "@/features/tags/tags.schema";
import {
  getTagsAdminFn,
  getTagsByPostIdFn,
  getTagsFn,
  getTagsWithCountAdminFn,
} from "@/features/tags/api/tags.api";

/**
 * Query options for fetching all tags (public, uses cached API)
 */
export function tagsQueryOptions(options: GetTagsInput = {}) {
  return queryOptions({
    queryKey: ["tags", options.sortBy ?? "name", options.sortDir ?? "asc"],
    queryFn: () => getTagsFn({ data: options }),
  });
}

/**
 * Query options for fetching all tags (admin, bypasses function-level cache)
 */
export function tagsAdminQueryOptions(options: GetTagsInput = {}) {
  return queryOptions({
    queryKey: [
      "tags",
      "admin",
      options.sortBy ?? "name",
      options.sortDir ?? "asc",
    ],
    queryFn: () => getTagsAdminFn({ data: options }),
    staleTime: Infinity, // Fetch once and cache forever (client-side feeling)
  });
}

/**
 * Query options for fetching tags by post ID
 */
export function tagsByPostIdQueryOptions(postId: number) {
  return queryOptions({
    queryKey: ["post", postId, "tags"],
    queryFn: () => getTagsByPostIdFn({ data: { postId } }),
  });
}

/**
 * Query options for fetching tags with post counts (admin)
 */
export function tagsWithCountAdminQueryOptions(options: GetTagsInput = {}) {
  return queryOptions({
    queryKey: [
      "tags",
      "admin",
      "with-count",
      options.sortBy ?? "name",
      options.sortDir ?? "asc",
    ],
    queryFn: () => getTagsWithCountAdminFn({ data: options }),
  });
}
