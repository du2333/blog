import {
  getMediaList,
  getTotalMediaSize,
  updateMediaName,
} from "@/lib/db/queries/media";
import {
  getLinkedMediaKeys,
  getPostsByMediaKey,
  isMediaInUse,
} from "@/lib/db/queries/post-media";
import { deleteImage, uploadImage } from "@/lib/r2";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const uploadImageFn = createServerFn({
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

    return await uploadImage(context.db, context.env, file);
  });

export const deleteImageFn = createServerFn()
  .inputValidator(
    z.object({
      key: z.string().min(1, "Image key is required"),
    })
  )
  .handler(async ({ data, context }) => {
    const { key } = data;
    await deleteImage(context.db, context.env, context.executionCtx, key);
  });

export const getMediaFn = createServerFn()
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

export const checkMediaInUseFn = createServerFn()
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

export const getLinkedMediaKeysFn = createServerFn()
  .inputValidator(
    z.object({
      keys: z.array(z.string()),
    })
  )
  .handler(async ({ data, context }) => {
    return await getLinkedMediaKeys(context.db, data.keys);
  });

export const getTotalMediaSizeFn = createServerFn().handler(
  async ({ context }) => {
    return await getTotalMediaSize(context.db);
  }
);

export const updateMediaNameFn = createServerFn()
  .inputValidator(
    z.object({
      key: z.string().min(1, "Image key is required"),
      name: z.string().min(1, "Image name is required"),
    })
  )
  .handler(async ({ data, context }) => {
    return await updateMediaName(context.db, data.key, data.name);
  });
