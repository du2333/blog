import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const Route = createFileRoute("/_auth/reset-link")({
  validateSearch: z.object({
    token: z.string().optional().catch(undefined),
    error: z.string().optional().catch(undefined),
  }),
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
    <div className="space-y-10">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-serif font-medium tracking-tight">
          重置密码
        </h1>
      </header>

      <ResetPasswordForm token={token} error={error} />
    </div>
  );
}
