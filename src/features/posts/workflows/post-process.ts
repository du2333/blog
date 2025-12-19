import { generateSummaryByPostId } from "@/features/posts/services/posts-processing.service";
import { createDb } from "@/lib/db";
import { addOrUpdateSearchDoc } from "@/lib/search/ops";
import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";

type Params = {
  postId: number;
};

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
        const db = createDb(this.env);
        return await generateSummaryByPostId({
          db,
          postId: event.payload.postId,
        });
      }
    );

    await step.do("update search index", async () => {
      return await addOrUpdateSearchDoc(this.env, post);
    });
  }
}
