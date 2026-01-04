import { createAdminFn } from "@/lib/middlewares";
import { testEmailConnection } from "@/features/email/email.service";
import { TestEmailConnectionSchema } from "@/features/email/email.schema";

export const testEmailConnectionFn = createAdminFn({
  method: "POST",
})
  .inputValidator(TestEmailConnectionSchema)
  .handler(({ context, data }) => testEmailConnection(context, data));
