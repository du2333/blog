import { Hono } from "hono";
import { getContentTypeFromKey } from "@/lib/files";

export const app = new Hono<{ Bindings: Env }>();

// 图片路由 - 从 R2 获取并使用 Cache API
app.get("/images/*", async (c) => {
  const key = c.req.path.replace(/^\/images\//, "");

  if (!key) {
    return c.text("Image key is required", 400);
  }

  try {
    // 尝试从 Cloudflare Cache API 获取缓存
    const cache = (caches as any).default as Cache;
    // 创建标准化的缓存键（去除查询参数）
    const cacheUrl = new URL(c.req.url);
    cacheUrl.search = "";
    const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });

    let response = await cache.match(cacheKey);

    if (response) {
      // 缓存命中
      return response;
    }

    // 缓存未命中，从 R2 获取图片
    const object = await c.env.R2.get(key);

    if (!object) {
      return c.text(`Image not found: ${key}`, 404);
    }

    // 获取 Content-Type
    const contentType =
      object.httpMetadata?.contentType ||
      getContentTypeFromKey(key) ||
      "application/octet-stream";

    // 读取 R2 对象内容
    const imageData = await object.arrayBuffer();

    // 创建响应
    response = new Response(imageData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: object.etag,
      },
    });

    // 存入缓存
    try {
      await cache.put(cacheKey, response.clone());
    } catch (cacheError) {
      console.warn("Failed to cache response:", cacheError);
    }

    return response;
  } catch (error) {
    console.error("Error fetching image from R2:", error);
    return c.text("Internal server error", 500);
  }
});
