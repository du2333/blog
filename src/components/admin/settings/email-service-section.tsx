import {
  AtSign,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Mail,
  Radio,
  ShieldCheck,
  User,
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
          <div className={`p-2 rounded-full transition-all duration-700 ${status === "SUCCESS" ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900" : "bg-zinc-50 dark:bg-white/5 text-zinc-400"}`}>
            <Mail size={20} strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium tracking-tight">邮件转发服务</h3>
            <div className="flex items-center gap-2">
              <div className={`w-1 h-1 rounded-full ${
                status === "SUCCESS" ? "bg-green-500 animate-pulse" : 
                status === "ERROR" ? "bg-red-500" : "bg-zinc-300 dark:bg-zinc-700"
              }`} />
              <span className={`text-[9px] uppercase tracking-widest font-bold ${
                status === "SUCCESS" ? "text-green-500" : 
                status === "ERROR" ? "text-red-500" : "text-zinc-400"
              }`}>
                {status === "TESTING" ? "Syncing..." : status === "SUCCESS" ? "Secured" : status === "ERROR" ? "Blocked" : "Standby"}
              </span>
            </div>
          </div>
        </div>
        <div className="text-[10px] font-mono text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">
          Relay_Tunnel
        </div>
      </div>

      <div className="space-y-8">
        {/* API Key */}
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold flex items-center gap-2">
            <ShieldCheck size={12} strokeWidth={1.5} /> 验证令牌
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={value.apiKey || ""}
              placeholder="输入 Resend 访问令牌..."
              onChange={(e) => {
                onChange({ ...value, apiKey: e.target.value });
                setStatus("IDLE");
              }}
              className="w-full bg-zinc-50 dark:bg-white/[0.03] border-none text-zinc-900 dark:text-zinc-100 text-xs font-mono pl-4 pr-12 py-4 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 rounded-sm"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {showKey ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold flex items-center gap-2">
              <User size={12} strokeWidth={1.5} /> 发件人名称
            </label>
            <input
              value={value.senderName || ""}
              onChange={(e) => onChange({ ...value, senderName: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-white/[0.03] border-none text-zinc-900 dark:text-zinc-100 text-xs pl-4 pr-4 py-4 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 rounded-sm"
              placeholder="系统通知显示名称"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold flex items-center gap-2">
              <AtSign size={12} strokeWidth={1.5} /> 发件信箱
            </label>
            <input
              value={value.senderAddress || ""}
              onChange={(e) => onChange({ ...value, senderAddress: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-white/[0.03] border-none text-zinc-900 dark:text-zinc-100 text-xs font-mono pl-4 pr-4 py-4 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 rounded-sm"
              placeholder="noreply@domain.com"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleTest}
            disabled={status === "TESTING" || !isConfigured}
            className={`h-[52px] px-8 rounded-sm text-[10px] uppercase tracking-[0.2em] font-bold transition-all flex items-center gap-2 ${
              !isConfigured ? "bg-zinc-50 dark:bg-white/5 text-zinc-300 cursor-not-allowed" :
              status === "TESTING" ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 animate-pulse" :
              "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-900"
            }`}
          >
            {status === "TESTING" ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
            测试信道握手
          </button>
        </div>
      </div>

      <TerminalMonitor logs={logs} status={status} />
    </div>
  );
}
