import {
  findPostById,
  findPostBySlug,
  getPosts,
  getPostsCount,
  insertPost,
  updatePost,
} from "@/db/queries/posts";
import { generateTableOfContents } from "@/lib/toc";
import { createServerFn } from "@tanstack/react-start";
import type { JSONContent } from "@tiptap/react";
import { z } from "zod";
import { PostCategory, PostStatus } from "@/db/schema";

export const createPostFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      title: z.string(),
      slug: z.string(),
      contentJson: z.custom<JSONContent>(),
      status: z.enum(["draft", "published", "archived"]).catch("draft"),
      publishedAt: z.date().nullable(),
    })
  )
  .handler(async ({ data }) => {
    await insertPost({ ...data });
  });

export const getPostsFn = createServerFn()
  .inputValidator(
    z.object({
      offset: z.number().optional(),
      limit: z.number().optional(),
      category: z.custom<PostCategory>().optional(),
      status: z.custom<PostStatus>().optional(),
    })
  )
  .handler(async ({ data }) => {
    return await getPosts({
      offset: data.offset ?? 0,
      limit: data.limit ?? 10,
      category: data.category,
      status: data.status,
    });
  });

export const getPostsCountFn = createServerFn()
  .inputValidator(
    z.object({
      category: z.custom<PostCategory>().optional(),
      status: z.custom<PostStatus>().optional(),
    })
  )
  .handler(async ({ data }) => {
    return await getPostsCount({
      category: data.category,
      status: data.status,
    });
  });

export const findPostBySlugFn = createServerFn()
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const post = await findPostBySlug(data.slug);
    if (!post) return null;
    return {
      ...post,
      toc: generateTableOfContents(post.contentJson),
    };
  });

export const findPostByIdFn = createServerFn()
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    return await findPostById(data.id);
  });

export const updatePostFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      id: z.number(),
      title: z.string().optional(),
      slug: z.string().optional(),
      contentJson: z.custom<JSONContent>().optional(),
    })
  )
  .handler(async ({ data }) => {
    await updatePost(data.id, {
      title: data.title,
      slug: data.slug,
      contentJson: data.contentJson,
    });
  });
