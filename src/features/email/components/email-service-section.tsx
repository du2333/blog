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
  const [statusMsg, setStatusMsg] = useState<string>("");

  const isConfigured = !!value.apiKey?.trim() && !!value.senderAddress?.trim();

  const handleTest = async () => {
    if (!isConfigured) return;
    setStatus("TESTING");
    setStatusMsg("正在尝试建立邮件服务握手...");

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
        setStatusMsg("测试邮件已成功进入队列，服务节点可用");
      } else {
        setStatus("ERROR");
        setStatusMsg(result.error || "服务配置错误，无法完成推送");
      }
    } catch {
      setStatus("ERROR");
      setStatusMsg("节点连接失败，请检查网络环境");
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
      <div className="bg-info/5 border border-info/20 rounded-sm p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-3 text-info">
          <Info size={18} />
          <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold">
            服务生效须知
          </h4>
        </div>
        <ul className="space-y-3 pl-7">
          {[
            "邮件服务是开启“邮箱注册验证”及“重置密码”功能的核心前置条件。",
            "未正确配置时，系统将仅允许通过 GitHub 等第三方 OAuth 渠道登录。",
            "Resend 免费版需在后台完成域名所有权验证 (DNS)，否则仅能向注册账户发送邮件。",
          ].map((text, i) => (
            <li
              key={i}
              className="text-[12px] text-muted-foreground/80 leading-relaxed font-serif italic relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-1.5 before:h-1.5 before:border before:border-info/40 before:rounded-full"
            >
              {text}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-24">
        {/* Group: Credentials */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 opacity-30">
            <Lock size={12} />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
              访问凭证
            </span>
          </div>
          <div className="space-y-px">
            <div className="group flex flex-col sm:flex-row sm:items-center py-6 gap-4 sm:gap-0 border-b border-border/30">
              <div className="w-56 shrink-0 text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 transition-colors group-focus-within:text-foreground">
                Resend API Key
              </div>
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
        </div>

        {/* Group: Sender Profile */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 opacity-30">
            <Globe size={12} />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
              发信身份
            </span>
          </div>
          <div className="space-y-px">
            {/* Property Row: Sender Name */}
            <div className="group flex flex-col sm:flex-row sm:items-center py-6 gap-4 sm:gap-0 border-b border-border/30">
              <div className="w-56 shrink-0 text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 transition-colors group-focus-within:text-foreground">
                发信人名称
              </div>
              <div className="flex-1">
                <Input
                  value={value.senderName || ""}
                  onChange={(e) =>
                    onChange({ ...value, senderName: e.target.value })
                  }
                  className="w-full bg-transparent border-none shadow-none text-sm text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/20 px-0 h-auto"
                  placeholder="如：John Doe的博客"
                />
              </div>
            </div>

            {/* Property Row: Sender Email */}
            <div className="group flex flex-col sm:flex-row sm:items-center py-6 gap-4 sm:gap-0 border-b border-border/30">
              <div className="w-56 shrink-0 text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 transition-colors group-focus-within:text-foreground">
                发信邮箱 (Verified Domain)
              </div>
              <div className="flex-1">
                <Input
                  value={value.senderAddress || ""}
                  onChange={(e) =>
                    onChange({ ...value, senderAddress: e.target.value })
                  }
                  className="w-full bg-transparent border-none shadow-none text-sm font-mono text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/20 px-0 h-auto"
                  placeholder="noreply@yourdomain.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Property Row: Test Connection */}
        <div className="flex items-center gap-8 py-10 bg-accent/30 rounded-sm px-8 border border-border/50">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-border/50 shadow-inner">
              <Mail
                size={20}
                className={
                  status === "SUCCESS"
                    ? "text-emerald-500"
                    : status === "ERROR"
                      ? "text-destructive"
                      : "text-muted-foreground/50"
                }
              />
            </div>
            <div>
              <h5 className="text-[12px] font-bold text-foreground">
                邮件服务测试
              </h5>
              <p className="text-[10px] text-muted-foreground font-serif italic">
                {statusMsg || "保存配置前建议先进行测试"}
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
  );
}
