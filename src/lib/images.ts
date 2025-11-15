import { getContentTypeFromKey } from "@/lib/files";
import { waitUntil, env } from "cloudflare:workers";

/**
 * 默认的图片 transformation 参数
 */
const DEFAULT_TRANSFORM_OPTIONS = {
  quality: 80,
  // 不设置 format，让 Cloudflare 根据 Accept header 自动选择最佳格式（WebP/AVIF）
};

/**
 * 处理图片请求（支持 GET 和 HEAD）
 * @param key - 图片在 R2 中的键
 * @param request - HTTP 请求对象
 * @param includeBody - 是否包含响应体（true=GET, false=HEAD）
 */
export async function handleImageRequest(
  key: string,
  request: Request,
  includeBody: boolean
): Promise<Response> {
  const r2 = env.R2;
  // 检测是否来自 image-resizing worker，避免循环请求
  const viaHeader = request.headers.get("via");
  if (viaHeader && /image-resizing/.test(viaHeader)) {
    // 如果请求来自 transformation worker，直接返回原图
    return await getOriginalImage(key, r2, includeBody);
  }

  // 解析查询参数
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const original = searchParams.get("original") === "true";

  // 如果需要原图，直接返回
  if (original) {
    return await getOriginalImage(key, r2, includeBody);
  }

  // 构建 transformation 选项
  const transformOptions: {
    width?: number;
    height?: number;
    quality?: number;
    format?:
      | "avif"
      | "webp"
      | "jpeg"
      | "png"
      | "baseline-jpeg"
      | "png-force"
      | "svg";
    fit?: "scale-down" | "contain" | "cover" | "crop" | "pad" | "squeeze";
  } = {};

  // 从查询参数读取 transformation 参数
  if (searchParams.has("width")) {
    const width = parseInt(searchParams.get("width")!, 10);
    if (!isNaN(width)) transformOptions.width = width;
  }
  if (searchParams.has("height")) {
    const height = parseInt(searchParams.get("height")!, 10);
    if (!isNaN(height)) transformOptions.height = height;
  }
  if (searchParams.has("quality")) {
    const quality = parseInt(searchParams.get("quality")!, 10);
    if (!isNaN(quality) && quality >= 1 && quality <= 100) {
      transformOptions.quality = quality;
    }
  }
  if (searchParams.has("format")) {
    const format = searchParams.get("format")!;
    if (
      [
        "avif",
        "webp",
        "jpeg",
        "png",
        "baseline-jpeg",
        "png-force",
        "svg",
      ].includes(format)
    ) {
      transformOptions.format = format as any;
    }
  }
  if (searchParams.has("fit")) {
    const fit = searchParams.get("fit")!;
    if (
      ["scale-down", "contain", "cover", "crop", "pad", "squeeze"].includes(fit)
    ) {
      transformOptions.fit = fit as any;
    }
  }

  // 如果没有指定 transformation 参数，使用默认值
  // 注意：不设置 format 时，Cloudflare 会根据 Accept header 自动选择最佳格式
  if (!transformOptions.quality) {
    transformOptions.quality = DEFAULT_TRANSFORM_OPTIONS.quality;
  }

  // 若查询参数未显式指定 format，则根据客户端 Accept 头优先选择 AVIF/WebP，避免回退为 PNG
  if (!transformOptions.format) {
    const accept = request.headers.get("Accept") || "";
    if (/image\/avif/i.test(accept)) {
      transformOptions.format = "avif";
    } else if (/image\/webp/i.test(accept)) {
      transformOptions.format = "webp";
    }
  }

  // 检查缓存（使用完整的 URL 包括查询参数作为缓存键）
  const cache = (caches as any).default as Cache;
  const cacheKey = new Request(request.url, { method: "GET" });
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

  // 构建原图 URL（用于 fetch）
  // 使用当前请求的 origin 和 /images/ 路径
  const origin = url.origin;
  const originalImageUrl = `${origin}/images/${key}?original=true`;

  // 使用 fetch 获取图片并应用 transformation
  try {
    // 传递原始请求的 headers（包括 Accept header）
    // Cloudflare 会根据 Accept header 自动选择最佳格式（AVIF > WebP > 原格式）
    // 这样只需要一次 transformation（quality），格式由 Cloudflare 自动选择
    const imageRequest = new Request(originalImageUrl, {
      headers: request.headers,
    });

    const fetchOptions: RequestInit = {
      cf: {
        image: transformOptions as any,
      },
    };

    const response = await fetch(imageRequest, fetchOptions);

    if (!response.ok && response.status !== 304) {
      // 如果 transformation 失败，回退到原图
      console.warn(
        `Image transformation failed for ${key}, falling back to original`
      );
      return await getOriginalImage(key, r2, includeBody);
    }

    // 如果是 HEAD 请求，只返回响应头
    if (!includeBody) {
      return new Response(null, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    // 克隆响应并缓存
    const clonedResponse = response.clone();
    waitUntil(
      cache.put(cacheKey, clonedResponse).catch((error) => {
        console.warn("Failed to cache transformed image:", error);
      })
    );

    return response;
  } catch (error) {
    console.error("Error applying image transformation:", error);
    // 出错时回退到原图
    return await getOriginalImage(key, r2, includeBody);
  }
}

/**
 * 获取原始图片（不应用 transformation）
 */
async function getOriginalImage(
  key: string,
  r2: R2Bucket,
  includeBody: boolean
): Promise<Response> {
  // 从 R2 获取
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

  if (includeBody) {
    // GET 请求：读取图片数据
    const imageData = await object.arrayBuffer();
    return new Response(imageData, {
      status: 200,
      headers,
    });
  } else {
    // HEAD 请求：只返回响应头
    return new Response(null, {
      status: 200,
      headers,
    });
  }
}
