import { app } from "@/lib/hono";

export { CommentModerationWorkflow } from "@/features/comments/workflows/comment-moderation";
export { PostProcessWorkflow } from "@/features/posts/workflows/post-process";
export { RateLimiter } from "@/lib/rate-limiter";

declare module "@tanstack/react-start" {
  interface Register {
    server: {
      requestContext: Context;
    };
  }
}

export default {
  fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
