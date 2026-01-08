import { createServerFn } from "@tanstack/react-start";
import * as AuthService from "@/features/auth/auth.service";
import {
  createAuthedFn,
  createRateLimitMiddleware,
  noCacheMiddleware,
} from "@/lib/middlewares";

export const getSessionFn = createServerFn()
  .middleware([noCacheMiddleware])
  .handler(({ context }) => AuthService.getSession(context));

export const userHasPasswordFn = createAuthedFn().handler(({ context }) =>
  AuthService.userHasPassword(context),
);

export const getIsEmailVerficationRequiredFn = createServerFn()
  .middleware([
    createRateLimitMiddleware({
      capacity: 60,
      interval: "1m",
    }),
  ])
  .handler(({ context }) => AuthService.getIsEmailVerficationRequired(context));
