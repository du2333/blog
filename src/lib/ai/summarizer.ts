import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export async function summarizeText({ text }: { text: string }) {
  const result = await generateObject({
    model: google("gemini-2.5-flash"),
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
