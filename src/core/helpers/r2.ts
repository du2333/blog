import { env, waitUntil } from "cloudflare:workers";
import { generateKey } from "@/lib/files";

// TODO: add image transformation using Cloudflare Images
export async function uploadImage(image: File) {
  const key = generateKey(image.name);
  const body = await image.arrayBuffer();
  const contentType = image.type;

  const result = await env.R2.put(key, body, {
    httpMetadata: {
      contentType,
    },
  });

  return {
    key: result.key,
    url: `/images/${result.key}`,
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
