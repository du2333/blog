import {
  FindPostBySlugInputSchema,
  GetPostsCursorInputSchema,
} from "@/features/posts/posts.schema";
import * as postService from "@/features/posts/posts.service";
import { createCachedFn } from "@/lib/middlewares";

export const getPostsCursorFn = createCachedFn()
  .inputValidator(GetPostsCursorInputSchema)
  .handler(async ({ data, context }) => {
    return await postService.getPostsCursor(context, data);
  });

export const findPostBySlugFn = createCachedFn()
  .inputValidator(FindPostBySlugInputSchema)
  .handler(async ({ data, context }) => {
    return await postService.findPostBySlug(context, data);
  });
