import { env } from "cloudflare:workers";
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
