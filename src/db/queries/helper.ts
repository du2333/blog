import { PostCategory, PostsTable, PostStatus } from "@/db/schema";
import { and, eq, lte } from "drizzle-orm";

export function uniqueOrThrow<T>(array: T[]) {
  if (array.length === 0) return null;
  if (array.length !== 1)
    throw new Error(`Expected 1 item, got ${array.length}`);

  return array[0];
}

/**
 * Check if a post is publicly viewable
 * - Must be published
 * - publishedAt must be in the past (or now)
 */
export function isPostPubliclyViewable(post: {
  status: PostStatus;
  publishedAt: Date | null;
}): boolean {
  if (post.status !== "published") return false;
  if (!post.publishedAt) return false;
  return post.publishedAt <= new Date();
}

export function buildPostWhereClause(options: {
  category?: PostCategory;
  status?: PostStatus;
  publicOnly?: boolean; // For public pages - checks publishedAt <= now
}) {
  const whereClauses = [];

  if (options.category) {
    whereClauses.push(eq(PostsTable.category, options.category));
  }

  if (options.status) {
    whereClauses.push(eq(PostsTable.status, options.status));
  }

  // For public pages, also filter by publishedAt
  if (options.publicOnly) {
    whereClauses.push(eq(PostsTable.status, "published"));
    whereClauses.push(lte(PostsTable.publishedAt, new Date()));
  }

  return whereClauses.length > 0 ? and(...whereClauses) : undefined;
}
