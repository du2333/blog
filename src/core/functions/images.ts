import { uploadImage } from "@/core/helpers/r2";
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
  .inputValidator(
    z.object({
      image: z
        .instanceof(File)
        .refine((file) => file.size <= MAX_FILE_SIZE, {
          message: "File size must be less than 10MB",
        })
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
          message: "File type must be an image",
        }),
    })
  )
  .handler(async ({ data }) => {
    const { image } = data;
    return await uploadImage(image);
  });
