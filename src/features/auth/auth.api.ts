import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import { userHasPassword } from "@/features/auth/auth.data";
import { cachedData } from "@/features/cache/cache.data";
import { getSystemConfig } from "@/features/config/config.data";
import { createAuthedFn } from "@/lib/middlewares";

export const getSessionFn = createServerFn().handler(async ({ context }) => {
  const headers = getRequestHeaders();
  const session = await context.auth.api.getSession({
    headers,
  });

  return session;
});

export const userHasPasswordFn = createAuthedFn().handler(
  async ({ context }) => {
    return await userHasPassword(context.db, context.session.user.id);
  },
);

export const getIsEmailVerficationRequiredFn = createServerFn().handler(
  async ({ context }) => {
    return cachedData(
      context,
      ["isEmailVerficationRequired"],
      z.boolean(),
      async () => {
        const config = await getSystemConfig(context.db);
        return !!(config?.email?.apiKey && config.email.senderAddress);
      },
    );
  },
);
