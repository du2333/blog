import { createServerFn } from "@tanstack/react-start";
import * as ConfigService from "@/features/config/config.service";
import {
  adminMiddleware,
  createCacheHeaderMiddleware,
  dbMiddleware,
} from "@/lib/middlewares";
import { SystemConfigSchema } from "@/features/config/config.schema";

export const getSystemConfigFn = createServerFn()
  .middleware([adminMiddleware])
  .handler(({ context }) => ConfigService.getSystemConfig(context));

export const updateSystemConfigFn = createServerFn({
  method: "POST",
})
  .middleware([adminMiddleware])
  .inputValidator(SystemConfigSchema)
  .handler(({ context, data }) =>
    ConfigService.updateSystemConfig(context, data),
  );

export const getPublicConfigFn = createServerFn()
  .middleware([createCacheHeaderMiddleware("swr"), dbMiddleware])
  .handler(async ({ context }) => {
    const config = await ConfigService.getSystemConfig(context);
    return {
      umami: config?.umami
        ? {
            websiteId: config.umami.websiteId,
            src: config.umami.src,
          }
        : undefined,
    };
  });
