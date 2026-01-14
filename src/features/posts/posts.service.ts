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
import * as CacheService from "@/features/cache/cache.service";
import { syncPostMedia } from "@/features/posts/data/post-media.data";
import * as PostRepo from "@/features/posts/data/posts.data";
import {
  POSTS_CACHE_KEYS,
  PostListResponseSchema,
  PostWithTocSchema,
} from "@/features/posts/posts.schema";
import * as AiService from "@/features/ai/ai.service";
import { generateTableOfContents } from "@/features/posts/utils/toc";
import { convertToPlainText, slugify } from "@/features/posts/utils/content";
import { purgePostCDNCache } from "@/lib/invalidate";
import * as SearchService from "@/features/search/search.service";

export async function getPostsCursor(
  context: DbContext & { executionCtx: ExecutionContext },
  data: GetPostsCursorInput,
) {
  const fetcher = async () =>
    await PostRepo.getPostsCursor(context.db, {
      cursor: data.cursor,
      limit: data.limit,
      publicOnly: true,
      tagName: data.tagName,
    });

  const version = await CacheService.getVersion(context, "posts:list");
  const cacheKey = POSTS_CACHE_KEYS.list(
    version,
    data.limit ?? 10,
    data.cursor ?? 0,
    data.tagName ?? "all",
  );

  return await CacheService.get(
    context,
    cacheKey,
    PostListResponseSchema,
    fetcher,
    {
      ttl: 60 * 60 * 24 * 7, // 7 days
    },
  );
}

export async function findPostBySlug(
  context: DbContext & { executionCtx: ExecutionContext },
  data: FindPostBySlugInput,
) {
  const fetcher = async () => {
    const post = await PostRepo.findPostBySlug(context.db, data.slug, {
      publicOnly: true,
    });
    if (!post) return null;
    return {
      ...post,
      toc: generateTableOfContents(post.contentJson),
    };
  };

  const version = await CacheService.getVersion(context, "posts:detail");
  const cacheKey = POSTS_CACHE_KEYS.detail(version, data.slug);
  return await CacheService.get(context, cacheKey, PostWithTocSchema, fetcher, {
    ttl: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function generateSummaryByPostId({
  context,
  postId,
}: {
  context: DbContext;
  postId: number;
}) {
  const post = await PostRepo.findPostById(context.db, postId);

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
    const { summary } = await AiService.summarizeText(context, plainText);

    const updatedPost = await PostRepo.updatePost(context.db, post.id, {
      summary,
    });

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

export async function generateSlug(
  context: DbContext,
  data: GenerateSlugInput,
) {
  const baseSlug = slugify(data.title);
  // 1. 先查有没有完全一样的 (比如 'hello-world')
  const exactMatch = await PostRepo.slugExists(context.db, baseSlug, {
    excludeId: data.excludeId,
  });
  if (!exactMatch) {
    return { slug: baseSlug };
  }

  // 2. 既然 'hello-world' 被占了，那就查所有 'hello-world-%' 的
  const similarSlugs = await PostRepo.findSimilarSlugs(context.db, baseSlug, {
    excludeId: data.excludeId,
  });

  // 3. 在内存里找最大的数字后缀
  // 正则含义：匹配以 "-数字" 结尾的字符串，并捕获那个数字
  const regex = new RegExp(`^${baseSlug}-(\\d+)$`);

  let maxSuffix = 0;
  for (const slug of similarSlugs) {
    const match = slug.match(regex);
    if (match) {
      const number = parseInt(match[1], 10);
      if (number > maxSuffix) {
        maxSuffix = number;
      }
    }
  }

  // 4. 结果就是最大值 + 1
  return { slug: `${baseSlug}-${maxSuffix + 1}` };
}

export async function createEmptyPost(context: DbContext) {
  const { slug } = await generateSlug(context, { title: "" });

  const post = await PostRepo.insertPost(context.db, {
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

export async function getPosts(context: DbContext, data: GetPostsInput) {
  return await PostRepo.getPosts(context.db, {
    offset: data.offset ?? 0,
    limit: data.limit ?? 10,
    status: data.status,
    publicOnly: data.publicOnly,
    search: data.search,
    sortDir: data.sortDir,
  });
}

export async function getPostsCount(
  context: DbContext,
  data: GetPostsCountInput,
) {
  return await PostRepo.getPostsCount(context.db, {
    status: data.status,
    publicOnly: data.publicOnly,
    search: data.search,
  });
}

export async function findPostBySlugAdmin(
  context: DbContext,
  data: FindPostBySlugInput,
) {
  const post = await PostRepo.findPostBySlug(context.db, data.slug, {
    publicOnly: false,
  });
  if (!post) return null;
  return {
    ...post,
    toc: generateTableOfContents(post.contentJson),
  };
}

export async function findPostById(
  context: DbContext,
  data: FindPostByIdInput,
) {
  return await PostRepo.findPostById(context.db, data.id);
}

export async function updatePost(
  context: DbContext & { executionCtx: ExecutionContext },
  data: UpdatePostInput,
) {
  const post = await PostRepo.updatePost(context.db, data.id, data.data);
  if (!post) {
    throw new Error("Post not found");
  }

  if (data.data.contentJson !== undefined) {
    context.executionCtx.waitUntil(
      syncPostMedia(context.db, post.id, data.data.contentJson),
    );
  }

  return post;
}

export async function deletePost(
  context: DbContext & { executionCtx: ExecutionContext },
  data: DeletePostInput,
) {
  const post = await PostRepo.findPostById(context.db, data.id);
  if (!post) return;

  await PostRepo.deletePost(context.db, data.id);

  // Only clear cache/index for published posts
  if (post.status === "published") {
    const tasks = [];
    const version = await CacheService.getVersion(context, "posts:detail");
    tasks.push(
      CacheService.deleteKey(
        context,
        POSTS_CACHE_KEYS.detail(version, post.slug),
      ),
    );
    tasks.push(CacheService.bumpVersion(context, "posts:list"));
    tasks.push(SearchService.deleteIndex(context, { id: data.id }));
    tasks.push(purgePostCDNCache(context.env, post.slug));

    context.executionCtx.waitUntil(Promise.all(tasks));
  }
}

export async function previewSummary(
  context: DbContext,
  data: PreviewSummaryInput,
) {
  const plainText = convertToPlainText(data.contentJson);
  try {
    const { summary } = await AiService.summarizeText(context, plainText);
    return { summary };
  } catch (error) {
    if (error instanceof Error && error.message === "AI_NOT_CONFIGURED") {
      return { error: "AI 服务未配置" };
    }
    throw error;
  }
}

export async function startPostProcessWorkflow(
  context: DbContext,
  data: StartPostProcessInput,
) {
  await context.env.POST_PROCESS_WORKFLOW.create({
    params: {
      postId: data.id,
      isPublished: data.status === "published",
    },
  });
}
