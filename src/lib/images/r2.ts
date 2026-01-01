import { generateKey } from "@/lib/images/utils";

/**
 * 上传图片到 R2，返回完整的 Media 对象
 */
export async function uploadImage(env: Env, image: File) {
  const key = generateKey(image.name);
  const contentType = image.type;
  const url = `/images/${key}`;

  await env.R2.put(key, image.stream(), {
    httpMetadata: {
      contentType,
    },
    customMetadata: {
      originalName: image.name,
    },
  });

  return {
    key,
    url,
    fileName: image.name,
    mimeType: contentType,
    sizeInBytes: image.size,
  };
}

export async function deleteImage(env: Env, key: string) {
  await env.R2.delete(key);
}
