import { z } from "zod";

export const AI_PROVIDERS = ["GOOGLE", "DEEPSEEK"] as const;

export const TestAiConnectionSchema = z.object({
  provider: z.enum(AI_PROVIDERS),
  apiKey: z.string().min(1),
  model: z.string().min(1),
});

export type TestAiConnectionInput = z.infer<typeof TestAiConnectionSchema>;
