import { z } from "zod";
import { getRequestHeaders } from "@tanstack/react-start/server";
import * as AuthRepo from "@/features/auth/auth.data";
import * as ConfigRepo from "@/features/config/config.data";
import * as CacheService from "@/features/cache/cache.service";

export async function getSession(context: Context) {
  const headers = getRequestHeaders();
  return await context.auth.api.getSession({
    headers,
  });
}

export async function userHasPassword(context: AuthContext) {
  return await AuthRepo.userHasPassword(context.db, context.session.user.id);
}

export async function getIsEmailVerficationRequired(context: Context) {
  return CacheService.get(
    context,
    ["isEmailVerficationRequired"],
    z.boolean(),
    async () => {
      const config = await ConfigRepo.getSystemConfig(context.db);
      return !!(config?.email?.apiKey && config.email.senderAddress);
    },
  );
}
