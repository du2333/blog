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
  .handler(async ({ data }) => {
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

    return await uploadImage(file);
  });

export const deleteImageFn = createServerFn()
  .inputValidator(
    z.object({
      key: z.string().min(1, "Image key is required"),
    })
  )
  .handler(async ({ data }) => {
    const { key } = data;
    await deleteImage(key);
  });
