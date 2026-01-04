import { WorkflowEntrypoint } from "cloudflare:workers";
import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import {
  bumpCacheVersion,
  deleteCachedData,
} from "@/features/cache/cache.data";
import { generateSummaryByPostId } from "@/features/posts/post.service";
import { getDb } from "@/lib/db";
import { purgePostCDNCache } from "@/lib/revalidate";
import { addOrUpdateSearchDoc } from "@/lib/search/ops";

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
        return await generateSummaryByPostId({
          db,
          postId: event.payload.postId,
        });
      },
    );

    await step.do("update search index", async () => {
      return await addOrUpdateSearchDoc(this.env, post);
    });

    await step.do("Invalidate caches", async () => {
      const tasks = [
        deleteCachedData({ env: this.env }, ["post", post.slug]),
        purgePostCDNCache(this.env, post.slug),
        bumpCacheVersion({ env: this.env }, "posts:list"),
      ];
      await Promise.all(tasks);
    });
  }
}
