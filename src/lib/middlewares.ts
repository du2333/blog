import { createMiddleware } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import type { RateLimitOptions } from "@/lib/rate-limiter";
import { CACHE_CONTROL } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { getAuth } from "@/lib/auth/auth.server";

// ======================= Cache Control ====================== */
export const createCacheHeaderMiddleware = (
  strategy: "private" | "immutable" | "swr",
) => {
  return createMiddleware().server(async ({ next }) => {
    const result = await next();
    Object.entries(CACHE_CONTROL[strategy]).forEach(([k, v]) => {
      setResponseHeader(k, v);
    });
    return result;
  });
};

/* ======================= Infrastructure ====================== */

export const dbMiddleware = createMiddleware().server(
  async ({ next, context }) => {
    const db = getDb(context.env);
    return next({
      context: {
        db,
      },
    });
  },
);

export const sessionMiddleware = createMiddleware()
  .middleware([dbMiddleware])
  .server(async ({ next, context, request }) => {
    const auth = getAuth({
      db: context.db,
      env: context.env,
    });
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return next({
      context: {
        auth,
        session,
      },
    });
  });

export const authMiddleware = createMiddleware()
  .middleware([createCacheHeaderMiddleware("private"), sessionMiddleware])
  .server(async ({ next, context }) => {
    const session = context.session;

    if (!session) {
      return Response.json({ message: "UNAUTHENTICATED" }, { status: 401 });
    }

    return next({
      context: {
        session,
      },
    });
  });

export const adminMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ context, next }) => {
    const session = context.session;

    if (session.user.role !== "admin") {
      return Response.json({ message: "PERMISSION_DENIED" }, { status: 403 });
    }

    return next({
      context: {
        session,
      },
    });
  });

/* ======================= Rate Limiting ====================== */
export const createRateLimitMiddleware = (
  options: RateLimitOptions & { key?: string },
) => {
  return createMiddleware()
    .middleware([sessionMiddleware])
    .server(async ({ next, context, request }) => {
      const session = context.session;

      const identifier =
        session?.user.id ||
        request.headers.get("cf-connecting-ip") ||
        "unknown";
      const scope = options.key || "default";
      const uniqueIdentifier = `${identifier}:${scope}`;

      const id = context.env.RATE_LIMITER.idFromName(uniqueIdentifier);
      const rateLimiter = context.env.RATE_LIMITER.get(id);

      const result = await rateLimiter.checkLimit(options);

      if (!result.allowed) {
        return Response.json(
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
