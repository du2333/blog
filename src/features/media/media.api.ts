import { z } from "zod";
import {
  GetMediaListInputSchema,
  UpdateMediaNameInputSchema,
  UploadMediaInputSchema,
} from "@/features/media/media.schema";
import * as MediaService from "@/features/media/media.service";
import { createAdminFn } from "@/lib/middlewares";

export const uploadImageFn = createAdminFn({
  method: "POST",
})
  .inputValidator(UploadMediaInputSchema)
  .handler(({ data: file, context }) => MediaService.upload(context, file));

export const deleteImageFn = createAdminFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      key: z.string().min(1, "Image key is required"),
    }),
  )
  .handler(({ data, context }) => MediaService.deleteImage(context, data.key));

export const getMediaFn = createAdminFn()
  .inputValidator(GetMediaListInputSchema)
  .handler(({ data, context }) => MediaService.getMediaList(context, data));

export const checkMediaInUseFn = createAdminFn()
  .inputValidator(
    z.object({
      key: z.string().min(1, "Image key is required"),
    }),
  )
  .handler(({ data, context }) => MediaService.isMediaInUse(context, data.key));

export const getLinkedPostsFn = createAdminFn()
  .inputValidator(
    z.object({
      key: z.string().min(1, "Image key is required"),
    }),
  )
  .handler(({ data, context }) =>
    MediaService.getLinkedPosts(context, data.key),
  );

export const getLinkedMediaKeysFn = createAdminFn()
  .inputValidator(
    z.object({
      keys: z.array(z.string()),
    }),
  )
  .handler(({ data, context }) =>
    MediaService.getLinkedMediaKeys(context, data.keys),
  );

export const getTotalMediaSizeFn = createAdminFn().handler(({ context }) =>
  MediaService.getTotalMediaSize(context),
);

export const updateMediaNameFn = createAdminFn({
  method: "POST",
})
  .inputValidator(UpdateMediaNameInputSchema)
  .handler(({ data, context }) => MediaService.updateMediaName(context, data));
