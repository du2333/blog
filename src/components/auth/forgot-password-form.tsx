import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth.client";

const forgotPasswordSchema = z.object({
  email: z.string().email("无效的邮箱格式"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: standardSchemaResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: `${window.location.origin}/reset-link`,
    });

    if (error) {
      toast.error("重置邮件发送失败");
      return;
    }

    setSentEmail(data.email);
    setIsSent(true);
    toast.success("重置邮件已发送", {
      description: "请检查您的收件箱以获取重置链接。",
    });
  };

  if (isSent) {
    return (
      <div className="text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto border border-border">
            <Check size={24} />
          </div>
          <h3 className="text-2xl font-serif font-medium tracking-tight">
            查收您的邮件
          </h3>
          <p className="text-sm font-light text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
            重置密码链接已发送至{" "}
            <span className="font-medium">{sentEmail}</span>。
          </p>
        </div>
        <Button
          onClick={() => navigate({ to: "/login" })}
          variant="outline"
          className="w-full h-14 border border-border text-[11px] uppercase tracking-[0.4em] font-medium hover:bg-primary hover:text-primary-foreground transition-all"
        >
          返回登录
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <div className="space-y-2">
        <p className="text-sm font-light text-muted-foreground leading-relaxed italic border-l border-border pl-6">
          请输入您的注册邮箱，我们将向您发送重置密码的链接。
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2 group">
          <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-focus-within:text-foreground transition-colors pl-1">
            注册邮箱
          </label>
          <Input
            type="email"
            {...register("email")}
            className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-lg font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all placeholder:text-muted-foreground shadow-none px-0"
            placeholder="example@mail.com"
          />
          {errors.email && (
            <span className="text-[9px] text-red-500 uppercase tracking-widest mt-1 block">
              {errors.email.message}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.4em] font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-3 rounded-sm"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <span>发送重置链接</span>
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate({ to: "/login" })}
          className="w-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors h-auto p-0 bg-transparent hover:bg-transparent"
        >
          <ArrowLeft size={12} strokeWidth={1.5} />
          <span>返回登录</span>
        </Button>
      </div>
    </form>
  );
}
