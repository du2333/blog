import TechButton from "@/components/ui/tech-button";
import { authClient } from "@/lib/auth/auth.client";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Lock, Shield, Terminal } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "KEY_TOO_WEAK (至少 8 位)"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "KEYS_DO_NOT_MATCH",
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
      token: token,
    });

    if (error) {
      toast.error("重置失败", {
        description: "令牌可能已过期。",
      });
      return;
    }

    queryClient.removeQueries({ queryKey: ["session"] });

    toast.success("新访问密钥已建立", {
      description: "重定向至登录...",
    });
    navigate({ to: "/login" });
  };

  if (!token && !error) {
    return (
      <div className="text-center p-4">
        <div className="text-zzz-orange font-mono text-xs uppercase mb-4">
          ERROR: 缺少授权令牌
        </div>
        <TechButton
          onClick={() => navigate({ to: "/login" })}
          className="w-full justify-center"
        >
          返回登录
        </TechButton>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-zzz-orange font-mono text-xs uppercase mb-4">
          ERROR: 无效链接 ({error})
        </div>
        <TechButton
          onClick={() => navigate({ to: "/forgot-password" })}
          className="w-full justify-center"
        >
          请求新链接
        </TechButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="p-4 bg-zzz-cyan/5 border border-zzz-cyan/30 text-zzz-cyan text-[10px] font-mono leading-relaxed mb-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1 font-bold">
          <Terminal size={12} /> SYSTEM_NOTICE
        </div>
        AUTHORIZATION: 重置令牌已验证
        <br />
        STATUS: 等待新密钥输入
        <div className="absolute top-0 right-0 w-8 h-8 bg-linear-to-bl from-zzz-cyan/20 to-transparent"></div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1 group">
          <label
            className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
              errors.password
                ? "text-zzz-orange"
                : "text-gray-500 group-focus-within:text-white"
            }`}
          >
            新访问密钥 (New Access Key)
          </label>
          <div className="relative">
            <Lock
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.password
                  ? "text-zzz-orange"
                  : "text-gray-600 group-focus-within:text-zzz-cyan"
              }`}
              size={16}
            />
            <input
              type="password"
              {...register("password")}
              className={`w-full bg-black border text-white font-mono text-xs py-3 pl-10 pr-2 focus:outline-none transition-all placeholder-gray-800 focus:bg-zzz-dark ${
                errors.password
                  ? "border-zzz-orange focus:border-zzz-orange"
                  : "border-zzz-gray focus:border-zzz-cyan"
              }`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <div className="text-[10px] text-zzz-orange font-mono uppercase pl-1">
              {errors.password.message}
            </div>
          )}
        </div>
        <div className="space-y-1 group">
          <label
            className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
              errors.confirmPassword
                ? "text-zzz-orange"
                : "text-gray-500 group-focus-within:text-white"
            }`}
          >
            确认密钥 (Confirm Key)
          </label>
          <div className="relative">
            <Shield
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.confirmPassword
                  ? "text-zzz-orange"
                  : "text-gray-600 group-focus-within:text-zzz-cyan"
              }`}
              size={16}
            />
            <input
              type="password"
              {...register("confirmPassword")}
              className={`w-full bg-black border text-white font-mono text-xs py-3 pl-10 pr-2 focus:outline-none transition-all placeholder-gray-800 focus:bg-zzz-dark ${
                errors.confirmPassword
                  ? "border-zzz-orange focus:border-zzz-orange"
                  : "border-zzz-gray focus:border-zzz-cyan"
              }`}
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && (
            <div className="text-[10px] text-zzz-orange font-mono uppercase pl-1">
              {errors.confirmPassword.message}
            </div>
          )}
        </div>
      </div>

      <TechButton
        type="submit"
        disabled={isSubmitting}
        variant="secondary"
        className="w-full h-12 text-sm justify-center border-zzz-cyan text-zzz-cyan hover:bg-zzz-cyan hover:text-black hover:border-zzz-cyan disabled:hover:bg-transparent disabled:hover:text-zzz-cyan"
        icon={
          isSubmitting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )
        }
      >
        {isSubmitting ? "REWRITING..." : "ESTABLISH NEW KEY"}
      </TechButton>
    </form>
  );
}
