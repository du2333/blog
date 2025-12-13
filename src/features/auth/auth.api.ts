import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

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
