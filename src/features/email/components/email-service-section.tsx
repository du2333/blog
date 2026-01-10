import {
  AlertCircle,
  CheckCircle2,
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
import type { SystemConfig } from "@/features/config/config.schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ConnectionStatus = "IDLE" | "TESTING" | "SUCCESS" | "ERROR";

interface EmailSectionProps {
  value: NonNullable<SystemConfig["email"]>;
  onChange: (cfg: NonNullable<SystemConfig["email"]>) => void;
  testEmailConnection: (options: {
    data: {
      apiKey: string;
      senderAddress: string;
      senderName?: string;
    };
  }) => Promise<{ success: boolean; error?: string }>;
}

export function EmailServiceSection({
  value,
  onChange,
  testEmailConnection,
}: EmailSectionProps) {
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>("IDLE");

  const isConfigured = !!value.apiKey?.trim() && !!value.senderAddress?.trim();

  const handleTest = async () => {
    if (!isConfigured) return;
    setStatus("TESTING");

    try {
      const result = await testEmailConnection({
        data: {
          apiKey: value.apiKey!,
          senderAddress: value.senderAddress!,
          senderName: value.senderName,
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
      {/* Section Header */}
      <div className="flex items-end justify-between border-b border-border/50 pb-10">
        <div className="space-y-1.5">
          <h3 className="text-4xl font-serif font-medium tracking-tight text-foreground">
            邮件分发
          </h3>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-semibold opacity-80">
            Email Delivery & Notification Services
          </p>
        </div>
        {status !== "IDLE" && (
          <Badge
            variant={
              status === "SUCCESS"
                ? "default"
                : status === "ERROR"
                  ? "destructive"
                  : "secondary"
            }
            className={`flex items-center gap-2 px-4 py-1.5 rounded-sm border text-[9px] font-bold uppercase tracking-widest animate-in fade-in zoom-in-95 duration-500 h-auto ${
              status === "SUCCESS"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-none hover:bg-emerald-500/10"
                : status === "ERROR"
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-none hover:bg-rose-500/10"
                  : "bg-muted border-border text-muted-foreground shadow-none"
            }`}
          >
            {status === "TESTING" ? (
              <Loader2 size={10} className="animate-spin" />
            ) : status === "SUCCESS" ? (
              <CheckCircle2 size={10} />
            ) : (
              <AlertCircle size={10} />
            )}
            {status === "TESTING"
              ? "Syncing"
              : status === "SUCCESS"
                ? "Healthy"
                : "Service Interrupted"}
          </Badge>
        )}
      </div>

      {/* Service Notice Box */}
      <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded-lg p-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-3 mb-4 text-blue-600/80 dark:text-blue-400/80">
          <Info size={16} />
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium">
            服务生效须知
          </h4>
        </div>
        <ul className="space-y-3">
          {[
            "邮件服务是基于“邮箱注册验证”及“重置密码”功能的核心前置条件。",
            "未正确配置时，系统将仅允许通过 GitHub 等第三方 OAuth 渠道登录。",
            "Resend 免费版需在后台完成域签名或所有权验证 (DNS)，否则仅能向注册账户发送邮件。",
          ].map((text, i) => (
            <li key={i} className="flex gap-3 group">
              <span className="text-[8px] mt-1.5 text-blue-400 dark:text-blue-600">
                □
              </span>
              <p className="text-xs font-sans text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                {text}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-16">
        {/* Credentials Section */}
        <section className="space-y-10">
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
                    value={value.apiKey || ""}
                    placeholder="re_xxxxxxxxxxxxxx"
                    onChange={(e) => {
                      onChange({ ...value, apiKey: e.target.value });
                      setStatus("IDLE");
                    }}
                    className="w-full bg-transparent border-none shadow-none text-sm font-mono text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/20 pr-10 h-auto"
                  />
                  <Button
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
            </div>
          </div>
        </section>

        {/* Group: Sender Profile */}
        <section className="space-y-10 pt-6 border-t border-border/40">
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
                value={value.senderName || ""}
                onChange={(e) =>
                  onChange({ ...value, senderName: e.target.value })
                }
                placeholder="例如：Chronicle Blog"
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-sm font-sans focus-visible:ring-0 focus:border-foreground transition-all px-0"
              />
            </div>

            <div className="space-y-3 group">
              <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground group-focus-within:text-foreground transition-colors">
                发信邮箱 (Verified Domain)
              </label>
              <Input
                type="email"
                value={value.senderAddress || ""}
                onChange={(e) =>
                  onChange({ ...value, senderAddress: e.target.value })
                }
                placeholder="noreply@yourdomain.com"
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-sm font-sans focus-visible:ring-0 focus:border-foreground transition-all px-0"
              />
            </div>
          </div>
        </section>

        {/* Property Row: Test Connection */}
        <div className="pt-20 border-t border-border/40">
          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-border rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-all hover:shadow-lg">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm border border-border">
                <Mail size={24} className="text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <h6 className="text-sm font-medium text-foreground">
                  邮件服务测试
                </h6>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                  保存配置前建议先进行测试
                </p>
              </div>
            </div>
            <Button
              variant={status === "TESTING" ? "default" : "outline"}
              onClick={handleTest}
              disabled={status === "TESTING" || !isConfigured}
              className={`flex items-center gap-3 px-8 h-12 rounded-sm text-[10px] uppercase tracking-[0.2em] font-bold transition-all shadow-md active:shadow-none active:scale-[0.98] ${
                !isConfigured
                  ? "bg-muted/50 text-muted-foreground/30 cursor-not-allowed border-none shadow-none"
                  : status === "TESTING"
                    ? "animate-pulse"
                    : status === "SUCCESS"
                      ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white"
                      : "text-foreground bg-background hover:bg-primary hover:text-primary-foreground hover:border-transparent"
              }`}
            >
              {status === "TESTING" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Wifi size={14} />
              )}
              {status === "SUCCESS" ? "再测一次" : "发送测试邮件"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
