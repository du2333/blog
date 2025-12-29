import { z } from "zod";

const serverEnvSchema = z.object({
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.url(),
	ADMIN_EMAIL: z.email(),
	GITHUB_CLIENT_ID: z.string(),
	GITHUB_CLIENT_SECRET: z.string(),
	CLOUDFLARE_ZONE_ID: z.string(),
	CLOUDFLARE_PURGE_API_TOKEN: z.string(),
	DOMAIN: z
		.string()
		.regex(
			/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
			"Must be a valid domain (e.g., www.example.com)",
		),
	ENVIRONMENT: z.enum(["dev", "prod"]).optional(),
});

export function serverEnv(env: Env) {
	const result = serverEnvSchema.safeParse(env);

	if (!result.success) {
		console.error(
			"Invalid environment variables:",
			z.treeifyError(result.error),
		);
		throw new Error("Invalid environment variables");
	}

	return result.data;
}
