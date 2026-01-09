import { Output, generateText } from "ai";
import { z } from "zod";
import { createWorkersAI } from "workers-ai-provider";

export async function summarizeText(
  context: {
    env: Env;
  },
  text: string,
) {
  const workersAI = createWorkersAI({ binding: context.env.AI });

  const result = await generateText({
    // @ts-expect-error 不知道为啥workers-ai-provider的类型定义不完整
    model: workersAI("@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
    messages: [
      {
        role: "system",
        content:
          "你是专业的摘要生成器。请生成简洁明了的摘要，不要超过200个汉字。请直接输出摘要内容，不要包含'摘要：'等前缀。",
      },
      {
        role: "user",
        content: text,
      },
    ],
    output: Output.object({
      schema: z.object({
        summary: z.string().describe("摘要"),
      }),
    }),
  });

  return {
    summary: result.output.summary,
  };
}
