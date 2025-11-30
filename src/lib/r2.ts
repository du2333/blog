import { env, waitUntil } from "cloudflare:workers";
import { generateKey } from "@/lib/files";

/**
 * 上传图片到 R2，返回优化后的 URL
 * 默认应用 quality=80 的优化，前端可以通过添加查询参数进一步自定义
 */
export async function uploadImage(
  image: File,
  dimensions?: { width: number; height: number }
) {
  const key = generateKey(image.name);
  const contentType = image.type;

  await env.R2.put(key, image.stream(), {
    httpMetadata: {
      contentType,
    },
    customMetadata: {
      originalName: image.name,
    },
  });

  const url = `/images/${key}`;

  // TODO: 写入数据库

  return {
    previewUrl: `${url}?quality=80`,
  };
}

export async function deleteImage(key: string) {
  await env.R2.delete(key);
  // TODO: 删除数据库记录

  // clear cache
  const promise = new Promise((resolve, reject) => {
    const cache = (caches as any).default as Cache;
    const cacheKey = new Request(`/images/${key}`, { method: "GET" });
    cache.delete(cacheKey).then(resolve).catch(reject);
  });

  waitUntil(promise);
}
