import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/forgot-password")({
  beforeLoad: ({ context }) => {
    if (!context.isEmailVerficationRequired) {
      throw redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-10">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-serif font-medium tracking-tight">
          找回密码
        </h1>
      </header>

      <ForgotPasswordForm />
    </div>
  );
}
