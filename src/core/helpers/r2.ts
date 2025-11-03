import { env, waitUntil } from "cloudflare:workers";
import { generateKey } from "@/lib/files";

/**
 * 默认的图片优化参数（通过查询参数）
 */
const DEFAULT_OPTIMIZATION_PARAMS = "quality=80";

/**
 * 上传图片到 R2，返回优化后的 URL
 * 默认应用 quality=80 的优化，前端可以通过添加查询参数进一步自定义
 */
export async function uploadImage(image: File) {
  const key = generateKey(image.name);
  const body = await image.arrayBuffer();
  const contentType = image.type;

  const result = await env.R2.put(key, body, {
    httpMetadata: {
      contentType,
    },
  });

  // 返回带默认优化参数的 URL
  // 如果需要原图，可以使用 ?original=true
  return {
    key: result.key,
    url: `/images/${result.key}?${DEFAULT_OPTIMIZATION_PARAMS}`,
  };
}

export async function deleteImage(key: string) {
  await env.R2.delete(key);

  // clear cache
  const promise = new Promise((resolve, reject) => {
    const cache = (caches as any).default as Cache;
    const cacheKey = new Request(`/images/${key}`, { method: "GET" });
    cache.delete(cacheKey).then(resolve).catch(reject);
  });

  waitUntil(promise);
}
