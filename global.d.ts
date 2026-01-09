import type { DB } from "@/lib/db";
import type { Auth, Session } from "@/lib/auth/auth.server";

declare global {
  interface PostProcessWorkflowParams {
    postId: number;
    isPublished: boolean;
  }

  interface CommentModerationWorkflowParams {
    commentId: number;
  }

  interface Env extends Cloudflare.Env {
    POST_PROCESS_WORKFLOW: Workflow<PostProcessWorkflowParams>;
    COMMENT_MODERATION_WORKFLOW: Workflow<CommentModerationWorkflowParams>;
  }

  type Context = {
    db: DB;
    env: Env;
    executionCtx: ExecutionContext;
    auth: Auth;
  };

  type AuthContext = Context & {
    session: Session;
  };
}
