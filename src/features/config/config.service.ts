import type {
  SystemConfig,
  TestAiConnectionInput,
  TestEmailConnectionInput,
} from "@/features/config/config.schema";
import * as AiService from "@/features/ai/ai.service";
import * as CacheService from "@/features/cache/cache.service";
import * as ConfigRepo from "@/features/config/config.data";
import { SystemConfigSchema } from "@/features/config/config.schema";
import * as EmailService from "@/features/email/email.service";

export async function getSystemConfig(context: Context) {
  return await CacheService.get(
    context,
    ["system"],
    SystemConfigSchema.nullable(),
    async () => await ConfigRepo.getSystemConfig(context.db),
  );
}

export async function updateSystemConfig(context: Context, data: SystemConfig) {
  await ConfigRepo.upsertSystemConfig(context.db, data);
  await CacheService.deleteKey(
    context,
    ["system"],
    ["isEmailVerficationRequired"],
  );

  return { success: true };
}

export async function testAiConnectionService(data: TestAiConnectionInput) {
  return await AiService.testAiConnection(
    data.provider,
    data.apiKey,
    data.model,
  );
}

export async function testEmailConnectionService(
  context: Context,
  data: TestEmailConnectionInput,
) {
  return await EmailService.testEmailConnection(context, {
    apiKey: data.apiKey,
    senderAddress: data.senderAddress,
    senderName: data.senderName,
  });
}
