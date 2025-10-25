import { getPosts, insertPost, updatePost } from "@/db/queries/posts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const createPostFn = createServerFn()
  .inputValidator(
    z.object({
      title: z.string(),
      slug: z.string(),
      //   contentJson: z.string(),
      contentHtml: z.string(),
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
    })
  )
  .handler(async ({ data }) => {
    return await getPosts({
      offset: data.offset ?? 0,
      limit: data.limit ?? 10,
    });
  });

export const updatePostFn = createServerFn()
  .inputValidator(
    z.object({
      id: z.number(),
      title: z.string(),
      slug: z.string(),
      contentHtml: z.string(),
      status: z.enum(["draft", "published", "archived"]).catch("draft"),
      publishedAt: z.date().nullable(),
    })
  )
  .handler(async ({ data }) => {
    await updatePost(data.id, {
      title: data.title,
      slug: data.slug,
      contentHtml: data.contentHtml,
      status: data.status,
      publishedAt: data.publishedAt,
    });
  });
