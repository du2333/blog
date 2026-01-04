import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { SystemConfig } from "@/features/config/config.schema";

export function createModel(config: SystemConfig["ai"]) {
  if (!config?.activeProvider || !config.providers) {
    throw new Error("AI_NOT_CONFIGURED");
  }

  const providerConfig = config.providers[config.activeProvider];
  if (!providerConfig?.apiKey || !providerConfig.model) {
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
