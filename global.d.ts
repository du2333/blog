import type { DB as DBType } from "@/lib/db";
import type {
  Auth as AuthType,
  Session as SessionType,
} from "@/lib/auth/auth.server";

declare global {
  interface PostProcessWorkflowParams {
    postId: number;
    isPublished: boolean;
  }

  interface CommentModerationWorkflowParams {
    commentId: number;
  }

  interface SendEmailWorkflowParams {
    to: string;
    subject: string;
    html: string;
    headers?: Record<string, string>;
  }

  interface Env extends Cloudflare.Env {
    POST_PROCESS_WORKFLOW: Workflow<PostProcessWorkflowParams>;
    COMMENT_MODERATION_WORKFLOW: Workflow<CommentModerationWorkflowParams>;
    SEND_EMAIL_WORKFLOW: Workflow<SendEmailWorkflowParams>;
  }

  type DB = DBType;
  type Auth = AuthType;
  type Session = SessionType;

  type BaseContext = {
    env: Env;
  };

  type DbContext = BaseContext & {
    db: DB;
  };

  type SessionContext = DbContext & {
    auth: Auth;
    session: Session | null;
  };

  type AuthContext = Omit<SessionContext, "session"> & {
    session: Session;
  };
}
