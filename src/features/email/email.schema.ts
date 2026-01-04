import { z } from "zod";

export const TestEmailConnectionSchema = z.object({
  apiKey: z.string().min(1),
  senderAddress: z.email(),
  senderName: z.string().optional(),
});

export type TestEmailConnectionInput = z.infer<
  typeof TestEmailConnectionSchema
>;
