import { userHasPassword } from "@/features/auth/auth.data";
import { createAuthedFn } from "@/lib/middlewares";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

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
  }
);

export const getIsEmailVerficationRequiredFn = createServerFn().handler(
  async () => {
    // TODO: Check if email provider and sender configuration environment variables are set
    return true;
  }
);
