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
          apiKey: currentProviderConfig?.apiKey || "",
          model: currentProviderConfig?.model || "",
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
    <div className="space-y-12">
      {/* Section Header */}
      <div className="flex items-end justify-between border-b border-zinc-100 dark:border-white/5 pb-6">
        <h3 className="text-3xl font-serif font-medium text-zinc-950 dark:text-zinc-50">
          AI 智能
        </h3>
        {status !== "IDLE" && (
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest animate-in fade-in zoom-in-95 duration-500 ${
              status === "SUCCESS"
                ? "bg-green-500/5 border-green-500/20 text-green-600"
                : status === "ERROR"
                ? "bg-red-500/5 border-red-500/20 text-red-600"
                : "bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/10 text-zinc-400"
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
              ? "Testing"
              : status === "SUCCESS"
              ? "Active"
              : "Failed"}
          </div>
        )}
      </div>

      <div className="space-y-px">
        {/* Property Row: Provider */}
        <div className="group flex flex-col sm:flex-row sm:items-center py-6 gap-4 sm:gap-0 border-b border-zinc-50 dark:border-white/[0.02]">
          <div className="w-48 shrink-0 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">
            服务平台
          </div>
          <div className="flex-1 flex gap-2">
            {(["GOOGLE", "DEEPSEEK"] as AiProvider[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  onChange({ ...value, activeProvider: p });
                  setStatus("IDLE");
                }}
                className={`px-4 py-2 text-[10px] uppercase tracking-wider font-bold rounded-sm transition-all border ${
                  provider === p
                    ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-md"
                    : "border-zinc-100 dark:border-white/5 text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Property Row: API Key */}
        <div className="group flex flex-col sm:flex-row sm:items-center py-6 gap-4 sm:gap-0 border-b border-zinc-50 dark:border-white/[0.02]">
          <div className="w-48 shrink-0 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">
            授权密钥
          </div>
          <div className="flex-1 flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type={showKey ? "text" : "password"}
                value={currentProviderConfig?.apiKey || ""}
                placeholder="在此输入密钥..."
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
                className="w-full bg-transparent text-sm font-mono text-zinc-950 dark:text-zinc-50 focus:outline-none placeholder:text-zinc-200 dark:placeholder:text-zinc-800 pr-10"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
              >
                {showKey ? (
                  <EyeOff size={16} strokeWidth={1.5} />
                ) : (
                  <Eye size={16} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Property Row: Model */}
        <div className="group flex flex-col sm:flex-row sm:items-center py-6 gap-4 sm:gap-0 border-b border-zinc-50 dark:border-white/[0.02]">
          <div className="w-48 shrink-0 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">
            模型版本
          </div>
          <div className="flex-1">
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
              className="w-full sm:w-fit"
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
              验证服务连通性
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
