import type {
  FindPostBySlugInput,
  GetPostsCursorInput,
} from "@/features/posts/post.schema";
import type { DB } from "@/lib/db";
import { cachedData, getCacheVersion } from "@/features/cache/cache.data";
import * as postRepo from "@/features/posts/data/posts.data";
import {
  PostListResponseSchema,
  PostWithTocSchema,
} from "@/features/posts/post.schema";
import { summarizeText } from "@/lib/ai/summarizer";
import { generateTableOfContents } from "@/lib/editor/toc";
import { convertToPlainText } from "@/lib/editor/utils";

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
