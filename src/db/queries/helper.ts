import { PostCategory, PostsTable, PostStatus } from "@/db/schema";
import { and, eq, lte } from "drizzle-orm";

export function uniqueOrThrow<T>(array: T[]) {
  if (array.length === 0) return null;
  if (array.length !== 1)
    throw new Error(`Expected 1 item, got ${array.length}`);

  return array[0];
}

export function buildPostWhereClause(options: {
  category?: PostCategory;
  status?: PostStatus;
}) {
  const whereClauses = [];
  if (options.category) {
    whereClauses.push(eq(PostsTable.category, options.category));
  }
  if (options.status) {
    if (options.status === "published") {
      whereClauses.push(eq(PostsTable.status, options.status));
      whereClauses.push(lte(PostsTable.publishedAt, new Date()));
    } else {
      whereClauses.push(eq(PostsTable.status, options.status));
    }
  }
  return whereClauses.length > 0 ? and(...whereClauses) : undefined;
}
