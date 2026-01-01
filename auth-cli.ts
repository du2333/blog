import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { authConfig } from "@/lib/auth/auth.config";

export const auth = betterAuth({
  ...authConfig,
  database: drizzleAdapter(
    {},
    {
      provider: "sqlite",
    },
  ),
});
