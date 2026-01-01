import { admin } from "better-auth/plugins";
import type { BetterAuthOptions } from "better-auth";

export const authConfig = {
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  plugins: [admin()],
} satisfies BetterAuthOptions;
