import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DB } from "@/lib/db";
import { authConfig } from "@/lib/auth/auth.config";
import * as authSchema from "@/lib/db/schema/auth.schema";
import { serverEnv } from "@/lib/env/server.env";

export function createAuth(db: DB, env: Env) {
  const {
    BETTER_AUTH_SECRET,
    BETTER_AUTH_URL,
    ADMIN_EMAIL,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
  } = serverEnv(env);

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
      requireEmailVerification: true, // TODO: Check if email provider and sender configuration environment variables are set
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
