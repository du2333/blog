import { and, asc, desc, eq, like, lte } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { PostStatus } from "@/lib/db/schema";
import { PostsTable } from "@/lib/db/schema";

export type SortField = "DATE";
export type SortDirection = "ASC" | "DESC";

export function buildPostWhereClause(options: {
  status?: PostStatus;
  publicOnly?: boolean; // For public pages - checks publishedAt <= now
  search?: string;
}) {
  const whereClauses = [];

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
