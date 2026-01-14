import { createServerFn } from "@tanstack/react-start";
import {
  FindPostBySlugInputSchema,
  GetPostsCursorInputSchema,
} from "@/features/posts/posts.schema";
import * as PostService from "@/features/posts/posts.service";
import {
  createCacheHeaderMiddleware,
  createRateLimitMiddleware,
} from "@/lib/middlewares";

export const getPostsCursorFn = createServerFn()
  .middleware([
    createRateLimitMiddleware({
      capacity: 60,
      interval: "1m",
      key: "posts:getCursor",
    }),
    createCacheHeaderMiddleware("swr"),
  ])
  .inputValidator(GetPostsCursorInputSchema)
  .handler(async ({ data, context }) => {
    return await PostService.getPostsCursor(context, data);
  });

export const findPostBySlugFn = createServerFn()
  .middleware([
    createRateLimitMiddleware({
      capacity: 60,
      interval: "1m",
      key: "posts:findBySlug",
    }),
    createCacheHeaderMiddleware("swr"),
  ])
  .inputValidator(FindPostBySlugInputSchema)
  .handler(async ({ data, context }) => {
    return await PostService.findPostBySlug(context, data);
  });
