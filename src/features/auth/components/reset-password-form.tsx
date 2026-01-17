import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth.client";
import { AUTH_KEYS } from "@/features/auth/queries";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "密码至少 8 位"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "密码输入不一致",
    path: ["confirmPassword"],
  });

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({
  token,
  error,
}: {
  token?: string;
  error?: string;
}) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: standardSchemaResolver(resetPasswordSchema),
  });
  const queryClient = useQueryClient();

  const onSubmit = async (data: ResetPasswordSchema) => {
    if (!token) {
      toast.error("缺少安全令牌");
      return;
    }

    const { error: resetPasswordError } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    if (resetPasswordError) {
      toast.error("重置失败", {
        description: "令牌可能已过期，请重新请求。",
      });
      return;
    }

    queryClient.removeQueries({ queryKey: AUTH_KEYS.session });

    toast.success("密码已更新", {
      description: "请使用新密码重新登录。",
    });
    navigate({ to: "/login" });
  };

  if (!token && !error) {
    return (
      <div className="text-center space-y-6 animate-in fade-in duration-500">
        <p className="text-sm text-destructive/70 font-light">
          错误：缺少授权令牌
        </p>
        <button
          onClick={() => navigate({ to: "/login" })}
          className="w-full py-4 border border-border/40 text-[10px] font-mono uppercase tracking-[0.3em] hover:border-foreground transition-all"
        >
          返回登录
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-6 animate-in fade-in duration-500">
        <p className="text-sm text-destructive/70 font-light">
          错误：无效的链接 ({error})
        </p>
        <button
          onClick={() => navigate({ to: "/forgot-password" })}
          className="w-full py-4 border border-border/40 text-[10px] font-mono uppercase tracking-[0.3em] hover:border-foreground transition-all"
        >
          重新请求链接
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <p className="text-sm text-muted-foreground/60 font-light leading-relaxed">
        您的身份已验证。请在下方输入新密码以完成重置。
      </p>

      <div className="space-y-6">
        <div className="space-y-2 group">
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 group-focus-within:text-foreground transition-colors">
            新密码
          </label>
          <Input
            type="password"
            {...register("password")}
            className="w-full bg-transparent border-0 border-b border-border/40 rounded-none py-3 text-sm font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all placeholder:text-muted-foreground/30 shadow-none px-0"
            placeholder="••••••••"
          />
          {errors.password && (
            <span className="text-[9px] font-mono text-destructive uppercase tracking-widest mt-1 block">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="space-y-2 group">
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 group-focus-within:text-foreground transition-colors">
            确认新密码
          </label>
          <Input
            type="password"
            {...register("confirmPassword")}
            className="w-full bg-transparent border-0 border-b border-border/40 rounded-none py-3 text-sm font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all placeholder:text-muted-foreground/30 shadow-none px-0"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <span className="text-[9px] font-mono text-destructive uppercase tracking-widest mt-1 block">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-foreground text-background text-[10px] font-mono uppercase tracking-[0.3em] hover:opacity-80 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin" size={14} />
        ) : (
          <span>更新密码</span>
        )}
      </button>
    </form>
  );
}
