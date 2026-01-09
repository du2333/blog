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
    }),
  ])
  .inputValidator(CreateCommentInputSchema)
  .handler(async ({ data, context }) => {
    return await CommentService.createComment(context, data);
  });

export const updateCommentFn = createAuthedFn({
  method: "POST",
})
  .inputValidator(UpdateCommentInputSchema)
  .handler(async ({ data, context }) => {
    return await CommentService.updateComment(context, data);
  });

export const deleteCommentFn = createAuthedFn({
  method: "POST",
})
  .inputValidator(DeleteCommentInputSchema)
  .handler(async ({ data, context }) => {
    return await CommentService.deleteComment(context, data);
  });

export const getMyCommentsFn = createAuthedFn()
  .inputValidator(GetMyCommentsInputSchema)
  .handler(async ({ data, context }) => {
    return await CommentService.getMyComments(context, data);
  });
