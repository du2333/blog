import * as ConfigService from "@/features/config/config.service";
import { createAdminFn } from "@/lib/middlewares";
import {
  SystemConfigSchema,
  TestAiConnectionSchema,
  TestEmailConnectionSchema,
} from "@/features/config/config.schema";

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

export const testAiConnectionFn = createAdminFn({
  method: "POST",
})
  .inputValidator(TestAiConnectionSchema)
  .handler(({ data }) => ConfigService.testAiConnectionService(data));

export const testEmailConnectionFn = createAdminFn({
  method: "POST",
})
  .inputValidator(TestEmailConnectionSchema)
  .handler(({ context, data }) =>
    ConfigService.testEmailConnectionService(context, data),
  );
