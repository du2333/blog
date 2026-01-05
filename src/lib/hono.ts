import handler from "@tanstack/react-start/server-entry";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { getAuth } from "@/lib/auth/auth.server";
import { getDb } from "@/lib/db";
import { handleImageRequest } from "@/features/media/media.service";

export const app = new Hono<{ Bindings: Env }>();

/* ================================ 缓存配置 ================================ */
const cacheMiddleware = createMiddleware(async (c, next) => {
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

    if (!hasSetCookie && resCacheControl && !resCacheControl.includes("no-store") && !resCacheControl.includes("no-cache") && !resCacheControl.includes("private")) {
      const responseToCache = c.res.clone();
      c.executionCtx.waitUntil((async () => {
        try {
          await cache.put(c.req.raw, responseToCache);
        } catch { }
      })());
    }
  }
});

app.get("*", cacheMiddleware);

/* ================================ 路由开始 ================================ */
app.get("/images/:key{.+}", async (c) => {
  const key = c.req.param("key");

  if (!key) return c.text("Image key is required", 400);

  try {
    return await handleImageRequest(c.env, key, c.req.raw);
  } catch (error) {
    console.error("Error fetching image from R2:", error);
    return c.text("Internal server error", 500);
  }
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const db = getDb(c.env);
  const auth = getAuth({ db, env: c.env });
  return auth.handler(c.req.raw);
});

app.all("*", (c) => {
  const db = getDb(c.env);
  const auth = getAuth({ db, env: c.env });
  return handler.fetch(c.req.raw, {
    context: {
      db,
      auth,
      env: c.env,
      executionCtx: c.executionCtx,
    },
  });
});
