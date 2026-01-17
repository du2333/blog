import { createFileRoute, redirect } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const Route = createFileRoute("/_auth/forgot-password")({
  beforeLoad: ({ context }) => {
    if (!context.isEmailConfigured) {
      throw redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "找回密码",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <div className="space-y-12">
      <header className="text-center space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground/60">
          [ FORGOT_PASSWORD ]
        </p>
        <h1 className="text-2xl font-serif font-medium tracking-tight">
          找回密码
        </h1>
      </header>

      <ForgotPasswordForm />
    </div>
  );
}
