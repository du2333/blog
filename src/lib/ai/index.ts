import type { SystemConfig } from "@/features/config/config.schema";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export function createModel(config: SystemConfig["ai"]) {
	if (!config?.activeProvider || !config?.providers) {
		throw new Error("AI_NOT_CONFIGURED");
	}

	const providerConfig = config.providers[config.activeProvider];
	if (!providerConfig?.apiKey || !providerConfig?.model) {
		throw new Error("AI_NOT_CONFIGURED");
	}

	switch (config.activeProvider) {
		case "GOOGLE": {
			const google = createGoogleGenerativeAI({
				apiKey: providerConfig.apiKey,
			});
			return google(providerConfig.model);
		}
		case "DEEPSEEK": {
			const deepseek = createDeepSeek({
				apiKey: providerConfig.apiKey,
			});
			return deepseek(providerConfig.model);
		}
	}
}

export const GoogleModels = [
	"gemini-3-flash-preview",
	"gemini-3-pro-preview",
	"gemini-2.5-flash",
] as const;

export const DeepSeekModels = ["deepseek-chat", "deepseek-reasoner"] as const;

export type GoogleModelId = (typeof GoogleModels)[number];
export type DeepSeekModelId = (typeof DeepSeekModels)[number];

/**
 * 测试 AI 提供者连接
 * @param provider - 提供者类型
 * @param apiKey - API 密钥
 * @param model - 模型 ID
 * @returns 连接是否成功
 */
export async function testAiConnection(
	provider: "GOOGLE" | "DEEPSEEK",
	apiKey: string,
	model: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		let modelInstance;

		switch (provider) {
			case "GOOGLE": {
				const google = createGoogleGenerativeAI({ apiKey });
				modelInstance = google(model);
				break;
			}
			case "DEEPSEEK": {
				const deepseek = createDeepSeek({ apiKey });
				modelInstance = deepseek(model);
				break;
			}
		}

		await generateText({
			model: modelInstance,
			prompt: "你是谁",
		});

		return { success: true };
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : "未知错误";
		return { success: false, error: errorMessage };
	}
}
