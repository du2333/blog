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

export async function getRootCommentsByPostId(
  context: Context,
  data: GetCommentsByPostIdInput & { viewerId?: string },
) {
  const [items, total] = await Promise.all([
    CommentRepo.getRootCommentsByPostId(context.db, data.postId, {
      offset: data.offset,
      limit: data.limit,
      viewerId: data.viewerId,
      status: data.viewerId ? undefined : ["published", "deleted"],
    }),
    CommentRepo.getRootCommentsByPostIdCount(context.db, data.postId, {
      viewerId: data.viewerId,
      status: data.viewerId ? undefined : ["published", "deleted"],
    }),
  ]);

  // Get reply counts for each root comment
  const itemsWithReplyCount = await Promise.all(
    items.map(async (item) => {
      const replyCount = await CommentRepo.getReplyCountByRootId(
        context.db,
        data.postId,
        item.id,
        {
          viewerId: data.viewerId,
          status: data.viewerId ? undefined : ["published", "deleted"],
        },
      );
      return { ...item, replyCount };
    }),
  );

  return { items: itemsWithReplyCount, total };
}

export async function getRepliesByRootId(
  context: Context,
  data: { postId: number; rootId: number; offset?: number; limit?: number } & {
    viewerId?: string;
  },
) {
  const [items, total] = await Promise.all([
    CommentRepo.getRepliesByRootId(context.db, data.postId, data.rootId, {
      offset: data.offset,
      limit: data.limit,
      viewerId: data.viewerId,
      status: data.viewerId ? undefined : ["published", "deleted"],
    }),
    CommentRepo.getRepliesByRootIdCount(context.db, data.postId, data.rootId, {
      viewerId: data.viewerId,
      status: data.viewerId ? undefined : ["published", "deleted"],
    }),
  ]);

  return { items, total };
}

// ============ Authed User Service Methods ============

export async function createComment(
  context: AuthContext,
  data: CreateCommentInput,
) {
  // Validation: ensure 2-level structure
  let rootId: number | null = null;
  let replyToCommentId: number | null = null;

  if (data.rootId) {
    // Creating a reply - validate rootId exists and is a root comment
    const rootComment = await CommentRepo.findCommentById(
      context.db,
      data.rootId,
    );
    if (!rootComment) {
      throw new Error("ROOT_COMMENT_NOT_FOUND");
    }
    if (rootComment.rootId !== null) {
      throw new Error("INVALID_ROOT_ID");
    }
    if (rootComment.postId !== data.postId) {
      throw new Error("ROOT_COMMENT_POST_MISMATCH");
    }
    rootId = data.rootId;

    // If replyToCommentId is provided, validate it belongs to the same root
    if (data.replyToCommentId) {
      const replyToComment = await CommentRepo.findCommentById(
        context.db,
        data.replyToCommentId,
      );
      if (!replyToComment) {
        throw new Error("REPLY_TO_COMMENT_NOT_FOUND");
      }
      // replyToComment must be either the root or a reply under the same root
      const actualRootId = replyToComment.rootId ?? replyToComment.id;
      if (actualRootId !== rootId) {
        throw new Error("REPLY_TO_COMMENT_ROOT_MISMATCH");
      }
      replyToCommentId = data.replyToCommentId;
    } else {
      // If no replyToCommentId, default to replying to the root
      replyToCommentId = rootId;
    }
  } else {
    // Creating a root comment - ensure no replyToCommentId
    if (data.replyToCommentId) {
      throw new Error("ROOT_COMMENT_CANNOT_HAVE_REPLY_TO");
    }
  }

  const comment = await CommentRepo.insertComment(context.db, {
    postId: data.postId,
    content: data.content,
    rootId,
    replyToCommentId,
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
      userName: data.userName,
    }),
    CommentRepo.getAllCommentsCount(context.db, {
      status: data.status,
      postId: data.postId,
      userId: data.userId,
      userName: data.userName,
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

export async function getUserCommentStats(context: Context, userId: string) {
  return await CommentRepo.getUserCommentStats(context.db, userId);
}
