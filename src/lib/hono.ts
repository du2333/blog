import { cacheWrap } from "@/lib/cache";
import { createDb } from "@/lib/db";
import { handleImageRequest } from "@/lib/images";
import handler from "@tanstack/react-start/server-entry";
import { Hono } from "hono";

export const app = new Hono<{ Bindings: Env }>();

app.get("/images/:key", async (c) => {
  const key = c.req.param("key");

  if (!key) {
    return c.text("Image key is required", 400);
  }

  try {
    return await cacheWrap(
      c.executionCtx,
      c.req.raw,
      () => handleImageRequest(c.env, key, c.req.raw),
      { shouldCache: (response) => response.ok }
    );
  } catch (error) {
    console.error("Error fetching image from R2:", error);
    return c.text("Internal server error", 500);
  }
});

app.all("*", (c) => {
  return handler.fetch(c.req.raw, {
    context: {
      db: createDb(c.env),
      env: c.env,
      executionCtx: c.executionCtx,
    },
  });
});
