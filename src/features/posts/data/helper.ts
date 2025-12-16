import { PostCategory, PostsTable, PostStatus } from "@/lib/db/schema";
import { and, asc, desc, eq, like, lte, type SQL } from "drizzle-orm";

export type SortField = "DATE";
export type SortDirection = "ASC" | "DESC";

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
  search?: string;
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

  // Search by title
  if (options.search) {
    const searchTerm = options.search.trim();
    if (searchTerm) {
      whereClauses.push(like(PostsTable.title, `%${searchTerm}%`));
    }
  }

  return whereClauses.length > 0 ? and(...whereClauses) : undefined;
}

export function buildPostOrderByClause(sortDir?: SortDirection): SQL {
  const direction = sortDir ?? "DESC";
  const orderFn = direction === "DESC" ? desc : asc;
  return orderFn(PostsTable.createdAt);
}
