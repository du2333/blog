import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DB } from "@/lib/db";
import { authConfig } from "@/lib/auth/auth.config";
import * as authSchema from "@/lib/db/schema/auth.schema";

export function createAuth(db: DB, env: Env) {
  return betterAuth({
    ...authConfig,
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: env.REQUIRE_EMAIL_VERIFICATION === "true",
      sendResetPassword({ user, url, token }) {
        // TODO: Send reset password email, use waitUntil to send email in background
        console.log(user, url, token);
        return Promise.resolve();
      },
    },
    emailVerification: {
      sendVerificationEmail({ user, url, token }) {
        // TODO: Send verification email, use waitUntil to send email in background
        console.log(user, url, token);
        return Promise.resolve();
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
            if (user.email === env.ADMIN_EMAIL) {
              return { data: { ...user, role: "admin" } };
            }
            return { data: user };
          },
        },
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
  });
}

export type Auth = ReturnType<typeof createAuth>;
