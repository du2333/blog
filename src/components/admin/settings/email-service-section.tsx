import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { TerminalLog, TerminalMonitor } from "./terminal-monitor";
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
  const [logs, setLogs] = useState<TerminalLog[]>([]);

  const isConfigured = !!value.apiKey?.trim() && !!value.senderAddress?.trim();

  const handleTest = async () => {
    if (!isConfigured) return;
    setStatus("TESTING");
    setLogs([]);
    const addLog = (msg: string, type: TerminalLog["type"] = "info") =>
      setLogs((prev) => [...prev, { msg: `> ${msg}`, type }]);

    addLog(`正在初始化邮件协议握手...`);
    await new Promise((r) => setTimeout(r, 500));
    addLog(`正在验证 Resend 访问令牌...`, "system");
    await new Promise((r) => setTimeout(r, 500));
    addLog(`正在校验发件人地址: ${value.senderAddress}...`, "info");

    try {
      const result = await testEmailConnection({
        data: {
          apiKey: value.apiKey!,
          senderAddress: value.senderAddress!,
          senderName: value.senderName,
        },
      });

      if (result.success) {
        addLog(`测试邮件已发送至管理员邮箱`, "success");
        addLog(`成功建立稳定信道 (SMTP_OK)`, "success");
        setStatus("SUCCESS");
      } else {
        addLog(`错误: ${result.error || "连接失败"}`, "error");
        setStatus("ERROR");
      }
    } catch (error) {
      addLog(`错误: ${error instanceof Error ? error.message : "未知错误"}`, "error");
      setStatus("ERROR");
    }
  };

  return (
    <div className="bg-white dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 p-8 space-y-10 rounded-sm transition-all duration-500 hover:border-zinc-200 dark:hover:border-white/10 group">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-full transition-all duration-700 ${status === "SUCCESS" ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900" : "bg-zinc-50 dark:bg-white/5 text-zinc-400"}`}>
            <Mail size={20} strokeWidth={1} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-serif font-medium tracking-tight">邮件服务</h3>
            <div className="flex items-center gap-2">
              <div className={`w-1 h-1 rounded-full ${
                status === "SUCCESS" ? "bg-green-500 animate-pulse" : 
                status === "ERROR" ? "bg-red-500" : "bg-zinc-200 dark:bg-zinc-800"
              }`} />
              <span className={`text-[9px] uppercase tracking-widest font-bold ${
                status === "SUCCESS" ? "text-green-500" : 
                status === "ERROR" ? "text-red-500" : "text-zinc-400"
              }`}>
                {status === "TESTING" ? "同步中" : status === "SUCCESS" ? "连接成功" : status === "ERROR" ? "已屏蔽" : "待机"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 pt-4">
        {/* API Key */}
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">
            Resend API 令牌
          </label>
          <div className="relative group/input">
            <div className="absolute left-0 bottom-0 w-0 h-px bg-zinc-900 dark:bg-zinc-100 transition-all duration-500 group-focus-within/input:w-full" />
            <input
              type={showKey ? "text" : "password"}
              value={value.apiKey || ""}
              placeholder="输入 Resend 访问令牌..."
              onChange={(e) => {
                onChange({ ...value, apiKey: e.target.value });
                setStatus("IDLE");
              }}
              className="w-full bg-transparent border-b border-zinc-100 dark:border-white/10 text-zinc-900 dark:text-zinc-100 text-sm font-light px-0 py-4 focus:outline-none transition-all"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {showKey ? <EyeOff size={16} strokeWidth={1} /> : <Eye size={16} strokeWidth={1} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">
              发件人显示名称
            </label>
            <div className="relative group/input">
              <div className="absolute left-0 bottom-0 w-0 h-px bg-zinc-900 dark:bg-zinc-100 transition-all duration-500 group-focus-within/input:w-full" />
              <input
                value={value.senderName || ""}
                onChange={(e) => onChange({ ...value, senderName: e.target.value })}
                className="w-full bg-transparent border-b border-zinc-100 dark:border-white/10 text-zinc-900 dark:text-zinc-100 text-sm font-light px-0 py-4 focus:outline-none transition-all"
                placeholder="系统通知显示名称"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">
              发件邮箱地址
            </label>
            <div className="relative group/input">
              <div className="absolute left-0 bottom-0 w-0 h-px bg-zinc-900 dark:bg-zinc-100 transition-all duration-500 group-focus-within/input:w-full" />
              <input
                value={value.senderAddress || ""}
                onChange={(e) => onChange({ ...value, senderAddress: e.target.value })}
                className="w-full bg-transparent border-b border-zinc-100 dark:border-white/10 text-zinc-900 dark:text-zinc-100 text-sm font-light px-0 py-4 focus:outline-none transition-all font-mono"
                placeholder="noreply@domain.com"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleTest}
            disabled={status === "TESTING" || !isConfigured}
            className={`h-12 px-8 rounded-sm text-[10px] uppercase tracking-[0.3em] font-bold transition-all flex items-center justify-center gap-3 ${
              !isConfigured ? "bg-zinc-50 dark:bg-white/5 text-zinc-300 cursor-not-allowed" :
              status === "TESTING" ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 animate-pulse" :
              "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-900 shadow-sm"
            }`}
          >
            {status === "TESTING" ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
            发送测试邮件
          </button>
        </div>
      </div>

      <TerminalMonitor logs={logs} status={status} />
    </div>
  );
}
