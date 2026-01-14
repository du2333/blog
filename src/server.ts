import { app } from "@/lib/hono";

export { CommentModerationWorkflow } from "@/features/comments/workflows/comment-moderation";
export { PostProcessWorkflow } from "@/features/posts/workflows/post-process";
export { SendEmailWorkflow } from "@/features/email/workflows/send-email";
export { RateLimiter } from "@/lib/rate-limiter";

declare module "@tanstack/react-start" {
  interface Register {
    server: {
      requestContext: {
        env: Env;
        executionCtx: ExecutionContext;
      };
    };
  }
}

export default {
  fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
