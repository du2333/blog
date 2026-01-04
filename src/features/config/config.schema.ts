import { z } from "zod";

export const AI_PROVIDERS = ["GOOGLE", "DEEPSEEK"] as const;

export const SystemConfigSchema = z.object({
  ai: z
    .object({
      activeProvider: z.enum(AI_PROVIDERS).optional(),
      providers: z
        .object({
          GOOGLE: z
            .object({
              apiKey: z.string().optional(),
              model: z.string().optional(),
            })
            .optional(),
          DEEPSEEK: z
            .object({
              apiKey: z.string().optional(),
              model: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
  email: z
    .object({
      apiKey: z.string().optional(),
      senderName: z.string().optional(),
      senderAddress: z.union([z.email(), z.literal("")]).optional(),
    })
    .optional(),
});

export type SystemConfig = z.infer<typeof SystemConfigSchema>;

export const DEFAULT_CONFIG: SystemConfig = {
  ai: {
    activeProvider: "GOOGLE",
    providers: {
      GOOGLE: {
        apiKey: "",
        model: "gemini-2.5-flash",
      },
      DEEPSEEK: {
        apiKey: "",
        model: "deepseek-chat",
      },
    },
  },
  email: {
    apiKey: "",
    senderName: "",
    senderAddress: "",
  },
};

export const TestAiConnectionSchema = z.object({
  provider: z.enum(AI_PROVIDERS),
  apiKey: z.string().min(1),
  model: z.string().min(1),
});

export const TestEmailConnectionSchema = z.object({
  apiKey: z.string().min(1),
  senderAddress: z.email(),
  senderName: z.string().optional(),
});

export type TestAiConnectionInput = z.infer<typeof TestAiConnectionSchema>;
export type TestEmailConnectionInput = z.infer<
  typeof TestEmailConnectionSchema
>;
