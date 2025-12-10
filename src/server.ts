import { type DB } from "@/lib/db";
import { app } from "@/lib/hono";

declare module "@tanstack/react-start" {
  interface Register {
    server: {
      requestContext: {
        db: DB;
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
