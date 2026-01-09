import { and, eq, inArray } from "drizzle-orm";
import type { CommentStatus } from "@/lib/db/schema";
import { CommentsTable } from "@/lib/db/schema";

export function buildCommentWhereClause(options: {
  status?: CommentStatus | Array<CommentStatus>;
  postId?: number;
  userId?: string;
}) {
  const { status, postId, userId } = options;

  const whereClauses = [];

  if (status) {
    if (Array.isArray(status)) {
      whereClauses.push(inArray(CommentsTable.status, status));
    } else {
      whereClauses.push(eq(CommentsTable.status, status));
    }
  }

  if (postId) {
    whereClauses.push(eq(CommentsTable.postId, postId));
  }

  if (userId) {
    whereClauses.push(eq(CommentsTable.userId, userId));
  }

  return whereClauses.length > 0 ? and(...whereClauses) : undefined;
}
