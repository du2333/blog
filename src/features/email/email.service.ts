import type { DB } from "@/lib/db";
import { getSystemConfig } from "@/features/config/config.data";
import { createEmailClient } from "@/lib/email";
import { serverEnv } from "@/lib/env/server.env";

export async function testEmailConnection(
  env: Env,
  options: {
    apiKey: string;
    senderAddress: string;
    senderName?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    const { ADMIN_EMAIL } = serverEnv(env);
    const { apiKey, senderAddress, senderName } = options;
    const resend = createEmailClient({ apiKey });

    const result = await resend.emails.send({
      from: senderName ? `${senderName} <${senderAddress}>` : senderAddress,
      to: ADMIN_EMAIL, // 发送给自己进行测试
      subject: "测试连接 - Test Connection",
      html: "<p>这是一个测试邮件</p>",
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    return { success: false, error: errorMessage };
  }
}

export async function sendEmail(
  db: DB,
  options: {
    to: string;
    subject: string;
    html: string;
  },
) {
  const config = await getSystemConfig(db);
  const email = config?.email;

  if (!email?.apiKey || !email.senderAddress) {
    console.warn(`[EMAIL_SERVICE] 未配置邮件服务，跳过发送至: ${options.to}`);
    return { status: "DISABLED" as const };
  }

  const resend = createEmailClient({ apiKey: email.apiKey });

  const result = await resend.emails.send({
    from: email.senderName
      ? `${email.senderName} <${email.senderAddress}>`
      : email.senderAddress,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  if (result.error) {
    return { status: "FAILED" as const, error: result.error.message };
  }

  return { status: "SUCCESS" as const };
}
