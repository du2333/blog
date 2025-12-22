import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
	findPostBySlugFn,
	getPostsCursorFn,
} from "@/features/posts/api/posts.public.api";
import type { PostCategory } from "@/lib/db/schema";
import { findPostByIdFn } from "./api/posts.admin.api";

export const featuredPostsQuery = queryOptions({
	queryKey: ["posts", "featured"],
	queryFn: async () => {
		const result = await getPostsCursorFn({
			data: { limit: 4 },
		});
		return result.items;
	},
});

export const postsInfiniteQueryOptions = (category?: PostCategory) =>
	infiniteQueryOptions({
		queryKey: ["posts", category],
		queryFn: ({ pageParam }) =>
			getPostsCursorFn({
				data: {
					cursor: pageParam,
					category: category,
					limit: 12,
				},
			}),
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		initialPageParam: undefined as number | undefined,
	});

export const postBySlugQuery = (slug: string) =>
	queryOptions({
		queryKey: ["post", slug],
		queryFn: () => findPostBySlugFn({ data: { slug } }),
	});

export const postByIdQuery = (id: number) =>
	queryOptions({
		queryKey: ["post", id],
		queryFn: () => findPostByIdFn({ data: { id } }),
	});
