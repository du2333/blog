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

    addLog(`正在连接至邮件推送节点...`);

    try {
      const result = await testEmailConnection({
        data: {
          apiKey: value.apiKey!,
          senderAddress: value.senderAddress!,
          senderName: value.senderName,
        },
      });

      if (result.success) {
        addLog(`握手成功，测试邮件已进入队列`, "success");
        setStatus("SUCCESS");
      } else {
        addLog(`连接受阻: ${result.error || "未知原因"}`, "error");
        setStatus("ERROR");
      }
    } catch (error) {
      addLog(`节点无响应`, "error");
      setStatus("ERROR");
    }
  };

  return (
    <div className="bg-white dark:bg-[#080808] border border-zinc-100 dark:border-white/5 p-8 sm:p-12 space-y-12 transition-all duration-500 rounded-sm">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-700 ${
            status === "SUCCESS" 
              ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-transparent" 
              : "border-zinc-100 dark:border-white/10 text-zinc-400"
          }`}>
            <Mail size={20} strokeWidth={1.2} />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-medium text-zinc-950 dark:text-zinc-50">邮件服务</h3>
            <div className="flex items-center gap-2">
              <div className={`w-1 h-1 rounded-full ${
                status === "SUCCESS" ? "bg-green-500" : 
                status === "ERROR" ? "bg-red-500" : "bg-zinc-200 dark:bg-zinc-800"
              }`} />
              <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${
                status === "SUCCESS" ? "text-green-600 dark:text-green-500" : 
                status === "ERROR" ? "text-red-500" : "text-zinc-400"
              }`}>
                {status === "TESTING" ? "连接中" : status === "SUCCESS" ? "可用" : status === "ERROR" ? "不可用" : "待命"}
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed font-light">
          配置基于 Resend 的邮件发送接口，用于处理系统级别的消息推送、评论回复通知以及账号安全验证。
        </p>
      </div>

      <div className="space-y-10 pt-4">
        {/* API Key */}
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
            Resend API 令牌
          </label>
          <div className="relative group/input">
            <input
              type={showKey ? "text" : "password"}
              value={value.apiKey || ""}
              placeholder="在此处输入访问令牌..."
              onChange={(e) => {
                onChange({ ...value, apiKey: e.target.value });
                setStatus("IDLE");
              }}
              className="w-full bg-transparent border-b border-zinc-100 dark:border-white/10 text-zinc-950 dark:text-zinc-50 text-base font-light px-0 py-4 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-100 transition-all placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
            >
              {showKey ? <EyeOff size={18} strokeWidth={1} /> : <Eye size={18} strokeWidth={1} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
              发信显示名称
            </label>
            <div className="relative group/input">
              <input
                value={value.senderName || ""}
                onChange={(e) => onChange({ ...value, senderName: e.target.value })}
                className="w-full bg-transparent border-b border-zinc-100 dark:border-white/10 text-zinc-950 dark:text-zinc-50 text-base font-light px-0 py-4 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-100 transition-all"
                placeholder="例如：系统通知"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
              发信地址 (Email)
            </label>
            <div className="relative group/input">
              <input
                value={value.senderAddress || ""}
                onChange={(e) => onChange({ ...value, senderAddress: e.target.value })}
                className="w-full bg-transparent border-b border-zinc-100 dark:border-white/10 text-zinc-950 dark:text-zinc-50 text-base font-light px-0 py-4 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-100 transition-all font-mono"
                placeholder="noreply@domain.com"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleTest}
            disabled={status === "TESTING" || !isConfigured}
            className={`h-14 px-10 rounded-sm text-[10px] uppercase tracking-[0.3em] font-bold transition-all flex items-center justify-center gap-3 w-full sm:w-auto ${
              !isConfigured ? "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-300 cursor-not-allowed" :
              status === "TESTING" ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 animate-pulse" :
              "border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-zinc-950"
            }`}
          >
            {status === "TESTING" ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />}
            发信测试
          </button>
        </div>
      </div>

      <TerminalMonitor logs={logs} status={status} />
    </div>
  );
}
