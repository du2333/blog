import type {
  GetMediaListInput,
  UpdateMediaNameInput,
} from "@/features/media/media.schema";
import * as Storage from "@/features/media/data/media.storage";
import * as MediaRepo from "@/features/media/data/media.data";
import * as PostMediaRepo from "@/features/posts/data/post-media.data";
import {
  buildTransformOptions,
  getContentTypeFromKey,
} from "@/features/media/media.utils";
import { CACHE_CONTROL } from "@/lib/constants";

export async function upload(context: DbContext & { executionCtx: ExecutionContext }, file: File) {
  const uploaded = await Storage.putToR2(context.env, file);

  try {
    const mediaRecord = await MediaRepo.insertMedia(context.db, {
      key: uploaded.key,
      url: uploaded.url,
      fileName: uploaded.fileName,
      mimeType: uploaded.mimeType,
      sizeInBytes: uploaded.sizeInBytes,
    });
    return mediaRecord;
  } catch (error) {
    console.error("DB Insert Failed, rolling back R2 upload:", error);
    context.executionCtx.waitUntil(
      Storage.deleteFromR2(context.env, uploaded.key).catch(console.error),
    );
    throw new Error("Failed to insert media record");
  }
}

export async function deleteImage(context: DbContext & { executionCtx: ExecutionContext }, key: string) {
  await MediaRepo.deleteMedia(context.db, key);
  context.executionCtx.waitUntil(
    Storage.deleteFromR2(context.env, key).catch(console.error),
  );
}

export async function getMediaList(context: DbContext, data: GetMediaListInput) {
  return await MediaRepo.getMediaList(context.db, data);
}

export async function isMediaInUse(context: DbContext, key: string) {
  return await PostMediaRepo.isMediaInUse(context.db, key);
}

export async function getLinkedPosts(context: DbContext, key: string) {
  return await PostMediaRepo.getPostsByMediaKey(context.db, key);
}

export async function getLinkedMediaKeys(
  context: DbContext,
  keys: Array<string>,
) {
  return await PostMediaRepo.getLinkedMediaKeys(context.db, keys);
}

export async function getTotalMediaSize(context: DbContext) {
  return await MediaRepo.getTotalMediaSize(context.db);
}

export async function updateMediaName(
  context: DbContext,
  data: UpdateMediaNameInput,
) {
  return await MediaRepo.updateMediaName(context.db, data.key, data.name);
}

export async function handleImageRequest(
  env: Env,
  key: string,
  request: Request,
) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const serveOriginal = async () => {
    const object = await env.R2.get(key);
    if (!object) {
      return new Response("Image not found", { status: 404 });
    }

    const contentType =
      object.httpMetadata?.contentType ||
      getContentTypeFromKey(key) ||
      "application/octet-stream";

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Content-Type", contentType);
    headers.set("ETag", object.httpEtag);

    return new Response(object.body, { headers });
  };

  // 1. 防止循环调用 & 显式请求原图
  const viaHeader = request.headers.get("via");
  const isLoop = viaHeader && /image-resizing/.test(viaHeader);
  const wantsOriginal = searchParams.get("original") === "true";

  if (isLoop || wantsOriginal) {
    return await serveOriginal();
  }

  // 2. 构建 Cloudflare Image Resizing 参数
  const transformOptions = buildTransformOptions(
    searchParams,
    request.headers.get("Accept") || "",
  );

  // 3. 尝试进行图片处理
  try {
    const origin = url.origin;
    const sourceImageUrl = `${origin}/images/${key}?original=true`;

    const imageRequest = new Request(sourceImageUrl, {
      headers: request.headers,
    });

    // 调用 Cloudflare Images 变换
    const response = await fetch(imageRequest, {
      cf: { image: transformOptions },
    });

    // 如果变换失败 (如格式不支持)，降级回原图
    if (!response.ok) {
      return await serveOriginal();
    }

    // 4. 返回处理后的图片
    const newHeaders = new Headers(response.headers);

    // 设置缓存头
    Object.entries(CACHE_CONTROL.immutable).forEach(([k, v]) => {
      newHeaders.set(k, v);
    });
    if (!newHeaders.has("Vary")) {
      newHeaders.set("Vary", "Accept");
    }

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  } catch (e) {
    console.error("Image transform failed:", e);
    return await serveOriginal();
  }
}
