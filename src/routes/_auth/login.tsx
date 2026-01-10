import { Link, createFileRoute, useRouteContext } from "@tanstack/react-router";
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
  const { isEmailConfigured } = useRouteContext({ from: "/_auth" });

  return (
    <div className={isEmailConfigured ? "space-y-10" : "space-y-6 pt-4"}>
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-serif font-medium tracking-tight">
          {isEmailConfigured ? "登录" : "身份验证"}
        </h1>
        {!isEmailConfigured && (
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground opacity-50">
            目前仅支持受信任的第三方提供商
          </p>
        )}
      </header>

      <div className={isEmailConfigured ? "space-y-10" : "space-y-0"}>
        {isEmailConfigured && <LoginForm />}

        <SocialLogin showDivider={isEmailConfigured} />

        {isEmailConfigured && (
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
        )}
      </div>
    </div>
  );
}
