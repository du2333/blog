import { z } from "zod";

export const SystemConfigSchema = z.object({
  email: z
    .object({
      apiKey: z.string().optional(),
      senderName: z.string().optional(),
      senderAddress: z.union([z.email(), z.literal("")]).optional(),
    })
    .optional(),
  umami: z
    .object({
      websiteId: z.string().optional(),
      src: z.string().optional(),
      apiKey: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
    })
    .optional(),
});

export type SystemConfig = z.infer<typeof SystemConfigSchema>;

export const DEFAULT_CONFIG: SystemConfig = {
  umami: undefined,
  email: {
    apiKey: "",
    senderName: "",
    senderAddress: "",
  },
};

export const CONFIG_CACHE_KEYS = {
  system: ["system"] as const,
  isEmailConfigured: ["isEmailConfigured"] as const,
} as const;
