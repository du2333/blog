import type { DB } from "@/lib/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { updateUser } from "@/features/auth/auth.data";
import { sendEmail } from "@/features/email/email.service";
import { authConfig } from "@/lib/auth/auth.config";
import * as authSchema from "@/lib/db/schema/auth.schema";
import { serverEnv } from "@/lib/env/server.env";

let auth: Auth | null = null;

export function getAuth({ db, env }: { db: DB; env: Env }) {
	if (auth)
		return auth;

	auth = createAuth({ db, env });
	return auth;
}

function createAuth({ db, env }: { db: DB; env: Env }) {
	const {
		BETTER_AUTH_SECRET,
		BETTER_AUTH_URL,
		ADMIN_EMAIL,
		GITHUB_CLIENT_ID,
		GITHUB_CLIENT_SECRET,
		ENVIRONMENT,
	} = serverEnv(env);

	const isDevelopment = ENVIRONMENT === "dev";

	return betterAuth({
		...authConfig,
		socialProviders: {
			github: {
				clientId: GITHUB_CLIENT_ID,
				clientSecret: GITHUB_CLIENT_SECRET,
			},
		},
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true,
			sendResetPassword: async ({ user, url }) => {
				if (isDevelopment) {
					console.log(
						"开发环境：重置密码邮件发送给用户：",
						user.email,
						"URL：",
						url,
					);
					return;
				}
				const result = await sendEmail(db, {
					to: user.email,
					subject: "重置密码",
					html: `请访问以下链接重置您的密码：<a href="${url}">${url}</a><br><br>此链接将在 1 小时后过期。`,
				});

				if (result.status === "DISABLED") {
					throw new Error("系统邮件服务未配置，无法重置密码。请联系管理员。");
				}

				if (result.status === "FAILED") {
					throw new Error(`邮件发送失败: ${result.error}`);
				}
			},
		},
		emailVerification: {
			sendVerificationEmail: async ({ user, url }) => {
				if (isDevelopment) {
					console.log(
						"开发环境：验证邮件发送给用户：",
						user.email,
						"URL：",
						url,
					);
					return;
				}
				const result = await sendEmail(db, {
					to: user.email,
					subject: "验证您的邮箱",
					html: `请访问以下链接验证您的邮箱地址：<a href="${url}">${url}</a>`,
				});

				if (result.status === "DISABLED") {
					await updateUser(db, user.id, { emailVerified: true });
					console.log(
						`[AUTH_SERVER] 邮件服务未配置，自动验证邮箱: ${user.email}`,
					);
					return;
				}

				if (result.status === "FAILED") {
					throw new Error(`邮件发送失败: ${result.error}`);
				}
			},
			autoSignInAfterVerification: true,
		},
		database: drizzleAdapter(db, {
			provider: "sqlite",
			schema: authSchema,
		}),
		databaseHooks: {
			user: {
				create: {
					before: async (user) => {
						if (user.email === ADMIN_EMAIL) {
							return { data: { ...user, role: "admin" } };
						}
						return { data: user };
					},
				},
			},
		},
		secret: BETTER_AUTH_SECRET,
		baseURL: BETTER_AUTH_URL,
	});
}

export type Auth = ReturnType<typeof createAuth>;
