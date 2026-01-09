import { count, desc, eq } from "drizzle-orm";
import type { DB } from "@/lib/db";
import type { CommentStatus } from "@/lib/db/schema";
import { buildCommentWhereClause } from "@/features/comments/data/helper";
import { CommentsTable, user } from "@/lib/db/schema";

const DEFAULT_PAGE_SIZE = 20;

export async function insertComment(
  db: DB,
  data: typeof CommentsTable.$inferInsert,
) {
  const [comment] = await db.insert(CommentsTable).values(data).returning();
  return comment;
}

export async function findCommentById(db: DB, id: number) {
  return await db.query.CommentsTable.findFirst({
    where: eq(CommentsTable.id, id),
  });
}

export async function getCommentsByPostId(
  db: DB,
  postId: number,
  options: {
    offset?: number;
    limit?: number;
    status?: CommentStatus | Array<CommentStatus>;
  } = {},
) {
  const { offset = 0, limit = DEFAULT_PAGE_SIZE, status } = options;

  const conditions = buildCommentWhereClause({ postId, status });

  const comments = await db
    .select({
      id: CommentsTable.id,
      content: CommentsTable.content,
      parentId: CommentsTable.parentId,
      postId: CommentsTable.postId,
      userId: CommentsTable.userId,
      status: CommentsTable.status,
      aiReason: CommentsTable.aiReason,
      createdAt: CommentsTable.createdAt,
      updatedAt: CommentsTable.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(CommentsTable)
    .leftJoin(user, eq(CommentsTable.userId, user.id))
    .where(conditions)
    .orderBy(desc(CommentsTable.createdAt))
    .limit(Math.min(limit, 100))
    .offset(offset);

  return comments;
}

export async function getCommentsByPostIdCount(
  db: DB,
  postId: number,
  options: {
    status?: CommentStatus | Array<CommentStatus>;
  } = {},
) {
  const { status } = options;

  const conditions = buildCommentWhereClause({ postId, status });

  const result = await db
    .select({ count: count() })
    .from(CommentsTable)
    .where(conditions);

  return result[0].count;
}

export async function getCommentsByUserId(
  db: DB,
  userId: string,
  options: {
    offset?: number;
    limit?: number;
    status?: CommentStatus | Array<CommentStatus>;
  } = {},
) {
  const { offset = 0, limit = DEFAULT_PAGE_SIZE, status } = options;

  const conditions = buildCommentWhereClause({ userId, status });

  const comments = await db
    .select()
    .from(CommentsTable)
    .where(conditions)
    .orderBy(desc(CommentsTable.createdAt))
    .limit(Math.min(limit, 100))
    .offset(offset);

  return comments;
}

export async function getAllComments(
  db: DB,
  options: {
    offset?: number;
    limit?: number;
    status?: CommentStatus | Array<CommentStatus>;
    postId?: number;
    userId?: string;
  } = {},
) {
  const {
    offset = 0,
    limit = DEFAULT_PAGE_SIZE,
    status,
    postId,
    userId,
  } = options;

  const conditions = buildCommentWhereClause({ status, postId, userId });

  const comments = await db
    .select({
      id: CommentsTable.id,
      content: CommentsTable.content,
      parentId: CommentsTable.parentId,
      postId: CommentsTable.postId,
      userId: CommentsTable.userId,
      status: CommentsTable.status,
      aiReason: CommentsTable.aiReason,
      createdAt: CommentsTable.createdAt,
      updatedAt: CommentsTable.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(CommentsTable)
    .leftJoin(user, eq(CommentsTable.userId, user.id))
    .where(conditions)
    .orderBy(desc(CommentsTable.createdAt))
    .limit(Math.min(limit, 100))
    .offset(offset);

  return comments;
}

export async function getAllCommentsCount(
  db: DB,
  options: {
    status?: CommentStatus | Array<CommentStatus>;
    postId?: number;
    userId?: string;
  } = {},
) {
  const { status, postId, userId } = options;

  const conditions = buildCommentWhereClause({ status, postId, userId });

  const result = await db
    .select({ count: count() })
    .from(CommentsTable)
    .where(conditions);

  return result[0].count;
}

export async function updateComment(
  db: DB,
  id: number,
  data: Partial<Omit<typeof CommentsTable.$inferInsert, "id" | "createdAt">>,
) {
  const [comment] = await db
    .update(CommentsTable)
    .set(data)
    .where(eq(CommentsTable.id, id))
    .returning();
  return comment;
}

export async function deleteComment(db: DB, id: number) {
  await db.delete(CommentsTable).where(eq(CommentsTable.id, id));
}
