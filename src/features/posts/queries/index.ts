import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { findPostByIdFn } from "../api/posts.admin.api";
import { findPostBySlugFn, getPostsCursorFn } from "../api/posts.public.api";
import type {
  GetPostsCountInput,
  GetPostsInput,
} from "@/features/posts/posts.schema";

export const POSTS_KEYS = {
  all: ["posts"] as const,

  // Parent keys (static arrays for prefix invalidation)
  lists: ["posts", "list"] as const,
  details: ["posts", "detail"] as const,
  featured: ["posts", "featured"] as const,
  adminLists: ["posts", "admin-list"] as const,
  counts: ["posts", "count"] as const,

  // Child keys (functions for specific queries)
  list: (filters?: { tagName?: string }) => ["posts", "list", filters] as const,
  detail: (idOrSlug: number | string) => ["posts", "detail", idOrSlug] as const,
  adminList: (params: GetPostsInput) =>
    ["posts", "admin-list", params] as const,
  count: (params: GetPostsCountInput) => ["posts", "count", params] as const,
};

export const featuredPostsQuery = queryOptions({
  queryKey: POSTS_KEYS.featured,
  queryFn: async () => {
    const result = await getPostsCursorFn({
      data: { limit: 4 },
    });
    return result.items;
  },
});

export function postsInfiniteQueryOptions(filters: { tagName?: string } = {}) {
  return infiniteQueryOptions({
    queryKey: POSTS_KEYS.list(filters),
    queryFn: ({ pageParam }) =>
      getPostsCursorFn({
        data: {
          cursor: pageParam,
          limit: 12,
          tagName: filters.tagName,
        },
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as number | undefined,
  });
}

export function postBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: POSTS_KEYS.detail(slug),
    queryFn: () => findPostBySlugFn({ data: { slug } }),
  });
}

export function postByIdQuery(id: number) {
  return queryOptions({
    queryKey: POSTS_KEYS.detail(id),
    queryFn: () => findPostByIdFn({ data: { id } }),
  });
}
