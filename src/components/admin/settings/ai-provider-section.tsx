import {
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Wifi,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { GoogleModels, DeepSeekModels } from "@/lib/ai";
import { SystemConfig } from "@/features/config/config.schema";
import DropdownMenu from "@/components/ui/dropdown-menu";

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
  const [statusMsg, setStatusMsg] = useState<string>("");

  const provider = (value.activeProvider || "GOOGLE") as AiProvider;
  const currentProviderConfig = value.providers?.[provider];
  const isConfigured = !!currentProviderConfig?.apiKey?.trim();
  const currentConfig = PROVIDER_CONFIG[provider];

  const handleTest = async () => {
    if (!isConfigured) return;
    setStatus("TESTING");
    setStatusMsg("正在验证服务连通性...");

    try {
      const result = await testAiConnection({
        data: {
          provider,
          apiKey: currentProviderConfig.apiKey,
          model: currentProviderConfig.model,
        },
      });

      if (result.success) {
        setStatus("SUCCESS");
        setStatusMsg("服务连接正常，模型响应就绪");
      } else {
        setStatus("ERROR");
        setStatusMsg(result.error || "授权验证失败，请检查密钥");
      }
    } catch (error) {
      setStatus("ERROR");
      setStatusMsg("网络异常或服务暂时不可用");
    }
  };

  return (
    <div className="bg-white dark:bg-[#0c0c0c] p-10 sm:p-14 space-y-16 transition-all duration-500 rounded-sm border border-zinc-100 dark:border-white/5">
      {/* Header with Integrated Status */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 ${
              status === "SUCCESS" 
                ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                : "bg-zinc-50 dark:bg-white/[0.03] text-zinc-400"
            }`}>
              <Sparkles size={22} strokeWidth={1.2} className={status === "SUCCESS" ? "fill-current" : ""} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-medium text-zinc-950 dark:text-zinc-50">AI 智能助理</h3>
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
            {status === "TESTING" ? "Testing" : status === "SUCCESS" ? "Active" : "Failed"}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-12 max-w-2xl">
        {/* Provider Selector */}
        <div className="space-y-6">
          <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
            服务平台
          </label>
          <div className="flex flex-wrap gap-3">
            {(["GOOGLE", "DEEPSEEK"] as AiProvider[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  onChange({ ...value, activeProvider: p });
                  setStatus("IDLE");
                }}
                className={`px-10 py-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-all rounded-sm border ${
                  provider === p
                    ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-xl shadow-black/10"
                    : "border-zinc-100 dark:border-white/5 text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div className="space-y-6">
          <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
            API 授权密钥
          </label>
          <div className="relative group/input">
            <input
              type={showKey ? "text" : "password"}
              value={currentProviderConfig?.apiKey || ""}
              placeholder="在此输入您的密钥..."
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

        {/* Model & Test */}
        <div className="flex flex-col md:flex-row gap-10 md:items-end">
          <div className="flex-1 space-y-6 w-full">
            <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
              选择模型版本
            </label>
            <div className="pt-2 border-b border-zinc-100 dark:border-white/10 pb-4">
              <DropdownMenu
                value={currentProviderConfig?.model || currentConfig.models[0]}
                onChange={(val) => {
                  onChange({
                    ...value,
                    providers: {
                      ...value.providers,
                      [provider]: {
                        ...value.providers?.[provider],
                        model: val,
                      },
                    },
                  });
                }}
                options={currentConfig.models.map((m) => ({
                  label: m,
                  value: m,
                }))}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-4 w-full md:w-auto">
            <button
              onClick={handleTest}
              disabled={status === "TESTING" || !isConfigured}
              className={`h-[60px] px-12 rounded-sm text-[10px] uppercase tracking-[0.3em] font-bold transition-all flex items-center justify-center gap-3 w-full ${
                !isConfigured ? "bg-zinc-50 dark:bg-white/5 text-zinc-300 cursor-not-allowed" :
                status === "TESTING" ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 animate-pulse" :
                "border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-zinc-950"
              }`}
            >
              {status === "TESTING" ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />}
              验证连通性
            </button>
          </div>
        </div>

        {statusMsg && (
          <p className={`text-[11px] font-medium transition-all duration-500 animate-in fade-in slide-in-from-top-2 ${
            status === "SUCCESS" ? "text-green-600 dark:text-green-500" :
            status === "ERROR" ? "text-red-600 dark:text-red-500" :
            "text-zinc-400"
          }`}>
            {statusMsg}
          </p>
        )}
      </div>
    </div>
  );
}
