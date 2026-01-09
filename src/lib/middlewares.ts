import { createMiddleware, createServerFn, json } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import type { RateLimitOptions } from "@/lib/rate-limiter";
import { CACHE_CONTROL } from "@/lib/constants";

export const authMiddleware = createMiddleware().server(
  async ({ next, context, request }) => {
    const session = await context.auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      throw json({ message: "UNAUTHENTICATED" }, { status: 401 });
    }

    return next({
      context: {
        session,
      },
    });
  },
);

export const adminMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const session = context.session;

    if (session.user.role !== "admin") {
      throw json({ message: "PERMISSION_DENIED" }, { status: 403 });
    }

    return next({
      context: {
        session,
      },
    });
  });

export const cachedMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next();

  Object.entries(CACHE_CONTROL.swr).forEach(([k, v]) => {
    setResponseHeader(k, v);
  });

  return result;
});

export const immutableCacheMiddleware = createMiddleware().server(
  async ({ next }) => {
    const result = await next();
    Object.entries(CACHE_CONTROL.immutable).forEach(([k, v]) => {
      setResponseHeader(k, v);
    });
    return result;
  },
);

export const noCacheMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next();
  Object.entries(CACHE_CONTROL.private).forEach(([k, v]) => {
    setResponseHeader(k, v);
  });
  return result;
});

export const createRateLimitMiddleware = (
  options: RateLimitOptions & { key?: string },
) => {
  return createMiddleware().server(async ({ next, context, request }) => {
    // 妥协一下，由于runtime可能有session，用Partial让session变成可选的
    const session = (context as Partial<AuthContext>).session;

    const identifier =
      session?.user.id || request.headers.get("cf-connecting-ip") || "unknown";
    const scope = options.key || "default";
    const uniqueIdentifier = `${identifier}:${scope}`;

    const id = context.env.RATE_LIMITER.idFromName(uniqueIdentifier);
    const rateLimiter = context.env.RATE_LIMITER.get(id);

    const result = await rateLimiter.checkLimit(options);

    if (!result.allowed) {
      throw json(
        {
          message: "Too Many Requests",
          retryAfterSeconds: result.retryAfterMs / 1000,
        },
        { status: 429 },
      );
    }

    return next();
  });
};

/* ======================= Helper Functions ====================== */

export const createAuthedFn = createServerFn().middleware([
  noCacheMiddleware,
  authMiddleware,
]);
export const createAdminFn = createServerFn().middleware([
  noCacheMiddleware,
  adminMiddleware,
]);
export const createCachedFn = createServerFn().middleware([cachedMiddleware]);
