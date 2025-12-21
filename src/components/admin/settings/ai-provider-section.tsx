import {
  ChevronDown,
  Cpu,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Share2,
  Shield,
  Sparkles,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { TerminalLog, TerminalMonitor } from "./terminal-monitor";
import { GoogleModels, DeepSeekModels } from "@/lib/ai";
import { SystemConfig } from "@/features/config/config.schema";

type AiProvider = "GOOGLE" | "DEEPSEEK";
type ConnectionStatus = "IDLE" | "TESTING" | "SUCCESS" | "ERROR";

const PROVIDER_CONFIG = {
  GOOGLE: {
    name: "Google Gemini",
    models: GoogleModels,
  },
  DEEPSEEK: {
    name: "DeepSeek AI",
    models: DeepSeekModels,
  },
};

interface AiSectionProps {
  value: NonNullable<SystemConfig["ai"]>;
  onChange: (cfg: NonNullable<SystemConfig["ai"]>) => void;
  testAiConnection: (params: {
    data: { provider: "GOOGLE" | "DEEPSEEK"; apiKey: string; model: string };
  }) => Promise<{ success: boolean; error?: string }>;
}

export function AiProviderSection({
  value,
  onChange,
  testAiConnection,
}: AiSectionProps) {
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>("IDLE");
  const [logs, setLogs] = useState<TerminalLog[]>([]);

  const provider = (value.activeProvider || "GOOGLE") as AiProvider;
  const currentProviderConfig = value.providers?.[provider];
  const isConfigured = !!currentProviderConfig?.apiKey?.trim();
  const currentConfig = PROVIDER_CONFIG[provider];

  const handleTest = async () => {
    if (
      !isConfigured ||
      !currentProviderConfig?.apiKey ||
      !currentProviderConfig?.model
    )
      return;
    setStatus("TESTING");
    setLogs([]);
    const addLog = (msg: string, type: TerminalLog["type"] = "info") =>
      setLogs((prev) => [...prev, { msg: `> ${msg}`, type }]);

    addLog(`正在连接至 ${currentConfig.name}...`);
    await new Promise((r) => setTimeout(r, 800));
    addLog(`正在解析 API 端点...`, "system");
    await new Promise((r) => setTimeout(r, 1000));

    try {
      const result = await testAiConnection({
        data: {
          provider,
          apiKey: currentProviderConfig.apiKey,
          model: currentProviderConfig.model,
        },
      });

      if (result.success) {
        addLog(`成功建立安全连接`, "success");
        setStatus("SUCCESS");
      } else {
        addLog(`错误: ${result.error || "连接失败"}`, "error");
        setStatus("ERROR");
      }
    } catch (error) {
      addLog(`错误: 远程主机拒绝连接 (403)`, "error");
      setStatus("ERROR");
    }
  };

  return (
    <div className="bg-white dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 p-8 space-y-10 rounded-sm transition-all duration-500 hover:border-zinc-200 dark:hover:border-white/10 group">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full transition-all duration-700 ${status === "SUCCESS" ? "bg-green-500/10 text-green-500" : "bg-zinc-50 dark:bg-white/5 text-zinc-400"}`}>
            <Sparkles size={20} strokeWidth={1.5} className={status === "SUCCESS" ? "fill-current" : ""} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium tracking-tight">AI 辅助协议</h3>
            <div className="flex items-center gap-2">
              <div className={`w-1 h-1 rounded-full ${
                status === "SUCCESS" ? "bg-green-500 animate-pulse" : 
                status === "ERROR" ? "bg-red-500" : "bg-zinc-300 dark:bg-zinc-700"
              }`} />
              <span className={`text-[9px] uppercase tracking-widest font-bold ${
                status === "SUCCESS" ? "text-green-500" : 
                status === "ERROR" ? "text-red-500" : "text-zinc-400"
              }`}>
                {status === "TESTING" ? "Testing..." : status === "SUCCESS" ? "Active" : status === "ERROR" ? "Failed" : "Standby"}
              </span>
            </div>
          </div>
        </div>
        <div className="text-[10px] font-mono text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">
          Neural_Link
        </div>
      </div>

      {/* Provider Selector */}
      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold flex items-center gap-2">
          <Share2 size={12} strokeWidth={1.5} /> 服务提供商
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-50 dark:bg-white/[0.03] rounded-sm">
          {(["GOOGLE", "DEEPSEEK"] as AiProvider[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                onChange({ ...value, activeProvider: p });
                setStatus("IDLE");
              }}
              className={`py-2 text-[10px] uppercase tracking-[0.1em] font-bold transition-all rounded-sm ${
                provider === p
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-8">
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold flex items-center gap-2">
            <Key size={12} strokeWidth={1.5} /> API 密钥
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={currentProviderConfig?.apiKey || ""}
              placeholder="输入协议密钥..."
              onChange={(e) => {
                onChange({
                  ...value,
                  providers: {
                    ...value.providers,
                    [provider]: {
                      ...value.providers?.[provider],
                      apiKey: e.target.value,
                    },
                  },
                });
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

        <div className="flex gap-4">
          <div className="flex-1 space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold flex items-center gap-2">
              <Cpu size={12} strokeWidth={1.5} /> 模型版本
            </label>
            <div className="relative">
              <select
                value={currentProviderConfig?.model || currentConfig.models[0]}
                onChange={(e) => {
                  onChange({
                    ...value,
                    providers: {
                      ...value.providers,
                      [provider]: {
                        ...value.providers?.[provider],
                        model: e.target.value,
                      },
                    },
                  });
                }}
                className="w-full bg-zinc-50 dark:bg-white/[0.03] border-none text-zinc-900 dark:text-zinc-100 text-xs font-mono pl-4 pr-10 py-4 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 rounded-sm appearance-none cursor-pointer"
              >
                {currentConfig.models.map((m) => (
                  <option key={m} value={m} className="bg-white dark:bg-[#0c0c0c]">{m}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleTest}
              disabled={status === "TESTING" || !isConfigured}
              className={`h-[52px] px-6 rounded-sm text-[10px] uppercase tracking-[0.2em] font-bold transition-all flex items-center gap-2 ${
                !isConfigured ? "bg-zinc-50 dark:bg-white/5 text-zinc-300 cursor-not-allowed" :
                status === "TESTING" ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 animate-pulse" :
                "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-900"
              }`}
            >
              {status === "TESTING" ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
              测试连接
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Monitor */}
      <TerminalMonitor logs={logs} status={status} />
    </div>
  );
}
