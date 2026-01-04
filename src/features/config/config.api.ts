import * as ConfigService from "@/features/config/config.service";
import { createAdminFn } from "@/lib/middlewares";
import { SystemConfigSchema } from "@/features/config/config.schema";

export const getSystemConfigFn = createAdminFn().handler(({ context }) =>
  ConfigService.getSystemConfig(context),
);

export const updateSystemConfigFn = createAdminFn({
  method: "POST",
})
  .inputValidator(SystemConfigSchema)
  .handler(({ context, data }) =>
    ConfigService.updateSystemConfig(context, data),
  );
