import { getContentTypeFromKey } from "@/lib/files";
import { waitUntil } from "cloudflare:workers";

/**
 * 处理图片请求（支持 GET 和 HEAD）
 * @param key - 图片在 R2 中的键
 * @param request - HTTP 请求对象
 * @param r2 - R2 bucket 实例
 * @param includeBody - 是否包含响应体（true=GET, false=HEAD）
 */
export async function handleImageRequest(
  key: string,
  request: Request,
  r2: R2Bucket,
  includeBody: boolean
): Promise<Response> {
  // 创建标准化的缓存键（去除查询参数）
  const cacheUrl = new URL(request.url);
  cacheUrl.search = "";
  const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });

  // 检查缓存
  const cache = (caches as any).default as Cache;
  const cachedResponse = await cache.match(cacheKey);

  if (cachedResponse) {
    // 缓存命中
    if (includeBody) {
      return cachedResponse;
    } else {
      // HEAD 请求：返回相同的响应头，但不返回 body
      return new Response(null, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: cachedResponse.headers,
      });
    }
  }

  // 缓存未命中，从 R2 获取
  const object = await r2.get(key);

  if (!object) {
    return new Response(includeBody ? `Image not found: ${key}` : null, {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  // 获取 Content-Type
  const contentType =
    object.httpMetadata?.contentType ||
    getContentTypeFromKey(key) ||
    "application/octet-stream";

  // 创建响应头
  const headers: HeadersInit = {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
    ETag: object.etag,
  };

  // HEAD 请求需要 Content-Length
  if (!includeBody) {
    headers["Content-Length"] = object.size.toString();
  }

  let response: Response;

  if (includeBody) {
    // GET 请求：读取图片数据
    const imageData = await object.arrayBuffer();
    response = new Response(imageData, {
      status: 200,
      headers,
    });

    // 存入缓存
    waitUntil(
      cache.put(cacheKey, response.clone()).catch((error) => {
        console.warn("Failed to cache response:", error);
      })
    );
  } else {
    // HEAD 请求：只返回响应头
    response = new Response(null, {
      status: 200,
      headers,
    });
  }

  return response;
}
