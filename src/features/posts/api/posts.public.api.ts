import {
  FindPostBySlugInputSchema,
  GetPostsCursorInputSchema,
} from "@/features/posts/posts.schema";
import * as PostService from "@/features/posts/posts.service";
import { createCachedFn } from "@/lib/middlewares";

export const getPostsCursorFn = createCachedFn()
  .inputValidator(GetPostsCursorInputSchema)
  .handler(async ({ data, context }) => {
    return await PostService.getPostsCursor(context, data);
  });

export const findPostBySlugFn = createCachedFn()
  .inputValidator(FindPostBySlugInputSchema)
  .handler(async ({ data, context }) => {
    return await PostService.findPostBySlug(context, data);
  });
