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
  .handler(({ data, context }) => PostService.generateSlug(context, data));

export const createEmptyPostFn = createAdminFn({
  method: "POST",
}).handler(({ context }) => PostService.createEmptyPost(context));

export const getPostsFn = createAdminFn()
  .inputValidator(GetPostsInputSchema)
  .handler(({ data, context }) => PostService.getPosts(context, data));

export const getPostsCountFn = createAdminFn()
  .inputValidator(GetPostsCountInputSchema)
  .handler(({ data, context }) => PostService.getPostsCount(context, data));

export const findPostBySlugFn = createAdminFn()
  .inputValidator(FindPostBySlugInputSchema)
  .handler(({ data, context }) =>
    PostService.findPostBySlugAdmin(context, data),
  );

export const findPostByIdFn = createAdminFn()
  .inputValidator(FindPostByIdInputSchema)
  .handler(({ data, context }) => PostService.findPostById(context, data));

export const updatePostFn = createAdminFn({
  method: "POST",
})
  .inputValidator(UpdatePostInputSchema)
  .handler(({ data, context }) => PostService.updatePost(context, data));

export const deletePostFn = createAdminFn({
  method: "POST",
})
  .inputValidator(DeletePostInputSchema)
  .handler(({ data, context }) => PostService.deletePost(context, data));

export const previewSummaryFn = createAdminFn({
  method: "POST",
})
  .inputValidator(PreviewSummaryInputSchema)
  .handler(({ data, context }) => PostService.previewSummary(context, data));

export const startPostProcessWorkflowFn = createAdminFn()
  .inputValidator(StartPostProcessInputSchema)
  .handler(({ data, context }) =>
    PostService.startPostProcessWorkflow(context, data),
  );
