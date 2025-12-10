import {
  deletePost,
  findPostById,
  findPostBySlug,
  findPostBySlugPublic,
  getPosts,
  getPostsCount,
  insertPost,
  slugExists,
  updatePost,
} from "@/lib/db/queries/posts";
import { PostCategory, PostStatus } from "@/lib/db/schema";
import { slugify } from "@/lib/editor-utils";
import { deleteSearchDoc } from "@/lib/search/ops";
import { generateTableOfContents } from "@/lib/toc";
import { createServerFn } from "@tanstack/react-start";
import type { JSONContent } from "@tiptap/react";
import { z } from "zod";

export const createPostFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      title: z.string(),
      slug: z.string(),
      summary: z.string().optional(),
      category: z.custom<PostCategory>().optional(),
      contentJson: z.custom<JSONContent>().nullable(),
      status: z.enum(["draft", "published", "archived"]).catch("draft"),
      readTimeInMinutes: z.number().optional(),
      publishedAt: z.date().nullable(),
    })
  )
  .handler(async ({ data, context }) => {
    await insertPost(context.db, {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      category: data.category,
      contentJson: data.contentJson,
      status: data.status,
      readTimeInMinutes: data.readTimeInMinutes,
      publishedAt: data.publishedAt,
    });
  });

export const getPostsFn = createServerFn()
  .inputValidator(
    z.object({
      offset: z.number().optional(),
      limit: z.number().optional(),
      category: z.custom<PostCategory>().optional(),
      status: z.custom<PostStatus>().optional(),
      publicOnly: z.boolean().optional(),
    })
  )
  .handler(async ({ data, context }) => {
    return await getPosts(context.db, {
      offset: data.offset ?? 0,
      limit: data.limit ?? 10,
      category: data.category,
      status: data.status,
      publicOnly: data.publicOnly,
    });
  });

export const getPostsCountFn = createServerFn()
  .inputValidator(
    z.object({
      category: z.custom<PostCategory>().optional(),
      status: z.custom<PostStatus>().optional(),
      publicOnly: z.boolean().optional(),
    })
  )
  .handler(async ({ data, context }) => {
    return await getPostsCount(context.db, {
      category: data.category,
      status: data.status,
      publicOnly: data.publicOnly,
    });
  });

export const findPostBySlugFn = createServerFn()
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data, context }) => {
    const post = await findPostBySlug(context.db, data.slug);
    if (!post) return null;
    return {
      ...post,
      toc: generateTableOfContents(post.contentJson),
    };
  });

/**
 * Find post by slug for public access
 * Only returns if published AND publishedAt <= now
 */
export const findPostBySlugPublicFn = createServerFn()
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data, context }) => {
    const post = await findPostBySlugPublic(context.db, data.slug);
    if (!post) return null;
    return {
      ...post,
      toc: generateTableOfContents(post.contentJson),
    };
  });

export const findPostByIdFn = createServerFn()
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data, context }) => {
    return await findPostById(context.db, data.id);
  });

export const updatePostFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      id: z.number(),
      title: z.string().optional(),
      slug: z.string().optional(),
      summary: z.string().optional(),
      category: z.custom<PostCategory>().optional(),
      contentJson: z.custom<JSONContent>().nullable().optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
      readTimeInMinutes: z.number().optional(),
      publishedAt: z.date().nullable().optional(),
    })
  )
  .handler(async ({ data, context }) => {
    await updatePost(context.db, data.id, {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      category: data.category,
      contentJson: data.contentJson,
      status: data.status,
      readTimeInMinutes: data.readTimeInMinutes,
      publishedAt: data.publishedAt,
    });
  });

export const deletePostFn = createServerFn({
  method: "POST",
})
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data, context }) => {
    await deletePost(context.db, data.id);
    context.executionCtx.waitUntil(deleteSearchDoc(context.env, data.id));
  });

export const generateSlugFn = createServerFn()
  .inputValidator(
    z.object({
      title: z.string().min(1, "Title is required"),
      excludeId: z.number().optional(), // For editing existing posts
    })
  )
  .handler(async ({ data, context }) => {
    const baseSlug = slugify(data.title) || "untitled-log";

    // Check if base slug is available
    const baseExists = await slugExists(context.db, baseSlug, data.excludeId);
    if (!baseExists) {
      return { slug: baseSlug };
    }

    // Try numbered suffixes until we find a unique one
    const MAX_ATTEMPTS = 100;
    for (let i = 1; i <= MAX_ATTEMPTS; i++) {
      const candidateSlug = `${baseSlug}-${i}`;
      const exists = await slugExists(
        context.db,
        candidateSlug,
        data.excludeId
      );
      if (!exists) {
        return { slug: candidateSlug };
      }
    }

    // Fallback: use timestamp
    const fallbackSlug = `${baseSlug}-${Date.now()}`;
    return { slug: fallbackSlug };
  });
