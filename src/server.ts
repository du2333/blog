import type { Auth } from "@/lib/auth/auth.server";
import type { DB } from "@/lib/db";
import { app } from "@/lib/hono";
import { AppRuntime } from "@/services";
import { RunApiEffectWithRuntime } from "./lib/effect/result";

export { PostProcessWorkflow } from "@/features/posts/workflows/post-process";

declare module "@tanstack/react-start" {
	interface Register {
		server: {
			requestContext: {
				db: DB;
				env: Env;
				executionCtx: ExecutionContext;
				auth: Auth;
				runtime: AppRuntime;
				runEffect: RunApiEffectWithRuntime;
			};
		};
	}
}

export default {
	fetch(request, env, ctx) {
		return app.fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
