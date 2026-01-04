import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
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

      <div className="space-y-px">
        {/* Property Row: API Key */}
        <div className="group flex flex-col sm:flex-row sm:items-center py-8 gap-4 sm:gap-0 border-b border-border/30">
          <div className="w-56 shrink-0 text-[10px] uppercase tracking-[0.3em] font-semibold text-muted-foreground">
            Resend 令牌
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
                className="w-full bg-transparent border-none shadow-none text-sm font-mono text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/30 pr-10 h-auto"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors h-8 w-8 rounded-sm"
              >
                {showKey ? (
                  <EyeOff size={18} strokeWidth={1.5} />
                ) : (
                  <Eye size={18} strokeWidth={1.5} />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Property Row: Sender Name */}
        <div className="group flex flex-col sm:flex-row sm:items-center py-8 gap-4 sm:gap-0 border-b border-border/30">
          <div className="w-56 shrink-0 text-[10px] uppercase tracking-[0.3em] font-semibold text-muted-foreground">
            发信人名称
          </div>
          <div className="flex-1">
            <Input
              value={value.senderName || ""}
              onChange={(e) =>
                onChange({ ...value, senderName: e.target.value })
              }
              className="w-full bg-transparent border-none shadow-none text-sm text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/30 px-0 h-auto"
              placeholder="e.g. System Administrator"
            />
          </div>
        </div>

        {/* Property Row: Sender Email */}
        <div className="group flex flex-col sm:flex-row sm:items-center py-8 gap-4 sm:gap-0 border-b border-border/30">
          <div className="w-56 shrink-0 text-[10px] uppercase tracking-[0.3em] font-semibold text-muted-foreground">
            发信邮箱
          </div>
          <div className="flex-1">
            <Input
              value={value.senderAddress || ""}
              onChange={(e) =>
                onChange({ ...value, senderAddress: e.target.value })
              }
              className="w-full bg-transparent border-none shadow-none text-sm font-mono text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/30 px-0 h-auto"
              placeholder="noreply@yourdomain.com"
            />
          </div>
        </div>

        {/* Property Row: Test Connection */}
        <div className="group flex flex-col sm:flex-row sm:items-center py-8 gap-4 sm:gap-0">
          <div className="w-48 shrink-0" />
          <div className="flex-1 flex items-center gap-6">
            <Button
              variant={status === "TESTING" ? "default" : "outline"}
              onClick={handleTest}
              disabled={status === "TESTING" || !isConfigured}
              className={`flex items-center gap-3 px-6 h-12 rounded-sm text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${
                !isConfigured
                  ? "bg-muted text-muted-foreground/50 cursor-not-allowed border-none"
                  : status === "TESTING"
                    ? "animate-pulse"
                    : "text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-transparent"
              }`}
            >
              {status === "TESTING" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Wifi size={14} />
              )}
              测试邮件推送
            </Button>
            {statusMsg && (
              <p
                className={`text-[10px] font-medium transition-all duration-500 animate-in fade-in slide-in-from-left-2 ${
                  status === "SUCCESS"
                    ? "text-green-600 dark:text-green-500"
                    : status === "ERROR"
                      ? "text-red-600 dark:text-red-500"
                      : "text-muted-foreground"
                }`}
              >
                {statusMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
