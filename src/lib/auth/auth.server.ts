import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DB } from "@/lib/db";
import { authConfig } from "@/lib/config/auth.cofig";
import * as authSchema from "@/lib/db/schema/auth.schema";

export function createAuth(db: DB, env: Env) {
  return betterAuth({
    ...authConfig,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: authSchema,
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
  });
}
