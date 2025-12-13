import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { userHasPassword } from "@/features/auth/auth.data";
import { createAuthedFn } from "@/lib/auth/procedure";

export const getSessionFn = createServerFn().handler(async ({ context }) => {
  const headers = getRequestHeaders();
  return await context.auth.api.getSession({
    headers,
  });
});

export const isEmailVerficationRequiredFn = createServerFn().handler(
  async ({ context }) => {
    return context.env.REQUIRE_EMAIL_VERIFICATION === "true";
  }
);

export const userHasPasswordFn = createAuthedFn().handler(
  async ({ context }) => {
    return await userHasPassword(context.db, context.session.user.id);
  }
);
