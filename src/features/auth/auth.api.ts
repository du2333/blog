import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { userHasPassword } from "@/features/auth/auth.data";
import { createAuthedFn } from "@/lib/middlewares";

export const getRootContextFn = createServerFn().handler(
  async ({ context }) => {
    const headers = getRequestHeaders();
    const session = await context.auth.api.getSession({
      headers,
    });
    const isEmailVerficationRequired =
      context.env.REQUIRE_EMAIL_VERIFICATION === "true";
    return {
      session,
      isEmailVerficationRequired,
    };
  }
);

export const userHasPasswordFn = createAuthedFn().handler(
  async ({ context }) => {
    return await userHasPassword(context.db, context.session.user.id);
  }
);
