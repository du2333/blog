import { queryOptions } from "@tanstack/react-query";
import type { GetTagsInput } from "@/features/tags/tags.schema";
import {
  getTagsAdminFn,
  getTagsByPostIdFn,
  getTagsFn,
  getTagsWithCountAdminFn,
} from "@/features/tags/api/tags.api";

export function tagsQueryOptions() {
  return queryOptions({
    queryKey: ["tags", "public"],
    queryFn: () => getTagsFn({}),
  });
}

export function tagsAdminQueryOptions(options: GetTagsInput = {}) {
  return queryOptions({
    queryKey: [
      "tags",
      "admin",
      options.sortBy ?? "name",
      options.sortDir ?? "asc",
    ],
    queryFn: () => getTagsAdminFn({ data: options }),
    staleTime: Infinity,
  });
}

export function tagsByPostIdQueryOptions(postId: number) {
  return queryOptions({
    queryKey: ["post", postId, "tags"],
    queryFn: () => getTagsByPostIdFn({ data: { postId } }),
  });
}

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
