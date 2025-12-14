import { createAuth } from "@/lib/auth/auth.server";
import { cachedAsset } from "@/lib/cache";
import { createDb } from "@/lib/db";
import { handleImageRequest } from "@/lib/images/server";
import handler from "@tanstack/react-start/server-entry";
import { Hono } from "hono";

export const app = new Hono<{ Bindings: Env }>();

app.get("/images/:key", async (c) => {
  const key = c.req.param("key");

  if (!key) {
    return c.text("Image key is required", 400);
  }

  try {
    return await cachedAsset(c.executionCtx, c.req.raw, () =>
      handleImageRequest(c.env, key, c.req.raw)
    );
  } catch (error) {
    console.error("Error fetching image from R2:", error);
    return c.text("Internal server error", 500);
  }
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const db = createDb(c.env);
  const auth = createAuth(db, c.env);
  return auth.handler(c.req.raw);
});

app.all("*", (c) => {
  const db = createDb(c.env);
  const auth = createAuth(db, c.env);
  return handler.fetch(c.req.raw, {
    context: {
      db,
      auth,
      env: c.env,
      executionCtx: c.executionCtx,
    },
  });
});
