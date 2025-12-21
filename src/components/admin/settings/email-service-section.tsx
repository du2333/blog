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
    <div className="bg-white dark:bg-[#0c0c0c] p-10 sm:p-14 space-y-16 transition-all duration-500 rounded-sm border border-zinc-100 dark:border-white/5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 ${
              status === "SUCCESS" 
                ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-lg" 
                : "bg-zinc-50 dark:bg-white/[0.03] text-zinc-400"
            }`}>
              <Mail size={22} strokeWidth={1.2} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-medium text-zinc-950 dark:text-zinc-50">邮件分发</h3>
            </div>
          </div>
        </div>

        {status !== "IDLE" && (
          <div className={`flex items-center gap-3 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-right-4 duration-500 ${
            status === "SUCCESS" ? "bg-green-500/5 border-green-500/20 text-green-600" :
            status === "ERROR" ? "bg-red-500/5 border-red-500/20 text-red-600" :
            "bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/10 text-zinc-400"
          }`}>
            {status === "TESTING" ? <Loader2 size={12} className="animate-spin" /> : 
             status === "SUCCESS" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            {status === "TESTING" ? "Syncing" : status === "SUCCESS" ? "Stable" : "Blocked"}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-12 max-w-2xl">
        {/* API Key */}
        <div className="space-y-6">
          <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
            Resend 授权令牌
          </label>
          <div className="relative group/input">
            <input
              type={showKey ? "text" : "password"}
              value={value.apiKey || ""}
              placeholder="输入推送令牌..."
              onChange={(e) => {
                onChange({ ...value, apiKey: e.target.value });
                setStatus("IDLE");
              }}
              className="w-full bg-transparent border-b border-zinc-100 dark:border-white/10 text-zinc-950 dark:text-zinc-50 text-base font-light px-0 py-5 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-100 transition-all placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
            >
              {showKey ? <EyeOff size={20} strokeWidth={1} /> : <Eye size={20} strokeWidth={1} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          <div className="space-y-6">
            <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
              发信显示名称
            </label>
            <div className="relative group/input">
              <input
                value={value.senderName || ""}
                onChange={(e) => onChange({ ...value, senderName: e.target.value })}
                className="w-full bg-transparent border-b border-zinc-100 dark:border-white/10 text-zinc-950 dark:text-zinc-50 text-base font-light px-0 py-5 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-100 transition-all"
                placeholder="例如：系统管理员"
              />
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
              发信信箱
            </label>
            <div className="relative group/input">
              <input
                value={value.senderAddress || ""}
                onChange={(e) => onChange({ ...value, senderAddress: e.target.value })}
                className="w-full bg-transparent border-b border-zinc-100 dark:border-white/10 text-zinc-950 dark:text-zinc-50 text-base font-light px-0 py-5 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-100 transition-all font-mono"
                placeholder="noreply@domain.com"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 items-center justify-between pt-4">
          <p className={`text-[11px] font-medium transition-all duration-500 flex-1 ${
            status === "SUCCESS" ? "text-green-600 dark:text-green-500" :
            status === "ERROR" ? "text-red-600 dark:text-red-500" :
            "text-zinc-400"
          }`}>
            {statusMsg}
          </p>
          
          <button
            onClick={handleTest}
            disabled={status === "TESTING" || !isConfigured}
            className={`h-[60px] px-12 rounded-sm text-[10px] uppercase tracking-[0.3em] font-bold transition-all flex items-center justify-center gap-3 w-full sm:w-auto shrink-0 ${
              !isConfigured ? "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-300 cursor-not-allowed" :
              status === "TESTING" ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 animate-pulse" :
              "border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-zinc-950"
            }`}
          >
            {status === "TESTING" ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />}
            测试邮件推送
          </button>
        </div>
      </div>
    </div>
  );
}
