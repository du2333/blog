import { z } from "zod";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const UploadMediaInputSchema = z
  .instanceof(FormData)
  .transform((formData) => {
    const file = formData.get("image");
    if (!(file instanceof File)) throw new Error("Image file is required");
    if (file.size > MAX_FILE_SIZE)
      throw new Error("File size must be less than 10MB");
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type))
      throw new Error("File type must be an image");
    return file;
  });

export const UpdateMediaNameInputSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
});

export const GetMediaListInputSchema = z.object({
  cursor: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
});

export type UpdateMediaNameInput = z.infer<typeof UpdateMediaNameInputSchema>;
export type GetMediaListInput = z.infer<typeof GetMediaListInputSchema>;
