import {
  Eye,
  EyeOff,
  Globe,
  Info,
  Loader2,
  Lock,
  Mail,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { SystemConfig } from "@/features/config/config.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ConnectionStatus = "IDLE" | "TESTING" | "SUCCESS" | "ERROR";

interface EmailSectionProps {
  testEmailConnection: (options: {
    data: {
      apiKey: string;
      senderAddress: string;
      senderName?: string;
    };
  }) => Promise<{ success: boolean; error?: string }>;
}

export function EmailServiceSection({
  testEmailConnection,
}: EmailSectionProps) {
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>("IDLE");

  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<SystemConfig>();

  const emailConfig = watch("email");
  // Check if configured: need apiKey and senderAddress
  const isConfigured =
    !!emailConfig?.apiKey?.trim() && !!emailConfig.senderAddress?.trim();

  const handleTest = async () => {
    if (!isConfigured) return;
    setStatus("TESTING");

    try {
      const result = await testEmailConnection({
        data: {
          apiKey: emailConfig?.apiKey || "",
          senderAddress: emailConfig?.senderAddress || "",
          senderName: emailConfig?.senderName,
        },
      });

      if (result.success) {
        setStatus("SUCCESS");
      } else {
        setStatus("ERROR");
      }
    } catch {
      setStatus("ERROR");
    }
  };

  return (
    <div className="space-y-16">
      {/* Service Notice Box - Redesigned */}
      <div className="p-4 mb-8 border border-border/30 bg-muted/5">
        <div className="flex gap-3">
          <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-foreground">
              配置说明
            </h4>
            <ul className="space-y-1 list-disc list-outside ml-3">
              <li className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                邮件服务是用户注册验证及密码重置的核心组件。
              </li>
              <li className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                若不配置，系统将仅支持 GitHub 等第三方 OAuth 登录。
              </li>
              <li className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                Resend 需完成域名验证 (DNS)，否则仅能发送至注册邮箱。
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {/* Credentials Section */}
        <section className="space-y-6">
          <header className="flex items-center gap-3">
            <Lock size={12} className="text-muted-foreground" />
            <h5 className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
              访问凭证
            </h5>
          </header>

          <div className="grid grid-cols-1 gap-10 pl-6">
            <div className="space-y-3 group max-w-2xl">
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground group-focus-within:text-foreground transition-colors">
                Resend API 密钥
              </label>
              <div className="flex-1 flex items-center gap-4">
                <div className="flex-1 relative">
                  <Input
                    type={showKey ? "text" : "password"}
                    {...register("email.apiKey", {
                      onChange: () => setStatus("IDLE"),
                    })}
                    placeholder="re_xxxxxxxxxxxxxx (留空则禁用)"
                    className="w-full bg-transparent border-none shadow-none text-sm font-mono text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/20 pr-10 h-auto"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-foreground transition-colors h-6 w-6 rounded-none"
                  >
                    {showKey ? (
                      <EyeOff size={16} strokeWidth={1.5} />
                    ) : (
                      <Eye size={16} strokeWidth={1.5} />
                    )}
                  </Button>
                </div>
              </div>
              {errors.email?.apiKey && (
                <p className="text-[10px] text-red-500">
                  {errors.email.apiKey.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Group: Sender Profile */}
        <section className="space-y-6 pt-6 border-t border-border/30">
          <header className="flex items-center gap-3">
            <Globe size={12} className="text-muted-foreground" />
            <h5 className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
              发信身份
            </h5>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pl-6">
            <div className="space-y-3 group">
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground group-focus-within:text-foreground transition-colors">
                显示名称
              </label>
              <Input
                {...register("email.senderName")}
                placeholder="例如：Chronicle Blog"
                className="w-full bg-transparent border-b border-border/50 rounded-none py-2 text-sm font-mono focus-visible:ring-0 focus:border-foreground transition-all px-0"
              />
              {errors.email?.senderName && (
                <p className="text-[10px] text-red-500">
                  {errors.email.senderName.message}
                </p>
              )}
            </div>

            <div className="space-y-3 group">
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground group-focus-within:text-foreground transition-colors">
                发信邮箱 (已验证)
              </label>
              <Input
                type="email"
                {...register("email.senderAddress")}
                placeholder="noreply@yourdomain.com"
                className="w-full bg-transparent border-b border-border/50 rounded-none py-2 text-sm font-mono focus-visible:ring-0 focus:border-foreground transition-all px-0"
              />
              {errors.email?.senderAddress && (
                <p className="text-[10px] text-red-500">
                  {errors.email.senderAddress.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Property Row: Test Connection */}
        <div className="pt-8 border-t border-border/30">
          <div className="border border-border/30 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-muted/10 flex items-center justify-center border border-border/30">
                <Mail size={14} className="text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <h6 className="text-xs font-serif font-medium text-foreground">
                  连通性测试
                </h6>
                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                  连通性测试
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant={status === "TESTING" ? "default" : "outline"}
              onClick={handleTest}
              disabled={status === "TESTING" || !isConfigured}
              className={`flex items-center gap-2 px-4 h-8 rounded-none text-[10px] font-mono uppercase tracking-widest transition-all ${
                !isConfigured
                  ? "bg-transparent text-muted-foreground/40 cursor-not-allowed border-border/30"
                  : status === "TESTING"
                    ? "opacity-80"
                    : status === "SUCCESS"
                      ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                      : "text-foreground bg-transparent hover:bg-muted/10 border-border/30"
              }`}
            >
              {status === "TESTING" ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <Wifi size={10} />
              )}
              {status === "SUCCESS" ? "[ 验证成功 ]" : "[ 发送测试 ]"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
