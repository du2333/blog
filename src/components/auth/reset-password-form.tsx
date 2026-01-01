import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth.client";

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

    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    if (error) {
      toast.error("重置失败", {
        description: "令牌可能已过期，请重新请求。",
      });
      return;
    }

    queryClient.removeQueries({ queryKey: ["session"] });

    toast.success("密码已更新", {
      description: "请使用新密码重新登录。",
    });
    navigate({ to: "/login" });
  };

  if (!token && !error) {
    return (
      <div className="text-center space-y-6">
        <p className="text-sm font-light text-red-500 italic">
          错误：缺少授权令牌
        </p>
        <Button
          onClick={() => navigate({ to: "/login" })}
          variant="outline"
          className="w-full h-14 text-[11px] uppercase tracking-[0.4em] font-medium"
        >
          返回登录
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-6">
        <p className="text-sm font-light text-red-500 italic">
          错误：无效的链接 ({error})
        </p>
        <Button
          onClick={() => navigate({ to: "/forgot-password" })}
          variant="outline"
          className="w-full h-14 text-[11px] uppercase tracking-[0.4em] font-medium"
        >
          重新请求链接
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <div className="space-y-2">
        <p className="text-sm font-light text-muted-foreground leading-relaxed italic border-l border-border pl-6">
          您的身份已验证。请在下方输入新密码以完成重置。
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2 group">
          <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-focus-within:text-foreground transition-colors pl-1">
            新密码
          </label>
          <Input
            type="password"
            {...register("password")}
            className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-lg font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all placeholder:text-muted-foreground shadow-none px-0"
            placeholder="••••••••"
          />
          {errors.password && (
            <span className="text-[9px] text-red-500 uppercase tracking-widest mt-1 block">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="space-y-2 group">
          <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-focus-within:text-foreground transition-colors pl-1">
            确认新密码
          </label>
          <Input
            type="password"
            {...register("confirmPassword")}
            className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-lg font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all placeholder:text-muted-foreground shadow-none px-0"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <span className="text-[9px] text-red-500 uppercase tracking-widest mt-1 block">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.4em] font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-3 rounded-sm"
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <>
            <span>更新密码</span>
            <Check size={14} />
          </>
        )}
      </Button>
    </form>
  );
}
