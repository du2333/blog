import {
  deleteMedia,
  getMediaList,
  getTotalMediaSize,
  insertMedia,
  updateMediaName,
} from "@/features/media/data/media.data";
import {
  getLinkedMediaKeys,
  getPostsByMediaKey,
  isMediaInUse,
} from "@/features/posts/data/post-media.data";
import { deleteCachedAsset } from "@/lib/cache";
import { deleteImage, uploadImage } from "@/lib/images/r2";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createAdminFn } from "@/lib/auth/procedure";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const uploadImageFn = createAdminFn({
  method: "POST",
})
  .inputValidator(z.instanceof(FormData))
  .handler(async ({ data, context }) => {
    const file = data.get("image");

    if (!(file instanceof File)) {
      throw new Error("Image file is required");
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size must be less than 10MB");
    }

    // 验证文件类型
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("File type must be an image");
    }

    const uploadedResult = await uploadImage(context.env, file);

    try {
      const mediaRecord = await insertMedia(context.db, {
        key: uploadedResult.key,
        url: uploadedResult.url,
        fileName: uploadedResult.fileName,
        mimeType: uploadedResult.mimeType,
        sizeInBytes: uploadedResult.sizeInBytes,
      });
      return mediaRecord;
    } catch (error) {
      console.error("DB Insert Failed, rolling back R2 upload:", error);
      context.executionCtx.waitUntil(
        deleteImage(context.env, uploadedResult.key).catch(console.error)
      );
      throw new Error("Failed to insert media record");
    }
  });

export const deleteImageFn = createAdminFn()
  .inputValidator(
    z.object({
      key: z.string().min(1, "Image key is required"),
    })
  )
  .handler(async ({ data, context }) => {
    const { key } = data;

    await deleteMedia(context.db, key);

    const backgroundTasks = Promise.all([
      deleteImage(context.env, key).catch((err) =>
        console.error("Failed to delete image from R2:", err)
      ),
      deleteCachedAsset(`/images/${key}`),
    ]);
    context.executionCtx.waitUntil(backgroundTasks);
  });

export const getMediaFn = createAdminFn()
  .inputValidator(
    z.object({
      cursor: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
    })
  )
  .handler(async ({ data, context }) => {
    return await getMediaList(context.db, data);
  });

export const checkMediaInUseFn = createAdminFn()
  .inputValidator(
    z.object({
      key: z.string().min(1, "Image key is required"),
    })
  )
  .handler(async ({ data, context }) => {
    return await isMediaInUse(context.db, data.key);
  });

export const getLinkedPostsFn = createServerFn()
  .inputValidator(
    z.object({
      key: z.string().min(1, "Image key is required"),
    })
  )
  .handler(async ({ data, context }) => {
    return await getPostsByMediaKey(context.db, data.key);
  });

export const getLinkedMediaKeysFn = createAdminFn()
  .inputValidator(
    z.object({
      keys: z.array(z.string()),
    })
  )
  .handler(async ({ data, context }) => {
    return await getLinkedMediaKeys(context.db, data.keys);
  });

export const getTotalMediaSizeFn = createAdminFn().handler(
  async ({ context }) => {
    return await getTotalMediaSize(context.db);
  }
);

export const updateMediaNameFn = createAdminFn()
  .inputValidator(
    z.object({
      key: z.string().min(1, "Image key is required"),
      name: z.string().min(1, "Image name is required"),
    })
  )
  .handler(async ({ data, context }) => {
    return await updateMediaName(context.db, data.key, data.name);
  });
