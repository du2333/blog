import { generateSummaryByPostId } from "@/lib/agent/summarizer";
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
    const db = createDb(this.env);

    const post = await step.do(
      "generate summary",
      {
        retries: {
          limit: 3,
          delay: "5 seconds",
          backoff: "exponential",
        },
      },
      async () => {
        return await generateSummaryByPostId(db, event.payload.postId);
      }
    );

    await step.do("update search index", async () => {
      return await addOrUpdateSearchDoc(this.env, post);
    });
  }
}
