import { Hono } from "hono";
import handler from "@tanstack/react-start/server-entry";
import { proxy } from "hono/proxy";
import {
  baseMiddleware,
  cacheMiddleware,
  rateLimitMiddleware,
  shieldMiddleware,
} from "./middlewares";
import { handleImageRequest } from "@/features/media/media.service";
import { serverEnv } from "@/lib/env/server.env";

export const app = new Hono<{ Bindings: Env }>();

app.get("*", cacheMiddleware);

/* ================================ 路由开始 ================================ */
app.get("/stats.js", async (c) => {
  const env = serverEnv(c.env);
  const umamiSrc = env.VITE_UMAMI_SRC;
  if (!umamiSrc) {
    return c.text("Not Found", 404);
  }
  const scriptUrl = new URL("/script.js", umamiSrc).toString();
  const response = await proxy(scriptUrl);
  response.headers.set(
    "Cache-Control",
    "public, max-age=3600, stale-while-revalidate=86400",
  );
  return response;
});

app.all("/api/send", async (c) => {
  const env = serverEnv(c.env);
  const umamiSrc = env.VITE_UMAMI_SRC;
  if (!umamiSrc) {
    return c.text("Not Found", 404);
  }
  const sendUrl = new URL("/api/send", umamiSrc).toString();
  return proxy(sendUrl, c.req);
});

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
  baseMiddleware,
  rateLimitMiddleware({
    capacity: 100,
    interval: "1m",
    identifier: (c) => c.req.header("cf-connecting-ip") ?? "unknown",
  }),
  (c) => {
    const auth = c.get("auth");
    return auth.handler(c.req.raw);
  },
);

app.post(
  "/api/auth/*",
  baseMiddleware,
  rateLimitMiddleware({
    capacity: 10,
    interval: "1m",
    identifier: (c) => c.req.header("cf-connecting-ip") ?? "unknown",
  }),
  (c) => {
    const auth = c.get("auth");
    return auth.handler(c.req.raw);
  },
);

// Router之前的防护
app.all("*", shieldMiddleware);

app.all("*", (c) => {
  return handler.fetch(c.req.raw, {
    context: {
      env: c.env,
      executionCtx: c.executionCtx,
    },
  });
});
