import { WorkflowEntrypoint } from "cloudflare:workers";
import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import * as CacheService from "@/features/cache/cache.service";
import * as PostService from "@/features/posts/posts.service";
import { getDb } from "@/lib/db";
import { purgePostCDNCache } from "@/lib/invalidate";
import * as SearchService from "@/features/search/search.service";

interface Params {
  postId: number;
}

export class PostProcessWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const post = await step.do(
      `generate summary for post ${event.payload.postId}`,
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
          db,
          postId: event.payload.postId,
        });
      },
    );

    await step.do("update search index", async () => {
      return await SearchService.upsert({ env: this.env }, post);
    });

    await step.do("Invalidate caches", async () => {
      const tasks = [
        CacheService.deleteKey({ env: this.env }, ["post", post.slug]),
        purgePostCDNCache(this.env, post.slug),
        CacheService.bumpVersion({ env: this.env }, "posts:list"),
      ];
      await Promise.all(tasks);
    });
  }
}
