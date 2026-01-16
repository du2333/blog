import { WorkflowEntrypoint } from "cloudflare:workers";
import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import * as CacheService from "@/features/cache/cache.service";
import * as PostService from "@/features/posts/posts.service";
import { POSTS_CACHE_KEYS } from "@/features/posts/posts.schema";
import { TAGS_CACHE_KEYS } from "@/features/tags/tags.schema";
import { getDb } from "@/lib/db";
import { purgePostCDNCache } from "@/lib/invalidate";
import * as SearchService from "@/features/search/search.service";
import { calculatePostHash } from "@/features/posts/utils/sync";

interface Params {
  postId: number;
  isPublished: boolean;
}

export class PostProcessWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { postId, isPublished } = event.payload;

    if (isPublished) {
      // 1. Fetch post and Check Sync Status
      const { post: initialPost, shouldSkip } = await step.do(
        "check sync status",
        async () => {
          const db = getDb(this.env);
          const p = await PostService.findPostById(
            { db, env: this.env },
            { id: postId },
          );
          if (!p) return { post: null, shouldSkip: true };

          const newHash = await calculatePostHash({
            title: p.title,
            contentJson: p.contentJson,
            summary: p.summary,
            tagIds: p.tags.map((t) => t.id),
            slug: p.slug,
          });
          const oldHash = await CacheService.getRaw(
            { env: this.env },
            POSTS_CACHE_KEYS.syncHash(postId),
          );

          if (newHash === oldHash) {
            console.log(
              `[Workflow] Content for post ${postId} unchanged. Skipping.`,
            );
            return { post: p, shouldSkip: true };
          }

          return { post: p, shouldSkip: false };
        },
      );

      if (shouldSkip || !initialPost) return;

      // Full publish workflow: generate summary, update index, invalidate caches
      const updatedPost = await step.do(
        `generate summary for post ${postId}`,
        {
          retries: {
            limit: 3,
            delay: "5 seconds",
            backoff: "exponential",
          },
        },
        async () => {
          const db = getDb(this.env);
          return await PostService.generateSummaryByPostId({
            context: { db, env: this.env },
            postId,
          });
        },
      );
      if (!updatedPost) return;

      await step.do("update search index", async () => {
        return await SearchService.upsert(
          { env: this.env },
          {
            id: updatedPost.id,
            slug: updatedPost.slug,
            title: updatedPost.title,
            summary: updatedPost.summary,
            contentJson: updatedPost.contentJson,
            tags: updatedPost.tags.map((t) => t.name),
          },
        );
      });

      await step.do("Invalidate caches", async () => {
        const version = await CacheService.getVersion(
          { env: this.env },
          "posts:detail",
        );
        const tasks = [
          CacheService.deleteKey(
            { env: this.env },
            POSTS_CACHE_KEYS.detail(version, updatedPost.slug),
          ),
          purgePostCDNCache(this.env, updatedPost.slug),
          CacheService.bumpVersion({ env: this.env }, "posts:list"),
          // Invalidate public tags list (tag counts may have changed)
          CacheService.deleteKey({ env: this.env }, TAGS_CACHE_KEYS.publicList),
        ];
        await Promise.all(tasks);
      });

      // Update sync hash in KV
      await step.do("update sync hash", async () => {
        const db = getDb(this.env);
        const p = await PostService.findPostById(
          { db, env: this.env },
          { id: postId },
        );
        if (!p) return;

        const hash = await calculatePostHash({
          title: p.title,
          contentJson: p.contentJson,
          summary: p.summary,
          tagIds: p.tags.map((t) => t.id),
          slug: p.slug,
        });
        await CacheService.set(
          { env: this.env },
          POSTS_CACHE_KEYS.syncHash(postId),
          hash,
        );
      });
    } else {
      // Unpublish workflow: remove from index and caches
      const post = await step.do("fetch post", async () => {
        const db = getDb(this.env);
        return await PostService.findPostById(
          { db, env: this.env },
          { id: postId },
        );
      });

      if (!post) return;

      await step.do("remove from search index", async () => {
        return await SearchService.deleteIndex(
          { env: this.env },
          { id: postId },
        );
      });

      await step.do("Invalidate caches", async () => {
        const version = await CacheService.getVersion(
          { env: this.env },
          "posts:detail",
        );
        const tasks = [
          CacheService.deleteKey(
            { env: this.env },
            POSTS_CACHE_KEYS.detail(version, post.slug),
          ),
          CacheService.deleteKey(
            { env: this.env },
            POSTS_CACHE_KEYS.syncHash(postId),
          ),
          purgePostCDNCache(this.env, post.slug),
          CacheService.bumpVersion({ env: this.env }, "posts:list"),
          // Invalidate public tags list (tag counts may have changed)
          CacheService.deleteKey({ env: this.env }, TAGS_CACHE_KEYS.publicList),
        ];
        await Promise.all(tasks);
      });
    }
  }
}
