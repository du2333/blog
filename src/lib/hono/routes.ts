import { Hono } from "hono";
import handler from "@tanstack/react-start/server-entry";
import { cacheMiddleware, rateLimitMiddleware } from "./middlewares";
import { handleImageRequest } from "@/features/media/media.service";
import { getAuth } from "@/lib/auth/auth.server";
import { getDb } from "@/lib/db";

export const app = new Hono<{ Bindings: Env }>();

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

app.get(
  "/api/auth/*",
  rateLimitMiddleware({
    capacity: 100,
    interval: "1m",
    identifier: (c) => c.req.header("cf-connecting-ip") ?? "unknown",
  }),
  (c) => {
    const db = getDb(c.env);
    const auth = getAuth({ db, env: c.env });
    return auth.handler(c.req.raw);
  },
);

app.post(
  "/api/auth/*",
  rateLimitMiddleware({
    capacity: 10,
    interval: "1m",
    identifier: (c) => c.req.header("cf-connecting-ip") ?? "unknown",
  }),
  (c) => {
    const db = getDb(c.env);
    const auth = getAuth({ db, env: c.env });
    return auth.handler(c.req.raw);
  },
);

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
