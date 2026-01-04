import type { DB } from "@/lib/db";
import type { Auth } from "@/lib/auth/auth.server";
import type { Session, User } from "better-auth";

declare global {
  interface PostProcessWorkflowParams {
    postId: number;
  }

  interface Env extends Cloudflare.Env {
    POST_PROCESS_WORKFLOW: Workflow<PostProcessWorkflowParams>;
  }

  type Context = {
    db: DB;
    env: Env;
    executionCtx: ExecutionContext;
    auth: Auth;
  };

  type AuthContext = Context & {
    session: {
      session: Session;
      user: User;
    };
  };
}
