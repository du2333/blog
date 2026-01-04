import {
  DeletePostInputSchema,
  FindPostByIdInputSchema,
  FindPostBySlugInputSchema,
  GenerateSlugInputSchema,
  GetPostsCountInputSchema,
  GetPostsInputSchema,
  PreviewSummaryInputSchema,
  StartPostProcessInputSchema,
  UpdatePostInputSchema,
} from "@/features/posts/posts.schema";
import * as PostService from "@/features/posts/posts.service";
import { createAdminFn } from "@/lib/middlewares";

export const generateSlugFn = createAdminFn()
  .inputValidator(GenerateSlugInputSchema)
  .handler(async ({ data, context }) => {
    return await PostService.generateSlug(context, data);
  });

export const createEmptyPostFn = createAdminFn({
  method: "POST",
}).handler(async ({ context }) => {
  return await PostService.createEmptyPost(context);
});

export const getPostsFn = createAdminFn()
  .inputValidator(GetPostsInputSchema)
  .handler(async ({ data, context }) => {
    return await PostService.getPosts(context, data);
  });

export const getPostsCountFn = createAdminFn()
  .inputValidator(GetPostsCountInputSchema)
  .handler(async ({ data, context }) => {
    return await PostService.getPostsCount(context, data);
  });

export const findPostBySlugFn = createAdminFn()
  .inputValidator(FindPostBySlugInputSchema)
  .handler(async ({ data, context }) => {
    return await PostService.findPostBySlugAdmin(context, data);
  });

export const findPostByIdFn = createAdminFn()
  .inputValidator(FindPostByIdInputSchema)
  .handler(async ({ data, context }) => {
    return await PostService.findPostById(context, data);
  });

export const updatePostFn = createAdminFn({
  method: "POST",
})
  .inputValidator(UpdatePostInputSchema)
  .handler(async ({ data, context }) => {
    return await PostService.updatePost(context, data);
  });

export const deletePostFn = createAdminFn({
  method: "POST",
})
  .inputValidator(DeletePostInputSchema)
  .handler(async ({ data, context }) => {
    return await PostService.deletePost(context, data);
  });

export const previewSummaryFn = createAdminFn({
  method: "POST",
})
  .inputValidator(PreviewSummaryInputSchema)
  .handler(async ({ data, context }) => {
    return await PostService.previewSummary(context, data);
  });

export const startPostProcessWorkflowFn = createAdminFn()
  .inputValidator(StartPostProcessInputSchema)
  .handler(async ({ data, context }) => {
    return await PostService.startPostProcessWorkflow(context, data);
  });
