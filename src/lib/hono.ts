import handler from "@tanstack/react-start/server-entry";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { getAuth } from "@/lib/auth/auth.server";
import { getDb } from "@/lib/db";
import { handleImageRequest } from "@/features/media/media.service";

export const app = new Hono<{ Bindings: Env }>();

/* ================================ 缓存配置 ================================ */
app.get("*", async (c, next) => {
  const EXCLUDED_PREFIXES = ["/api", "/_serverFn"];
  const path = c.req.path;
  if (EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return next();
  }

  const AUTH_PATHS = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/reset-link",
  ];

  if (path.startsWith("/images")) {
    return cache({
      cacheName: "image-cache",
      cacheControl: "public, max-age=31536000, s-maxage=31536000, immutable",
      cacheableStatusCodes: [200],
    })(c, next);
  }

  if (path.startsWith("/admin") || AUTH_PATHS.includes(path)) {
    return cache({
      cacheName: "no-cache",
      cacheControl: "no-cache, no-store, must-revalidate",
      cacheableStatusCodes: [200],
    })(c, next);
  }

  return cache({
    cacheName: "blog-cache",
    cacheControl:
      "public, max-age=300,s-maxage=3600, stale-while-revalidate=604800",
    cacheableStatusCodes: [200],
  })(c, next);
});

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
