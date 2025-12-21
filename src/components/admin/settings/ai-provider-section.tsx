import {
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
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
    if (!isConfigured) return;
    setStatus("TESTING");
    setLogs([]);
    const addLog = (msg: string, type: TerminalLog["type"] = "info") =>
      setLogs((prev) => [...prev, { msg: `> ${msg}`, type }]);

    addLog(`正在连接至 ${currentConfig.name}...`);
    
    try {
      const result = await testAiConnection({
        data: {
          provider,
          apiKey: currentProviderConfig.apiKey,
          model: currentProviderConfig.model,
        },
      });

      if (result.success) {
        addLog(`连接成功`, "success");
        setStatus("SUCCESS");
      } else {
        addLog(`错误: ${result.error || "连接失败"}`, "error");
        setStatus("ERROR");
      }
    } catch (error) {
      addLog(`连接失败`, "error");
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
            <Sparkles size={20} strokeWidth={1.2} />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-medium text-zinc-950 dark:text-zinc-50">AI 智能助理</h3>
            <div className="flex items-center gap-2">
              <div className={`w-1 h-1 rounded-full ${
                status === "SUCCESS" ? "bg-green-500" : 
                status === "ERROR" ? "bg-red-500" : "bg-zinc-200 dark:bg-zinc-800"
              }`} />
              <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${
                status === "SUCCESS" ? "text-green-600 dark:text-green-500" : 
                status === "ERROR" ? "text-red-500" : "text-zinc-400"
              }`}>
                {status === "TESTING" ? "测试中" : status === "SUCCESS" ? "在线" : status === "ERROR" ? "连接失败" : "待机"}
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed font-light">
          利用大型语言模型为内容创作提供支持，涵盖自动摘要生成、内容校对及风格优化。
        </p>
      </div>

      {/* Provider Selector */}
      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
          服务供应商
        </label>
        <div className="flex gap-2 p-1 bg-zinc-50 dark:bg-white/[0.02] rounded-sm w-fit border border-zinc-100 dark:border-white/5">
          {(["GOOGLE", "DEEPSEEK"] as AiProvider[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                onChange({ ...value, activeProvider: p });
                setStatus("IDLE");
              }}
              className={`px-8 py-2.5 text-[10px] uppercase tracking-[0.1em] font-bold transition-all rounded-sm ${
                provider === p
                  ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-10 pt-4">
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
            API 令牌
          </label>
          <div className="relative group/input">
            <input
              type={showKey ? "text" : "password"}
              value={currentProviderConfig?.apiKey || ""}
              placeholder="在此处粘贴您的 API 令牌..."
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

        <div className="flex flex-col sm:flex-row gap-8 items-end">
          <div className="flex-1 space-y-4 w-full">
            <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
              选择模型
            </label>
            <div className="relative group/input">
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
                className="w-full bg-transparent border-b border-zinc-100 dark:border-white/10 text-zinc-950 dark:text-zinc-50 text-base font-light px-0 py-4 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-100 appearance-none cursor-pointer transition-all"
              >
                {currentConfig.models.map((m) => (
                  <option key={m} value={m} className="bg-white dark:bg-[#0c0c0c]">{m}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" />
            </div>
          </div>
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
            连接测试
          </button>
        </div>
      </div>

      <TerminalMonitor logs={logs} status={status} />
    </div>
  );
}
