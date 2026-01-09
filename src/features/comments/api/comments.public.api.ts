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
} from "@/features/comments/comments.schema";
import * as CommentService from "@/features/comments/comments.service";
import { createAuthedFn, createRateLimitMiddleware } from "@/lib/middlewares";
import { CACHE_CONTROL } from "@/lib/constants";

// Public API - Get comments by post ID (published + viewer's pending)
export const getCommentsByPostIdFn = createServerFn()
  .middleware([
    createRateLimitMiddleware({
      capacity: 60,
      interval: "1m",
      key: "comments:getByPostId",
    }),
  ])
  .inputValidator(GetCommentsByPostIdInputSchema)
  .handler(async ({ data, context }) => {
    const session = await context.auth.api.getSession({
      headers: getRequestHeaders(),
    });

    const result = await CommentService.getCommentsByPostId(context, {
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
export const createCommentFn = createAuthedFn({
  method: "POST",
})
  .middleware([
    createRateLimitMiddleware({
      capacity: 10,
      interval: "1m",
      key: "comments:create",
    }),
  ])
  .inputValidator(CreateCommentInputSchema)
  .handler(async ({ data, context }) => {
    return await CommentService.createComment(context, data);
  });

export const deleteCommentFn = createAuthedFn({
  method: "POST",
})
  .middleware([
    createRateLimitMiddleware({
      capacity: 10,
      interval: "1m",
      key: "comments:delete",
    }),
  ])
  .inputValidator(DeleteCommentInputSchema)
  .handler(async ({ data, context }) => {
    return await CommentService.deleteComment(context, data);
  });

export const getMyCommentsFn = createAuthedFn()
  .middleware([
    createRateLimitMiddleware({
      capacity: 60,
      interval: "1m",
      key: "comments:getMine",
    }),
  ])
  .inputValidator(GetMyCommentsInputSchema)
  .handler(async ({ data, context }) => {
    return await CommentService.getMyComments(context, data);
  });
