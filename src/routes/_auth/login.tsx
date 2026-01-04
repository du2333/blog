import { Link, createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/features/auth/components/login-form";
import { SocialLogin } from "@/features/auth/components/social-login";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "登录",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <div className="space-y-10">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-serif font-medium tracking-tight">登录</h1>
      </header>

      <div className="space-y-10">
        <LoginForm />

        <SocialLogin />

        <div className="text-center pt-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            没有账户?{" "}
            <Link
              to="/register"
              className="text-foreground font-medium hover:underline underline-offset-4 ml-2"
            >
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
