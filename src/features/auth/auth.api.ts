import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { userHasPassword } from "@/features/auth/auth.data";
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
  }
);

export const getIsEmailVerficationRequiredFn = createAuthedFn().handler(
  async ({ context }) => {
    return context.env.REQUIRE_EMAIL_VERIFICATION === "true";
  }
);
