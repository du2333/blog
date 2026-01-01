import { z } from "zod";
import { getSystemConfig, upsertSystemConfig } from "./config.data";
import { SystemConfigSchema } from "./config.schema";
import { cachedData, deleteCachedData } from "@/features/cache/cache.data";
import { testEmailConnection } from "@/features/email/email.service";
import { testAiConnection } from "@/lib/ai";
import { createAdminFn } from "@/lib/middlewares";

export const getSystemConfigFn = createAdminFn().handler(
	async ({ context }) => {
		return cachedData(
			context,
			["system"],
			SystemConfigSchema.nullable(),
			async () => {
				return await getSystemConfig(context.db);
			},
		);
	},
);

export const updateSystemConfigFn = createAdminFn({
	method: "POST",
})
	.inputValidator(SystemConfigSchema)
	.handler(async ({ context, data }) => {
		await upsertSystemConfig(context.db, data);
		await deleteCachedData(context, ["system"]);

		return { success: true };
	});

const testAiConnectionSchema = z.object({
	provider: z.enum(["GOOGLE", "DEEPSEEK"]),
	apiKey: z.string().min(1),
	model: z.string().min(1),
});

export const testAiConnectionFn = createAdminFn({
	method: "POST",
})
	.inputValidator(testAiConnectionSchema)
	.handler(async ({ data }) => {
		const result = await testAiConnection(
			data.provider,
			data.apiKey,
			data.model,
		);
		return result;
	});

const testEmailConnectionSchema = z.object({
	apiKey: z.string().min(1),
	senderAddress: z.string().email(),
	senderName: z.string().optional(),
});

export const testEmailConnectionFn = createAdminFn({
	method: "POST",
})
	.inputValidator(testEmailConnectionSchema)
	.handler(async ({ context, data }) => {
		const result = await testEmailConnection(context.env, {
			apiKey: data.apiKey,
			senderAddress: data.senderAddress,
			senderName: data.senderName,
		});
		return result;
	});
