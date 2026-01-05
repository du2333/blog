import { createServerFn } from "@tanstack/react-start";
import * as AuthService from "@/features/auth/auth.service";
import { createAuthedFn, noCacheMiddleware } from "@/lib/middlewares";

export const getSessionFn = createServerFn()
  .middleware([noCacheMiddleware])
  .handler(({ context }) => AuthService.getSession(context));

export const userHasPasswordFn = createAuthedFn().handler(({ context }) =>
  AuthService.userHasPassword(context),
);

export const getIsEmailVerficationRequiredFn = createServerFn().handler(
  ({ context }) => AuthService.getIsEmailVerficationRequired(context),
);
