import { getContentTypeFromKey } from "@/lib/files";
import { cacheGet, cachePut } from "@/lib/cache";
/**
 * 处理图片请求（支持 GET 和 HEAD）
 * @param key - 图片在 R2 中的键
 * @param request - HTTP 请求对象
 * @param includeBody - 是否包含响应体（true=GET, false=HEAD）
 */
export async function handleImageRequest(
  env: Env,
  executionCtx: ExecutionContext,
  key: string,
  request: Request,
  includeBody: boolean
) {
  const viaHeader = request.headers.get("via");

  // 1. 防止循环调用
  if (viaHeader && /image-resizing/.test(viaHeader)) {
    return await getOriginalImage(key, env, includeBody);
  }

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // 2. 如果请求原图，直接走流式返回
  if (searchParams.get("original") === "true") {
    return await getOriginalImage(key, env, includeBody);
  }

  // 3. 缓存检查逻辑
  const cacheKey = new Request(url.toString(), request);
  const cached = await cacheGet(cacheKey);

  if (cached) {
    if (includeBody) return cached;
    return new Response(null, {
      headers: cached.headers,
      status: cached.status,
    });
  }

  let response: Response;

  // 4. 构建参数对象给 Cloudflare
  const transformOptions: any = { quality: 80 }; // 默认值
  if (searchParams.has("width"))
    transformOptions.width = parseInt(searchParams.get("width")!);
  if (searchParams.has("height"))
    transformOptions.height = parseInt(searchParams.get("height")!);
  if (searchParams.has("quality"))
    transformOptions.quality = parseInt(searchParams.get("quality")!);
  if (searchParams.has("fit")) transformOptions.fit = searchParams.get("fit");
  const accept = request.headers.get("Accept") || "";
  if (/image\/avif/.test(accept)) {
    transformOptions.format = "avif";
  } else if (/image\/webp/.test(accept)) {
    transformOptions.format = "webp";
  } else {
    transformOptions.format = "auto";
  }

  // 5. 应用 transformation
  try {
    // 技巧：这里构建的 URL 必须是合法的绝对路径，
    // Cloudflare Image Resizing 需要一个完整的 URL 才能工作，
    // 即便我们是在 Worker 内部 fetch，也要假装发起一个 HTTP 请求。
    // 我们指向自己的 /images/key?original=true 路由，
    // 这样当 Image Resizing Service 去抓图时，会再次触发这个 Worker，
    // 走进上面的 "路径 A"，从而从 R2 拿到流。
    const origin = url.origin;
    const sourceImageUrl = `${origin}/images/${key}?original=true`;

    const imageRequest = new Request(sourceImageUrl, {
      headers: request.headers, // 极其重要：透传 Accept 头
    });

    response = await fetch(imageRequest, {
      cf: { image: transformOptions },
    });

    if (!response.ok) {
      // 降级策略
      return await getOriginalImage(key, env, includeBody);
    }

    // 重建 Response 以强制缓存 (Immutable)
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
    newHeaders.delete("cf-cache-status"); // 清理掉无关头

    const responseToCache = new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });

    if (includeBody) {
      const responseForUser = responseToCache.clone();
      await cachePut(executionCtx, cacheKey, responseToCache);
      return responseForUser;
    } else {
      return new Response(null, { headers: newHeaders });
    }
  } catch (e) {
    return await getOriginalImage(key, env, includeBody);
  }
}

/**
 * 获取原始图片（不应用 transformation）
 */
async function getOriginalImage(
  key: string,
  env: Env,
  includeBody: boolean
) {
  const object = await env.R2.get(key);

  if (!object) {
    return new Response(includeBody ? "Image not found" : null, {
      status: 404,
    });
  }

  // 1. 优先使用 R2 存储的 Content-Type (我们在 uploadImage 里存进去的)
  // 如果 R2 里没有，再尝试通过后缀名猜测
  const contentType =
    object.httpMetadata?.contentType ||
    getContentTypeFromKey(key) ||
    "application/octet-stream";

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", contentType);
  headers.set("ETag", object.httpEtag);
  // 既然数据库存了，说明是永久文件，强缓存 1 年
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  // HEAD 请求处理
  if (!includeBody) {
    return new Response(null, { headers });
  }

  // 2. 关键：使用流 (ReadableStream) 而不是加载进内存
  return new Response(object.body as ReadableStream, {
    headers,
  });
}
