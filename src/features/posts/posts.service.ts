import type {
  DeletePostInput,
  FindPostByIdInput,
  FindPostBySlugInput,
  GenerateSlugInput,
  GetPostsCountInput,
  GetPostsCursorInput,
  GetPostsInput,
  PreviewSummaryInput,
  StartPostProcessInput,
  UpdatePostInput,
} from "@/features/posts/posts.schema";
import type { DB } from "@/lib/db";
import {
  bumpCacheVersion,
  cachedData,
  deleteCachedData,
  getCacheVersion,
} from "@/features/cache/cache.data";
import { syncPostMedia } from "@/features/posts/data/post-media.data";
import * as postRepo from "@/features/posts/data/posts.data";
import {
  PostListResponseSchema,
  PostWithTocSchema,
} from "@/features/posts/posts.schema";
import { summarizeText } from "@/lib/ai/summarizer";
import { generateTableOfContents } from "@/lib/editor/toc";
import { convertToPlainText, slugify } from "@/lib/editor/utils";
import { purgePostCDNCache } from "@/lib/revalidate";
import { deleteSearchDoc } from "@/lib/search/ops";

export async function getPostsCursor(
  context: Context,
  data: GetPostsCursorInput,
) {
  const { env, db, executionCtx } = context;
  const fetcher = async () =>
    await postRepo.getPostsCursor(db, {
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
}

export async function findPostBySlug(
  context: Context,
  data: FindPostBySlugInput,
) {
  const { env, db, executionCtx } = context;
  const fetcher = async () => {
    const post = await postRepo.findPostBySlug(db, data.slug, {
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
}

export async function generateSummaryByPostId({
  db,
  postId,
}: {
  db: DB;
  postId: number;
}) {
  const post = await postRepo.findPostById(db, postId);

  if (!post) {
    throw new Error("Post not found");
  }

  // 如果已经存在摘要，则直接返回
  if (post.summary && post.summary.trim().length > 0) return post;

  const plainText = convertToPlainText(post.contentJson);
  if (plainText.length < 100) {
    return post;
  }

  try {
    const { summary } = await summarizeText(db, plainText);

    const updatedPost = await postRepo.updatePost(db, post.id, { summary });

    return updatedPost;
  } catch (error) {
    // 如果 AI 服务未配置，静默跳过，返回原 post
    if (error instanceof Error && error.message === "AI_NOT_CONFIGURED") {
      return post;
    }
    // 其他错误继续抛出
    throw error;
  }
}

// ============ Admin Service Methods ============

export async function generateSlug(context: Context, data: GenerateSlugInput) {
  const baseSlug = slugify(data.title);

  // Check if base slug is available
  const baseExists = await postRepo.slugExists(context.db, baseSlug, {
    excludeId: data.excludeId,
  });
  if (!baseExists) {
    return { slug: baseSlug };
  }

  // Try numbered suffixes until we find a unique one
  const MAX_ATTEMPTS = 100;
  for (let i = 1; i <= MAX_ATTEMPTS; i++) {
    const candidateSlug = `${baseSlug}-${i}`;
    const exists = await postRepo.slugExists(context.db, candidateSlug, {
      excludeId: data.excludeId,
    });
    if (!exists) {
      return { slug: candidateSlug };
    }
  }

  // Fallback: use timestamp
  const fallbackSlug = `${baseSlug}-${Date.now()}`;
  return { slug: fallbackSlug };
}

export async function createEmptyPost(context: Context) {
  const { slug } = await generateSlug(context, { title: "" });

  const post = await postRepo.insertPost(context.db, {
    title: "",
    slug,
    summary: "",
    status: "draft",
    readTimeInMinutes: 1,
    contentJson: null,
  });

  // No cache/index operations for drafts

  return { id: post.id };
}

export async function getPosts(context: Context, data: GetPostsInput) {
  return await postRepo.getPosts(context.db, {
    offset: data.offset ?? 0,
    limit: data.limit ?? 10,
    category: data.category,
    status: data.status,
    publicOnly: data.publicOnly,
    search: data.search,
    sortDir: data.sortDir,
  });
}

export async function getPostsCount(
  context: Context,
  data: GetPostsCountInput,
) {
  return await postRepo.getPostsCount(context.db, {
    category: data.category,
    status: data.status,
    publicOnly: data.publicOnly,
    search: data.search,
  });
}

export async function findPostBySlugAdmin(
  context: Context,
  data: FindPostBySlugInput,
) {
  const post = await postRepo.findPostBySlug(context.db, data.slug, {
    publicOnly: false,
  });
  if (!post) return null;
  return {
    ...post,
    toc: generateTableOfContents(post.contentJson),
  };
}

export async function findPostById(context: Context, data: FindPostByIdInput) {
  return await postRepo.findPostById(context.db, data.id);
}

export async function updatePost(context: Context, data: UpdatePostInput) {
  const post = await postRepo.updatePost(context.db, data.id, data.data);
  if (data.data.contentJson !== undefined) {
    context.executionCtx.waitUntil(
      syncPostMedia(context.db, post.id, data.data.contentJson),
    );
  }

  return post;
}

export async function deletePost(context: Context, data: DeletePostInput) {
  const post = await postRepo.findPostById(context.db, data.id);
  if (!post) return;

  await postRepo.deletePost(context.db, data.id);

  // Only clear cache/index for published posts
  if (post.status === "published") {
    const tasks = [];
    tasks.push(deleteCachedData(context, ["post", post.slug]));
    tasks.push(bumpCacheVersion(context, "posts:list"));
    tasks.push(deleteSearchDoc(context.env, data.id));
    tasks.push(purgePostCDNCache(context.env, post.slug));

    context.executionCtx.waitUntil(Promise.all(tasks));
  }
}

export async function previewSummary(
  context: Context,
  data: PreviewSummaryInput,
) {
  const plainText = convertToPlainText(data.contentJson);
  try {
    const { summary } = await summarizeText(context.db, plainText);
    return { summary };
  } catch (error) {
    if (error instanceof Error && error.message === "AI_NOT_CONFIGURED") {
      return { error: "AI 服务未配置" };
    }
    throw error;
  }
}

export async function startPostProcessWorkflow(
  context: Context,
  data: StartPostProcessInput,
) {
  if (data.status !== "published") return;

  // 生成摘要， 更新搜索索引
  await context.env.POST_PROCESS_WORKFLOW.create({
    params: {
      postId: data.id,
    },
  });
}
