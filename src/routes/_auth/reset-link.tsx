import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const Route = createFileRoute("/_auth/reset-link")({
  validateSearch: z.object({
    token: z.string().optional().catch(undefined),
    error: z.string().optional().catch(undefined),
  }),
  beforeLoad: ({ context }) => {
    if (!context.isEmailConfigured) {
      throw redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "重置密码",
      },
    ],
  }),
});

function RouteComponent() {
  const { token, error } = Route.useSearch();

  return (
    <div className="space-y-12">
      <header className="text-center space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground/60">
          [ RESET_PASSWORD ]
        </p>
        <h1 className="text-2xl font-serif font-medium tracking-tight">
          重置密码
        </h1>
      </header>

      <ResetPasswordForm token={token} error={error} />
    </div>
  );
}
