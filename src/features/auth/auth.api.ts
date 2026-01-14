import { createServerFn } from "@tanstack/react-start";
import * as AuthService from "@/features/auth/auth.service";
import {
  authMiddleware,
  createRateLimitMiddleware,
  noCacheMiddleware,
  sessionMiddleware,
} from "@/lib/middlewares";

export const getSessionFn = createServerFn()
  .middleware([noCacheMiddleware, sessionMiddleware])
  .handler(({ context }) => AuthService.getSession(context));

export const userHasPasswordFn = createServerFn()
  .middleware([authMiddleware])
  .handler(({ context }) => AuthService.userHasPassword(context));

export const getIsEmailConfiguredFn = createServerFn()
  .middleware([
    createRateLimitMiddleware({
      capacity: 60,
      interval: "1m",
      key: "auth:getIsEmailConfigured",
    }),
  ])
  .handler(({ context }) => AuthService.getIsEmailConfigured(context));
