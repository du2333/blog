import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePreviousLocation } from "@/hooks/use-previous-location";
import { authClient } from "@/lib/auth/auth.client";
import { AUTH_KEYS } from "@/features/auth/queries";

const loginSchema = z.object({
  email: z.string().email("无效的邮箱格式"),
  password: z.string().min(1, "请输入密码"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [loginStep, setLoginStep] = useState<"IDLE" | "VERIFYING" | "SUCCESS">(
    "IDLE",
  );
  const [isUnverifiedEmail, setIsUnverifiedEmail] = useState(false);
  const { isEmailConfigured } = useRouteContext({ from: "/_auth" });

  const navigate = useNavigate();
  const previousLocation = usePreviousLocation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: standardSchemaResolver(loginSchema),
  });

  const emailValue = watch("email");

  const onSubmit = async (data: LoginSchema) => {
    setLoginStep("VERIFYING");
    setIsUnverifiedEmail(false);

    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setLoginStep("IDLE");
      if (error.status === 403) {
        setError("root", { message: "邮箱尚未验证" });
        setIsUnverifiedEmail(true);
      } else {
        setError("root", { message: "无效的账号或密码" });
      }
      toast.error("登录失败", { description: error.message });
      return;
    }

    queryClient.removeQueries({ queryKey: AUTH_KEYS.session });
    setLoginStep("SUCCESS");

    setTimeout(() => {
      navigate({ to: redirectTo ?? previousLocation });
      toast.success("欢迎回来");
    }, 800);
  };

  const handleResendVerification = () => {
    if (!emailValue) return;
    toast.promise(
      authClient.sendVerificationEmail({
        email: emailValue,
        callbackURL: `${window.location.origin}/verify-email`,
      }),
      {
        loading: "正在发送验证邮件...",
        success: "验证邮件已发送",
        error: "发送失败，请稍后重试",
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {errors.root && (
        <div className="bg-red-50 dark:bg-red-950/10 border-l-2 border-red-500 p-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-3">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <div className="text-[11px] font-medium text-red-500 uppercase tracking-widest">
              {errors.root.message}
            </div>
          </div>
          {isUnverifiedEmail && (
            <button
              type="button"
              onClick={handleResendVerification}
              className="text-[10px] underline underline-offset-4 hover:opacity-70 transition-opacity ml-7 text-left"
            >
              重新发送验证邮件
            </button>
          )}
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2 group">
          <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-focus-within:text-foreground transition-colors">
            邮箱地址
          </label>
          <Input
            type="email"
            {...register("email")}
            className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-lg font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all placeholder:text-muted-foreground shadow-none px-0"
            placeholder="example@mail.com"
            autoComplete="username"
            disabled={isSubmitting || loginStep !== "IDLE"}
          />
          {errors.email && (
            <span className="text-[9px] text-red-500 uppercase tracking-widest mt-1 block">
              {errors.email.message}
            </span>
          )}
        </div>

        <div className="space-y-2 group">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-focus-within:text-foreground transition-colors">
              登录密码
            </label>
            {isEmailConfigured && (
              <Link
                to="/forgot-password"
                tabIndex={-1}
                className="text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                找回密码
              </Link>
            )}
          </div>
          <Input
            type="password"
            {...register("password")}
            className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-lg font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all placeholder:text-muted-foreground shadow-none px-0"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isSubmitting || loginStep !== "IDLE"}
          />
          {errors.password && (
            <span className="text-[9px] text-red-500 uppercase tracking-widest mt-1 block">
              {errors.password.message}
            </span>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || loginStep !== "IDLE"}
        className="w-full h-14 bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.4em] font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-3 group rounded-sm"
      >
        {loginStep === "VERIFYING" ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <>
            <span>登录</span>
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </>
        )}
      </Button>
    </form>
  );
}
