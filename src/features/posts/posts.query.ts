import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { findPostByIdFn } from "./api/posts.admin.api";
import {
  findPostBySlugFn,
  getPostsCursorFn,
} from "@/features/posts/api/posts.public.api";

export const featuredPostsQuery = queryOptions({
  queryKey: ["posts", "featured"],
  queryFn: async () => {
    const result = await getPostsCursorFn({
      data: { limit: 4 },
    });
    return result.items;
  },
});

export function postsInfiniteQueryOptions(filters: { tagName?: string } = {}) {
  return infiniteQueryOptions({
    queryKey: ["posts", filters],
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
    queryKey: ["post", slug],
    queryFn: () => findPostBySlugFn({ data: { slug } }),
  });
}

export function postByIdQuery(id: number) {
  return queryOptions({
    queryKey: ["post", id],
    queryFn: () => findPostByIdFn({ data: { id } }),
  });
}
