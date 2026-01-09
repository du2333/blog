import {
  DeleteCommentInputSchema,
  GetAllCommentsInputSchema,
  ModerateCommentInputSchema,
} from "@/features/comments/comments.schema";
import * as CommentService from "@/features/comments/comments.service";
import { createAdminFn } from "@/lib/middlewares";

// Admin API - Get all comments with filters
export const getAllCommentsFn = createAdminFn()
  .inputValidator(GetAllCommentsInputSchema)
  .handler(async ({ data, context }) => {
    return await CommentService.getAllComments(context, data);
  });

// Admin API - Moderate a comment (approve/reject)
export const moderateCommentFn = createAdminFn({
  method: "POST",
})
  .inputValidator(ModerateCommentInputSchema)
  .handler(async ({ data, context }) => {
    return await CommentService.moderateComment(context, data);
  });

// Admin API - Hard delete a comment
export const adminDeleteCommentFn = createAdminFn({
  method: "POST",
})
  .inputValidator(DeleteCommentInputSchema)
  .handler(async ({ data, context }) => {
    return await CommentService.adminDeleteComment(context, data);
  });
