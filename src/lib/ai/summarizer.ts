import type { DB } from "@/lib/db";
import { generateObject } from "ai";
import { z } from "zod";
import { getSystemConfig } from "@/features/config/config.data";
import { createModel } from "@/lib/ai";

export async function summarizeText(db: DB, text: string) {
	const config = await getSystemConfig(db);
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
