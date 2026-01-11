import { WorkflowEntrypoint } from "cloudflare:workers";
import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import { sendEmail } from "@/features/email/email.service";
import { getDb } from "@/lib/db";

interface Params {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
}

export class SendEmailWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { to, subject, html, headers } = event.payload;

    await step.do(
      `send email to ${to}`,
      {
        retries: {
          limit: 3,
          delay: "10 seconds",
          backoff: "exponential",
        },
      },
      async () => {
        const db = getDb(this.env);
        const result = await sendEmail(
          { db, env: this.env },
          { to, subject, html, headers },
        );

        if (result.status === "FAILED") {
          throw new Error(`Email send failed: ${result.error}`);
        }

        if (result.status === "DISABLED") {
          console.log(`[SendEmailWorkflow] Email service disabled, skipping`);
          return;
        }

        console.log(`[SendEmailWorkflow] Email sent successfully to ${to}`);
      },
    );
  }
}
