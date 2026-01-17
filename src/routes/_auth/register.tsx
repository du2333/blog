import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { RegisterForm } from "@/features/auth/components/register-form";

export const Route = createFileRoute("/_auth/register")({
  beforeLoad: ({ context }) => {
    if (!context.isEmailConfigured) {
      throw redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "注册",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <div className="space-y-12">
      <header className="text-center space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground/60">
          [ REGISTER ]
        </p>
        <h1 className="text-2xl font-serif font-medium tracking-tight">注册</h1>
      </header>

      <div className="space-y-10">
        <RegisterForm />

        <div className="text-center pt-4">
          <p className="text-[10px] font-mono text-muted-foreground/50 tracking-wider">
            已有账户?{" "}
            <Link
              to="/login"
              className="text-foreground hover:opacity-70 transition-opacity ml-1"
            >
              [ 前往登录 ]
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
