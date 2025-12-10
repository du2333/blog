import handler from "@tanstack/react-start/server-entry";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { handleImageRequest } from "@/lib/images";
import { cacheWrap } from "@/lib/cache";

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
      db: drizzle(c.env.DB),
      env: c.env,
      executionCtx: c.executionCtx,
    },
  });
});
