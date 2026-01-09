import {
  CreateCommentInputSchema,
  DeleteCommentInputSchema,
  GetCommentsByPostIdInputSchema,
  GetMyCommentsInputSchema,
  UpdateCommentInputSchema,
} from "@/features/comments/comments.schema";
import * as CommentService from "@/features/comments/comments.service";
import {
  createAuthedFn,
  createCachedFn,
  createRateLimitMiddleware,
} from "@/lib/middlewares";

// Public API - Get comments by post ID (only published)
export const getCommentsByPostIdFn = createCachedFn()
  .middleware([
    createRateLimitMiddleware({
      capacity: 60,
      interval: "1m",
      key: "comments:getByPostId",
    }),
  ])
  .inputValidator(GetCommentsByPostIdInputSchema)
  .handler(async ({ data, context }) => {
    return await CommentService.getCommentsByPostId(context, data);
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

export const updateCommentFn = createAuthedFn({
  method: "POST",
})
  .middleware([
    createRateLimitMiddleware({
      capacity: 10,
      interval: "1m",
      key: "comments:update",
    }),
  ])
  .inputValidator(UpdateCommentInputSchema)
  .handler(async ({ data, context }) => {
    return await CommentService.updateComment(context, data);
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
