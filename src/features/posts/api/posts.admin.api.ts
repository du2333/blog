import { syncPostMedia } from "@/features/posts/data/post-media.data";
import {
  deletePost,
  findPostById,
  findPostBySlug,
  getPosts,
  getPostsCount,
  insertPost,
  slugExists,
  updatePost,
} from "@/features/posts/data/posts.data";
import { bumpCacheVersion, deleteCachedData } from "@/lib/cache/cache.data";
import { PostCategory, PostStatus, PostUpdateSchema } from "@/lib/db/schema";
import { generateTableOfContents } from "@/lib/editor/toc";
import { slugify } from "@/lib/editor/utils";
import { adminMiddleware } from "@/lib/middlewares";
import { deleteSearchDoc } from "@/lib/search/ops";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const createEmptyPostFn = createServerFn({
  method: "POST",
})
  .middleware([adminMiddleware])
  .handler(async ({ context }) => {
    const { slug } = await generateSlugFn({
      data: {
        title: "",
      },
    });

    const post = await insertPost(context.db, {
      title: "",
      slug,
      summary: "",
      status: "draft",
      readTimeInMinutes: 1,
      contentJson: null,
    });

    context.executionCtx.waitUntil(bumpCacheVersion(context, "posts:list"));

    return { id: post.id };
  });

export const getPostsFn = createServerFn()
  .middleware([adminMiddleware])
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
  .middleware([adminMiddleware])
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
  .middleware([adminMiddleware])
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data, context }) => {
    const post = await findPostBySlug(context.db, data.slug, {
      publicOnly: false,
    });
    if (!post) return null;
    return {
      ...post,
      toc: generateTableOfContents(post.contentJson),
    };
  });

export const findPostByIdFn = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data, context }) => {
    return await findPostById(context.db, data.id);
  });

export const updatePostFn = createServerFn({
  method: "POST",
})
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.number(), data: PostUpdateSchema }))
  .handler(async ({ data: { id, data }, context }) => {
    const post = await updatePost(context.db, id, data);
    if (data.contentJson !== undefined) {
      context.executionCtx.waitUntil(
        syncPostMedia(context.db, post.id, data.contentJson)
      );
    }

    return post;
  });

export const deletePostFn = createServerFn({
  method: "POST",
})
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data, context }) => {
    const post = await findPostById(context.db, data.id);
    if (!post) return;

    await deletePost(context.db, data.id);

    const tasks = [];
    tasks.push(deleteCachedData(context, ["post", post.slug]));
    tasks.push(bumpCacheVersion(context, "posts:list"));
    tasks.push(deleteSearchDoc(context.env, data.id));
    context.executionCtx.waitUntil(Promise.all(tasks));
  });

export const generateSlugFn = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(
    z.object({
      title: z.string().optional(),
      excludeId: z.number().optional(), // For editing existing posts
    })
  )
  .handler(async ({ data, context }) => {
    const baseSlug = slugify(data.title);

    // Check if base slug is available
    const baseExists = await slugExists(context.db, baseSlug, {
      excludeId: data.excludeId,
    });
    if (!baseExists) {
      return { slug: baseSlug };
    }

    // Try numbered suffixes until we find a unique one
    const MAX_ATTEMPTS = 100;
    for (let i = 1; i <= MAX_ATTEMPTS; i++) {
      const candidateSlug = `${baseSlug}-${i}`;
      const exists = await slugExists(context.db, candidateSlug, {
        excludeId: data.excludeId,
      });
      if (!exists) {
        return { slug: candidateSlug };
      }
    }

    // Fallback: use timestamp
    const fallbackSlug = `${baseSlug}-${Date.now()}`;
    return { slug: fallbackSlug };
  });

export const startPostProcessWorkflowFn = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(z.object({ postId: z.number(), slug: z.string() }))
  .handler(async ({ data, context }) => {
    // 生成摘要， 更新搜索索引
    await context.env.POST_PROCESS_WORKFLOW.create({
      params: {
        postId: data.postId,
      },
    });

    // 删除缓存， 更新缓存版本
    const tasks = [];
    tasks.push(deleteCachedData(context, ["post", data.slug]));
    tasks.push(bumpCacheVersion(context, "posts:list"));

    context.executionCtx.waitUntil(Promise.all(tasks));
  });
