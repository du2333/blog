import type { Post, PostCategory, PostStatus } from "@/lib/db/schema";

/** Post without contentJson for list views */
export type PostListItem = Omit<Post, "contentJson">;

/** Status filter options for posts list */
export const STATUS_FILTERS = ["ALL", "PUBLISHED", "DRAFT"] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

/** Category filter options for posts list (includes ALL) */
export const CATEGORY_FILTERS = [
	"ALL",
	"DEV",
	"LIFE",
	"GAMING",
	"TECH",
] as const;
export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

/** Sort direction options */
export const SORT_DIRECTIONS = ["ASC", "DESC"] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

/** Check if a post is publicly viewable */
export function isPostPubliclyViewable(post: {
	status: PostStatus;
	publishedAt: Date | null;
}): boolean {
	if (post.status !== "published")
		return false;
	if (!post.publishedAt)
		return false;
	return post.publishedAt <= new Date();
}

/** Convert StatusFilter to API status param */
export function statusFilterToApi(
	filter: StatusFilter,
): "published" | "draft" | undefined {
	if (filter === "ALL")
		return undefined;
	return filter === "PUBLISHED" ? "published" : "draft";
}

/** Convert CategoryFilter to API category param */
export function categoryFilterToApi(
	filter: CategoryFilter,
): PostCategory | undefined {
	if (filter === "ALL")
		return undefined;
	return filter as PostCategory;
}
