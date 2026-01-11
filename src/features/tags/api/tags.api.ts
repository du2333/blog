import {
  CreateTagInputSchema,
  DeleteTagInputSchema,
  GenerateTagsInputSchema,
  GetTagsByPostIdInputSchema,
  GetTagsInputSchema,
  SetPostTagsInputSchema,
  UpdateTagInputSchema,
} from "@/features/tags/tags.schema";
import * as TagService from "@/features/tags/tags.service";
import * as AIService from "@/features/ai/ai.service";
import {
  createAdminFn,
  createCachedFn,
  createRateLimitMiddleware,
} from "@/lib/middlewares";

// ============ Public API ============

export const getTagsFn = createCachedFn()
  .middleware([
    createRateLimitMiddleware({
      capacity: 60,
      interval: "1m",
      key: "tags:getAll",
    }),
  ])
  .inputValidator(GetTagsInputSchema)
  .handler(async ({ data, context }) => {
    return await TagService.getTags(context, data);
  });

// ============ Admin API ============

// Admin version without function-level caching (uses service-level KV cache)
export const getTagsAdminFn = createAdminFn()
  .inputValidator(GetTagsInputSchema)
  .handler(async ({ data, context }) => {
    return await TagService.getTags(context, { ...data, skipCache: true });
  });

export const createTagFn = createAdminFn({
  method: "POST",
})
  .inputValidator(CreateTagInputSchema)
  .handler(({ data, context }) => TagService.createTag(context, data));

export const updateTagFn = createAdminFn({
  method: "POST",
})
  .inputValidator(UpdateTagInputSchema)
  .handler(({ data, context }) => TagService.updateTag(context, data));

export const deleteTagFn = createAdminFn({
  method: "POST",
})
  .inputValidator(DeleteTagInputSchema)
  .handler(({ data, context }) => TagService.deleteTag(context, data));

export const setPostTagsFn = createAdminFn({
  method: "POST",
})
  .inputValidator(SetPostTagsInputSchema)
  .handler(({ data, context }) => TagService.setPostTags(context, data));

export const getTagsByPostIdFn = createAdminFn()
  .inputValidator(GetTagsByPostIdInputSchema)
  .handler(({ data, context }) => TagService.getTagsByPostId(context, data));

export const getTagsWithCountAdminFn = createAdminFn()
  .inputValidator(GetTagsInputSchema)
  .handler(async ({ data, context }) => {
    return await TagService.getTagsWithCount(context, data);
  });

export const generateTagsFn = createAdminFn({
  method: "POST",
})
  .inputValidator(GenerateTagsInputSchema)
  .handler(async ({ data, context }) => {
    return await AIService.generateTags(
      context,
      {
        title: data.title,
        summary: data.summary,
        content: data.content,
      },
      data.existingTags,
    );
  });
