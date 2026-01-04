import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateObject, generateText } from "ai";
import type { DB } from "@/lib/db";
import type { TestAiConnectionInput } from "@/features/ai/ai.schema";
import { createModel } from "@/features/ai/ai.utils";
import { getSystemConfig } from "@/features/config/config.data";

/**
 * 测试 AI 提供者连接
 * @param provider - 提供者类型
 * @param apiKey - API 密钥
 * @param model - 模型 ID
 * @returns 连接是否成功
 */
export async function testAiConnection(
  data: TestAiConnectionInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { provider, apiKey, model } = data;
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    return { success: false, error: errorMessage };
  }
}

export async function summarizeText(
  context: {
    db: DB;
  },
  text: string,
) {
  const config = await getSystemConfig(context.db);
  const model = createModel(config?.ai);

  const result = await generateObject({
    model,
    prompt:
      `你是专业的摘要生成器，请根据以下内容生成摘要，摘要要求简洁明了，不要超过100字：
    ${text}
    `.trim(),
    schema: z.object({
      summary: z.string().describe("摘要"),
    }),
  });

  return {
    summary: result.object.summary,
  };
}
