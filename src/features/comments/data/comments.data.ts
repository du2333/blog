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

export async function getRootCommentsByPostId(
  db: DB,
  postId: number,
  options: {
    offset?: number;
    limit?: number;
    status?: CommentStatus | Array<CommentStatus>;
    viewerId?: string;
  } = {},
) {
  const { offset = 0, limit = DEFAULT_PAGE_SIZE, status, viewerId } = options;

  const conditions = buildCommentWhereClause({
    postId,
    status,
    viewerId,
    rootOnly: true,
  });

  const comments = await db
    .select({
      id: CommentsTable.id,
      content: CommentsTable.content,
      rootId: CommentsTable.rootId,
      replyToCommentId: CommentsTable.replyToCommentId,
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
        role: user.role,
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

export async function getRootCommentsByPostIdCount(
  db: DB,
  postId: number,
  options: {
    status?: CommentStatus | Array<CommentStatus>;
    viewerId?: string;
  } = {},
) {
  const { status, viewerId } = options;

  const conditions = buildCommentWhereClause({
    postId,
    status,
    viewerId,
    rootOnly: true,
  });

  const result = await db
    .select({ count: count() })
    .from(CommentsTable)
    .where(conditions);

  return result[0].count;
}

export async function getReplyCountByRootId(
  db: DB,
  postId: number,
  rootId: number,
  options: {
    status?: CommentStatus | Array<CommentStatus>;
    viewerId?: string;
  } = {},
) {
  const { status, viewerId } = options;

  const conditions = buildCommentWhereClause({
    postId,
    rootId,
    status,
    viewerId,
  });

  const result = await db
    .select({ count: count() })
    .from(CommentsTable)
    .where(conditions);

  return result[0].count;
}

export async function getRepliesByRootId(
  db: DB,
  postId: number,
  rootId: number,
  options: {
    offset?: number;
    limit?: number;
    status?: CommentStatus | Array<CommentStatus>;
    viewerId?: string;
  } = {},
) {
  const { offset = 0, limit = DEFAULT_PAGE_SIZE, status, viewerId } = options;

  const conditions = buildCommentWhereClause({
    postId,
    rootId,
    status,
    viewerId,
  });

  const replies = await db
    .select({
      id: CommentsTable.id,
      content: CommentsTable.content,
      rootId: CommentsTable.rootId,
      replyToCommentId: CommentsTable.replyToCommentId,
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
        role: user.role,
      },
    })
    .from(CommentsTable)
    .leftJoin(user, eq(CommentsTable.userId, user.id))
    .where(conditions)
    .orderBy(CommentsTable.createdAt)
    .limit(Math.min(limit, 100))
    .offset(offset);

  // Fetch replyTo user info separately for each reply
  const repliesWithReplyTo = await Promise.all(
    replies.map(async (reply) => {
      if (!reply.replyToCommentId) {
        return { ...reply, replyTo: null };
      }

      const replyToComment = await findCommentById(db, reply.replyToCommentId);
      if (!replyToComment) {
        return { ...reply, replyTo: null };
      }

      const replyToUserInfo = await db.query.user.findFirst({
        where: eq(user.id, replyToComment.userId),
        columns: {
          id: true,
          name: true,
        },
      });

      return {
        ...reply,
        replyTo: replyToUserInfo
          ? { id: replyToUserInfo.id, name: replyToUserInfo.name }
          : null,
      };
    }),
  );

  return repliesWithReplyTo;
}

export async function getRepliesByRootIdCount(
  db: DB,
  postId: number,
  rootId: number,
  options: {
    status?: CommentStatus | Array<CommentStatus>;
    viewerId?: string;
  } = {},
) {
  const { status, viewerId } = options;

  const conditions = buildCommentWhereClause({
    postId,
    rootId,
    status,
    viewerId,
  });

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
      rootId: CommentsTable.rootId,
      replyToCommentId: CommentsTable.replyToCommentId,
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
        role: user.role,
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
