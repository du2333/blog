import type { Post, PostStatus } from "@/db/schema";

/** Post without contentJson for list views */
export type PostListItem = Omit<Post, "contentJson">;

/** Filter options for posts list */
export const POST_FILTERS = ["ALL", "PUBLISHED", "DRAFT"] as const;
export type PostFilter = (typeof POST_FILTERS)[number];

/** Check if a post is publicly viewable */
export function isPostPubliclyViewable(post: {
  status: PostStatus;
  publishedAt: Date | null;
}): boolean {
  if (post.status !== "published") return false;
  if (!post.publishedAt) return false;
  return post.publishedAt <= new Date();
}

/** Convert PostFilter to API status param */
export function filterToStatus(
  filter: PostFilter
): "published" | "draft" | undefined {
  if (filter === "ALL") return undefined;
  return filter === "PUBLISHED" ? "published" : "draft";
}
