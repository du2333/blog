import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Wifi,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { SystemConfig } from "@/features/config/config.schema";

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
    } catch (error) {
      setStatus("ERROR");
      setStatusMsg("节点连接失败，请检查网络环境");
    }
  };

  return (
    <div className="space-y-16">
      {/* Section Header */}
      <div className="flex items-end justify-between border-b border-zinc-100 dark:border-white/5 pb-10">
        <div className="space-y-1.5">
          <h3 className="text-4xl font-serif font-medium tracking-tight text-zinc-950 dark:text-zinc-50">
            邮件分发
          </h3>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-semibold opacity-80">
            Email Delivery & Notification Services
          </p>
        </div>
        {status !== "IDLE" && (
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest animate-in fade-in zoom-in-95 duration-500 ${
              status === "SUCCESS"
                ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/5 dark:border-emerald-500/20 dark:text-emerald-500"
                : status === "ERROR"
                ? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-500/5 dark:border-rose-500/20 dark:text-rose-500"
                : "bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/10 text-zinc-500"
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
          </div>
        )}
      </div>

      <div className="space-y-px">
        {/* Property Row: API Key */}
        <div className="group flex flex-col sm:flex-row sm:items-center py-8 gap-4 sm:gap-0 border-b border-zinc-100/60 dark:border-white/[0.02]">
          <div className="w-56 shrink-0 text-[10px] uppercase tracking-[0.3em] font-semibold text-zinc-500 dark:text-zinc-400">
            Resend 令牌
          </div>
          <div className="flex-1 flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type={showKey ? "text" : "password"}
                value={value.apiKey || ""}
                placeholder="re_xxxxxxxxxxxxxx"
                onChange={(e) => {
                  onChange({ ...value, apiKey: e.target.value });
                  setStatus("IDLE");
                }}
                className="w-full bg-transparent text-sm font-mono text-zinc-950 dark:text-zinc-50 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-800 pr-10"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
              >
                {showKey ? (
                  <EyeOff size={18} strokeWidth={1.5} />
                ) : (
                  <Eye size={18} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Property Row: Sender Name */}
        <div className="group flex flex-col sm:flex-row sm:items-center py-8 gap-4 sm:gap-0 border-b border-zinc-100/60 dark:border-white/[0.02]">
          <div className="w-56 shrink-0 text-[10px] uppercase tracking-[0.3em] font-semibold text-zinc-500 dark:text-zinc-400">
            发信人名称
          </div>
          <div className="flex-1">
            <input
              value={value.senderName || ""}
              onChange={(e) =>
                onChange({ ...value, senderName: e.target.value })
              }
              className="w-full bg-transparent text-sm text-zinc-950 dark:text-zinc-50 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-800"
              placeholder="e.g. System Administrator"
            />
          </div>
        </div>

        {/* Property Row: Sender Email */}
        <div className="group flex flex-col sm:flex-row sm:items-center py-8 gap-4 sm:gap-0 border-b border-zinc-100/60 dark:border-white/[0.02]">
          <div className="w-56 shrink-0 text-[10px] uppercase tracking-[0.3em] font-semibold text-zinc-500 dark:text-zinc-400">
            发信邮箱
          </div>
          <div className="flex-1">
            <input
              value={value.senderAddress || ""}
              onChange={(e) =>
                onChange({ ...value, senderAddress: e.target.value })
              }
              className="w-full bg-transparent text-sm font-mono text-zinc-950 dark:text-zinc-50 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-800"
              placeholder="noreply@yourdomain.com"
            />
          </div>
        </div>

        {/* Property Row: Test Connection */}
        <div className="group flex flex-col sm:flex-row sm:items-center py-8 gap-4 sm:gap-0">
          <div className="w-48 shrink-0" />
          <div className="flex-1 flex items-center gap-6">
            <button
              onClick={handleTest}
              disabled={status === "TESTING" || !isConfigured}
              className={`flex items-center gap-3 px-6 py-3 rounded-sm text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${
                !isConfigured
                  ? "bg-zinc-50 dark:bg-white/5 text-zinc-300 cursor-not-allowed"
                  : status === "TESTING"
                  ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 animate-pulse"
                  : "border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-zinc-950"
              }`}
            >
              {status === "TESTING" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Wifi size={14} />
              )}
              测试邮件推送
            </button>
            {statusMsg && (
              <p
                className={`text-[10px] font-medium transition-all duration-500 animate-in fade-in slide-in-from-left-2 ${
                  status === "SUCCESS"
                    ? "text-green-600 dark:text-green-500"
                    : status === "ERROR"
                    ? "text-red-600 dark:text-red-500"
                    : "text-zinc-400"
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
