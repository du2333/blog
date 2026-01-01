import { z } from "zod";
import type { PostCategory } from "@/lib/db/schema";
import { cachedData, getCacheVersion } from "@/features/cache/cache.data";
import {
  findPostBySlug,
  getPostsCursor,
} from "@/features/posts/data/posts.data";
import { PostSelectSchema } from "@/lib/db/schema";
import { generateTableOfContents } from "@/lib/editor/toc";
import { createCachedFn } from "@/lib/middlewares";

const CachedPostSchema = PostSelectSchema.extend({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  publishedAt: z.coerce.date().nullable(),
});

const PostItemSchema = CachedPostSchema.omit({ contentJson: true });
const PostListResponseSchema = z.object({
  items: z.array(PostItemSchema),
  nextCursor: z.number().nullable(),
});
const PostWithTocSchema = CachedPostSchema.extend({
  toc: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      level: z.number(),
    }),
  ),
}).nullable();

export const getPostsCursorFn = createCachedFn()
  .inputValidator(
    z.object({
      cursor: z.number().optional(),
      limit: z.number().optional(),
      category: z.custom<PostCategory>().optional(),
    }),
  )
  .handler(async ({ data, context: { env, executionCtx, db } }) => {
    const fetcher = async () =>
      await getPostsCursor(db, {
        cursor: data.cursor,
        limit: data.limit,
        category: data.category,
        publicOnly: true,
      });

    const version = await getCacheVersion({ env }, "posts:list");
    const cacheKey = [
      "posts",
      "list",
      version,
      data.category ?? "all",
      data.limit ?? 10,
      data.cursor ?? 0,
    ];

    return await cachedData(
      {
        env,
        executionCtx,
      },
      cacheKey,
      PostListResponseSchema,
      fetcher,
      {
        ttl: 60 * 60 * 24 * 7, // 7 days
      },
    );
  });

export const findPostBySlugFn = createCachedFn()
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data, context: { db, executionCtx, env } }) => {
    const fetcher = async () => {
      const post = await findPostBySlug(db, data.slug, {
        publicOnly: true,
      });
      if (!post) return null;
      return {
        ...post,
        toc: generateTableOfContents(post.contentJson),
      };
    };

    const cacheKey = ["post", data.slug];
    return await cachedData(
      {
        env,
        executionCtx,
      },
      cacheKey,
      PostWithTocSchema,
      fetcher,
      {
        ttl: 60 * 60 * 24 * 7, // 7 days
      },
    );
  });
