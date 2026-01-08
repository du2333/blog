import { createMiddleware } from "hono/factory";
import type { Context } from "hono";
import type { Duration } from "@/lib/duration";
import { serverEnv } from "@/lib/env/server.env";

export const cacheMiddleware = createMiddleware(async (c, next) => {
  if (serverEnv(c.env).ENVIRONMENT === "dev") return next();

  const cache = (caches as any).default as Cache;

  if (c.req.method !== "GET") {
    return next();
  }

  const EXCLUDED_PREFIXES = ["/api"];
  const path = c.req.path;
  if (EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return next();
  }

  const cachedResponse = await cache.match(c.req.raw);
  if (cachedResponse) {
    return cachedResponse;
  }

  await next();

  if (c.res.status === 200) {
    const resCacheControl = c.res.headers.get("Cache-Control");
    const hasSetCookie = c.res.headers.has("Set-Cookie");

    if (
      !hasSetCookie &&
      resCacheControl &&
      !resCacheControl.includes("no-store") &&
      !resCacheControl.includes("no-cache") &&
      !resCacheControl.includes("private")
    ) {
      const responseToCache = c.res.clone();
      c.executionCtx.waitUntil(
        (async () => {
          try {
            await cache.put(c.req.raw, responseToCache);
          } catch {}
        })(),
      );
    }
  }
});

interface RateLimitOptions {
  capacity: number;
  interval: Duration;
  identifier: string | ((c: Context<{ Bindings: Env }>) => string | undefined);
}

export const rateLimitMiddleware = (options: RateLimitOptions) =>
  createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const identifier =
      typeof options.identifier === "function"
        ? options.identifier(c)
        : options.identifier;
    const id = c.env.RATE_LIMITER.idFromName(identifier ?? "unknown");
    const rateLimiter = c.env.RATE_LIMITER.get(id);

    const result = await rateLimiter.checkLimit({
      capacity: options.capacity,
      interval: options.interval,
    });

    if (!result.allowed) {
      c.res.headers.set("Retry-After", result.retryAfterMs.toString());
      return c.json({ message: "Too Many Requests" }, 429);
    }

    return next();
  });
