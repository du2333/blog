import { WorkflowEntrypoint } from "cloudflare:workers";
import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import * as CacheService from "@/features/cache/cache.service";
import * as PostService from "@/features/posts/posts.service";
import * as TagService from "@/features/tags/tags.service";
import { getDb } from "@/lib/db";
import { purgePostCDNCache } from "@/lib/invalidate";
import * as SearchService from "@/features/search/search.service";

interface Params {
  postId: number;
  isPublished: boolean;
}

export class PostProcessWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { postId, isPublished } = event.payload;

    if (isPublished) {
      // Full publish workflow: generate summary, update index, invalidate caches
      const post = await step.do(
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
      if (!post) return;

      await step.do("update search index", async () => {
        return await SearchService.upsert(
          { env: this.env },
          {
            ...post,
            tags: post.tags.map((t) => t.name),
          },
        );
      });

      await step.do("Invalidate caches", async () => {
        const version = await CacheService.getVersion(
          { env: this.env },
          "posts:detail",
        );
        const tasks = [
          CacheService.deleteKey({ env: this.env }, [
            version,
            "post",
            post.slug,
          ]),
          purgePostCDNCache(this.env, post.slug),
          CacheService.bumpVersion({ env: this.env }, "posts:list"),
          // Invalidate public tags list (tag counts may have changed)
          CacheService.deleteKey({ env: this.env }, [
            ...TagService.PUBLIC_TAGS_CACHE_KEY,
          ]),
        ];
        await Promise.all(tasks);
      });
    } else {
      // Unpublish workflow: remove from index and caches
      const post = await step.do("fetch post", async () => {
        const db = getDb(this.env);
        return await PostService.findPostById({ db }, { id: postId });
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
          CacheService.deleteKey({ env: this.env }, [
            version,
            "post",
            post.slug,
          ]),
          purgePostCDNCache(this.env, post.slug),
          CacheService.bumpVersion({ env: this.env }, "posts:list"),
          // Invalidate public tags list (tag counts may have changed)
          CacheService.deleteKey({ env: this.env }, [
            ...TagService.PUBLIC_TAGS_CACHE_KEY,
          ]),
        ];
        await Promise.all(tasks);
      });
    }
  }
}
