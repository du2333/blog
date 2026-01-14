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
      <div className="rounded-md bg-muted/40 p-5 mb-12 flex gap-4 border border-border/40">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-foreground pb-1">配置说明</h4>
          <ul className="space-y-1.5 list-disc list-outside ml-3">
            <li className="text-[11px] text-muted-foreground leading-relaxed">
              邮件服务是用户注册验证及密码重置的核心组件。
            </li>
            <li className="text-[11px] text-muted-foreground leading-relaxed">
              若不配置，系统将仅支持 GitHub 等第三方 OAuth 登录。
            </li>
            <li className="text-[11px] text-muted-foreground leading-relaxed">
              Resend 免费版需完成域名验证 (DNS)，否则仅能发送至注册邮箱。
            </li>
          </ul>
        </div>
      </div>

      <div className="space-y-16">
        {/* Credentials Section */}
        <section className="space-y-8">
          <header className="flex items-center gap-3">
            <Lock size={14} className="text-muted-foreground" />
            <h5 className="text-[10px] uppercase tracking-[0.3em] font-medium text-foreground">
              访问凭证
            </h5>
          </header>

          <div className="grid grid-cols-1 gap-10 pl-6">
            <div className="space-y-3 group max-w-2xl">
              <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground group-focus-within:text-foreground transition-colors">
                Resend API Key
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
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-foreground transition-colors h-8 w-8 rounded-sm"
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
        <section className="space-y-8 pt-6 border-t border-border/40">
          <header className="flex items-center gap-3">
            <Globe size={14} className="text-muted-foreground" />
            <h5 className="text-[10px] uppercase tracking-[0.3em] font-medium text-foreground">
              发信身份
            </h5>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pl-6">
            <div className="space-y-3 group">
              <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground group-focus-within:text-foreground transition-colors">
                发信人名称
              </label>
              <Input
                {...register("email.senderName")}
                placeholder="例如：Chronicle Blog"
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-sm font-sans focus-visible:ring-0 focus:border-foreground transition-all px-0"
              />
              {errors.email?.senderName && (
                <p className="text-[10px] text-red-500">
                  {errors.email.senderName.message}
                </p>
              )}
            </div>

            <div className="space-y-3 group">
              <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground group-focus-within:text-foreground transition-colors">
                发信邮箱 (已验证域名)
              </label>
              <Input
                type="email"
                {...register("email.senderAddress")}
                placeholder="noreply@yourdomain.com"
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-sm font-sans focus-visible:ring-0 focus:border-foreground transition-all px-0"
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
        <div className="pt-16 border-t border-border/40">
          <div className="bg-muted/20 border border-border/60 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-sm transition-all">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-sm border border-border/60">
                <Mail size={18} className="text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h6 className="text-sm font-medium text-foreground">
                  连通性测试
                </h6>
                <p className="text-[10px] text-muted-foreground">
                  发送一封测试邮件以验证配置是否生效
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant={status === "TESTING" ? "default" : "outline"}
              onClick={handleTest}
              disabled={status === "TESTING" || !isConfigured}
              className={`flex items-center gap-3 px-6 h-9 rounded-sm text-[10px] uppercase tracking-[0.15em] font-bold transition-all ${
                !isConfigured
                  ? "bg-transparent text-muted-foreground/40 cursor-not-allowed border-border/40"
                  : status === "TESTING"
                    ? "opacity-80"
                    : status === "SUCCESS"
                      ? "border-emerald-500/30 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "text-foreground bg-transparent hover:bg-muted"
              }`}
            >
              {status === "TESTING" ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Wifi size={12} />
              )}
              {status === "SUCCESS" ? "验证成功" : "发送测试邮件"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
