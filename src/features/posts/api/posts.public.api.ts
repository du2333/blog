import {
  FindPostBySlugInputSchema,
  GetPostsCursorInputSchema,
} from "@/features/posts/posts.schema";
import * as PostService from "@/features/posts/posts.service";
import { createCachedFn, createRateLimitMiddleware } from "@/lib/middlewares";

export const getPostsCursorFn = createCachedFn()
  .middleware([
    createRateLimitMiddleware({
      capacity: 60,
      interval: "1m",
    }),
  ])
  .inputValidator(GetPostsCursorInputSchema)
  .handler(async ({ data, context }) => {
    return await PostService.getPostsCursor(context, data);
  });

export const findPostBySlugFn = createCachedFn()
  .middleware([
    createRateLimitMiddleware({
      capacity: 60,
      interval: "1m",
    }),
  ])
  .inputValidator(FindPostBySlugInputSchema)
  .handler(async ({ data, context }) => {
    return await PostService.findPostBySlug(context, data);
  });
