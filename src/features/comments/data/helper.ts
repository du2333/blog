import { and, eq, inArray, or } from "drizzle-orm";
import type { CommentStatus } from "@/lib/db/schema";
import { CommentsTable } from "@/lib/db/schema";

export function buildCommentWhereClause(options: {
  status?: CommentStatus | Array<CommentStatus>;
  postId?: number;
  userId?: string;
  viewerId?: string;
}) {
  const { status, postId, userId, viewerId } = options;

  const whereClauses = [];

  if (postId) {
    whereClauses.push(eq(CommentsTable.postId, postId));
  }

  if (userId) {
    whereClauses.push(eq(CommentsTable.userId, userId));
  }

  // logic: 
  // 1. If viewerId is provided, we want (status: published) OR (userId: viewerId AND status: pending/verifying)
  // 2. If status is explicitly provided, we use that.
  
  if (viewerId && !status && !userId) {
    whereClauses.push(
      or(
        eq(CommentsTable.status, "published"),
        and(
          eq(CommentsTable.userId, viewerId),
          inArray(CommentsTable.status, ["pending", "verifying"])
        )
      )
    );
  } else if (status) {
    if (Array.isArray(status)) {
      whereClauses.push(inArray(CommentsTable.status, status));
    } else {
      whereClauses.push(eq(CommentsTable.status, status));
    }
  }

  return whereClauses.length > 0 ? and(...whereClauses) : undefined;
}
