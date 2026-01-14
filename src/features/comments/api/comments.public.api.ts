import { createServerFn } from "@tanstack/react-start";
import {
  getRequestHeaders,
  setResponseHeader,
} from "@tanstack/react-start/server";
import {
  CreateCommentInputSchema,
  DeleteCommentInputSchema,
  GetCommentsByPostIdInputSchema,
  GetMyCommentsInputSchema,
  GetRepliesByRootIdInputSchema,
} from "@/features/comments/comments.schema";
import * as CommentService from "@/features/comments/comments.service";
import { authMiddleware, createRateLimitMiddleware } from "@/lib/middlewares";
import { CACHE_CONTROL } from "@/lib/constants";

// Public API - Get root comments by post ID (published + viewer's pending)
export const getRootCommentsByPostIdFn = createServerFn()
  .middleware([
    createRateLimitMiddleware({
      capacity: 60,
      interval: "1m",
      key: "comments:getRootsByPostId",
    }),
  ])
  .inputValidator(GetCommentsByPostIdInputSchema)
  .handler(async ({ data, context }) => {
    const session = await context.auth.api.getSession({
      headers: getRequestHeaders(),
    });

    const result = await CommentService.getRootCommentsByPostId(context, {
      ...data,
      viewerId: session?.user.id,
    });

    // Handle caching based on session
    if (!session) {
      Object.entries(CACHE_CONTROL.swr).forEach(([k, v]) => {
        setResponseHeader(k, v);
      });
    } else {
      Object.entries(CACHE_CONTROL.private).forEach(([k, v]) => {
        setResponseHeader(k, v);
      });
    }

    return result;
  });

// Public API - Get replies by root ID (published + viewer's pending)
export const getRepliesByRootIdFn = createServerFn()
  .middleware([
    createRateLimitMiddleware({
      capacity: 60,
      interval: "1m",
      key: "comments:getRepliesByRootId",
    }),
  ])
  .inputValidator(GetRepliesByRootIdInputSchema)
  .handler(async ({ data, context }) => {
    const session = await context.auth.api.getSession({
      headers: getRequestHeaders(),
    });

    const result = await CommentService.getRepliesByRootId(context, {
      ...data,
      viewerId: session?.user.id,
    });

    // Handle caching based on session
    if (!session) {
      Object.entries(CACHE_CONTROL.swr).forEach(([k, v]) => {
        setResponseHeader(k, v);
      });
    } else {
      Object.entries(CACHE_CONTROL.private).forEach(([k, v]) => {
        setResponseHeader(k, v);
      });
    }

    return result;
  });

// Authed User APIs
export const createCommentFn = createServerFn({
  method: "POST",
})
  .middleware([
    createRateLimitMiddleware({
      capacity: 10,
      interval: "1m",
      key: "comments:create",
    }),
    authMiddleware,
  ])
  .inputValidator(CreateCommentInputSchema)
  .handler(async ({ data, context }) => {
    return await CommentService.createComment(context, data);
  });

export const deleteCommentFn = createServerFn({
  method: "POST",
})
  .middleware([
    createRateLimitMiddleware({
      capacity: 10,
      interval: "1m",
      key: "comments:delete",
    }),
    authMiddleware,
  ])
  .inputValidator(DeleteCommentInputSchema)
  .handler(async ({ data, context }) => {
    return await CommentService.deleteComment(context, data);
  });

export const getMyCommentsFn = createServerFn()
  .middleware([
    createRateLimitMiddleware({
      capacity: 60,
      interval: "1m",
      key: "comments:getMine",
    }),
    authMiddleware,
  ])
  .inputValidator(GetMyCommentsInputSchema)
  .handler(async ({ data, context }) => {
    return await CommentService.getMyComments(context, data);
  });
