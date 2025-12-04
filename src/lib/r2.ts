import { deleteMedia, insertMedia, type Media } from "@/db/queries/media";
import { cacheDelete } from "@/lib/cache";
import { generateKey } from "@/lib/files";
import { env, waitUntil } from "cloudflare:workers";

/**
 * 上传图片到 R2，返回完整的 Media 对象
 */
export async function uploadImage(
  image: File,
  dimensions?: { width: number; height: number }
): Promise<Media> {
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

  const media = await insertMedia({
    key,
    url,
    fileName: image.name,
    width: dimensions?.width,
    height: dimensions?.height,
    mimeType: contentType,
    sizeInBytes: image.size,
  });

  return media;
}

export async function deleteImage(key: string) {
  await env.R2.delete(key);
  await deleteMedia(key);

  waitUntil(cacheDelete(`/images/${key}`));
}
