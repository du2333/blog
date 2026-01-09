import type {
  CreateCommentInput,
  DeleteCommentInput,
  GetAllCommentsInput,
  GetCommentsByPostIdInput,
  GetMyCommentsInput,
  ModerateCommentInput,
  StartCommentModerationInput,
} from "@/features/comments/comments.schema";
import * as CommentRepo from "@/features/comments/data/comments.data";

// ============ Public Service Methods ============

export async function getCommentsByPostId(
  context: Context,
  data: GetCommentsByPostIdInput & { viewerId?: string },
) {
  const [items, total] = await Promise.all([
    CommentRepo.getCommentsByPostId(context.db, data.postId, {
      offset: data.offset,
      limit: data.limit,
      viewerId: data.viewerId,
      status: data.viewerId ? undefined : "published",
    }),
    CommentRepo.getCommentsByPostIdCount(context.db, data.postId, {
      viewerId: data.viewerId,
      status: data.viewerId ? undefined : "published",
    }),
  ]);

  return { items, total };
}

// ============ Authed User Service Methods ============

export async function createComment(
  context: AuthContext,
  data: CreateCommentInput,
) {
  const comment = await CommentRepo.insertComment(context.db, {
    postId: data.postId,
    content: data.content,
    parentId: data.parentId,
    userId: context.session.user.id,
    status: "verifying", // Initial status, will be processed by AI
  });

  // Trigger AI moderation workflow
  await startCommentModerationWorkflow(context, { commentId: comment.id });

  return comment;
}

export async function deleteComment(
  context: AuthContext,
  data: DeleteCommentInput,
) {
  const comment = await CommentRepo.findCommentById(context.db, data.id);

  if (!comment) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  // Only allow deleting own comments (unless admin)
  const userRole = context.session.user.role;
  if (comment.userId !== context.session.user.id && userRole !== "admin") {
    throw new Error("PERMISSION_DENIED");
  }

  // Soft delete by setting status to deleted
  await CommentRepo.updateComment(context.db, data.id, {
    status: "deleted",
  });

  return { success: true };
}

export async function getMyComments(
  context: AuthContext,
  data: GetMyCommentsInput,
) {
  const comments = await CommentRepo.getCommentsByUserId(
    context.db,
    context.session.user.id,
    {
      offset: data.offset,
      limit: data.limit,
      status: data.status,
    },
  );

  return comments;
}

// ============ Admin Service Methods ============

export async function getAllComments(
  context: Context,
  data: GetAllCommentsInput,
) {
  const [items, total] = await Promise.all([
    CommentRepo.getAllComments(context.db, {
      offset: data.offset,
      limit: data.limit,
      status: data.status,
      postId: data.postId,
      userId: data.userId,
    }),
    CommentRepo.getAllCommentsCount(context.db, {
      status: data.status,
      postId: data.postId,
      userId: data.userId,
    }),
  ]);

  return { items, total };
}

export async function moderateComment(
  context: Context,
  data: ModerateCommentInput,
) {
  const comment = await CommentRepo.findCommentById(context.db, data.id);

  if (!comment) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  const updatedComment = await CommentRepo.updateComment(context.db, data.id, {
    status: data.status,
  });

  return updatedComment;
}

export async function adminDeleteComment(
  context: Context,
  data: DeleteCommentInput,
) {
  const comment = await CommentRepo.findCommentById(context.db, data.id);

  if (!comment) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  // Hard delete for admin
  await CommentRepo.deleteComment(context.db, data.id);

  return { success: true };
}

// ============ Workflow Methods ============

export async function startCommentModerationWorkflow(
  context: Context,
  data: StartCommentModerationInput,
) {
  await context.env.COMMENT_MODERATION_WORKFLOW.create({
    params: {
      commentId: data.commentId,
    },
  });
}

export async function findCommentById(context: Context, commentId: number) {
  return await CommentRepo.findCommentById(context.db, commentId);
}

export async function updateCommentStatus(
  context: { db: Context["db"] },
  commentId: number,
  status: "published" | "pending" | "deleted",
  aiReason?: string,
) {
  return await CommentRepo.updateComment(context.db, commentId, {
    status,
    aiReason,
  });
}
