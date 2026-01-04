import { createAdminFn } from "@/lib/middlewares";
import { testAiConnection } from "@/features/ai/ai.service";
import { TestAiConnectionSchema } from "@/features/ai/ai.schema";

export const testAiConnectionFn = createAdminFn({
  method: "POST",
})
  .inputValidator(TestAiConnectionSchema)
  .handler(({ data }) => testAiConnection(data));
