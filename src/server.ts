import { type DB } from "@/lib/db";
import handler from "@tanstack/react-start/server-entry";
import { drizzle } from "drizzle-orm/d1";

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
  async fetch(request: Request, env: Env, executionCtx: ExecutionContext) {
    return handler.fetch(request, {
      context: {
        db: drizzle(env.DB),
        env,
        executionCtx,
      },
    });
  },
};
