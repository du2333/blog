import {
  Activity,
  AlertCircle,
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
    endpoint: "generativelanguage.googleapis.com",
    models: GoogleModels,
    color: "text-zzz-lime",
    borderColor: "border-zzz-lime",
    bgColor: "bg-zzz-lime/5",
    dotColor: "bg-zzz-lime",
  },
  DEEPSEEK: {
    name: "DeepSeek AI",
    endpoint: "api.deepseek.com",
    models: DeepSeekModels,
    color: "text-zzz-cyan",
    borderColor: "border-zzz-cyan",
    bgColor: "bg-zzz-cyan/5",
    dotColor: "bg-zzz-cyan",
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
  const isLinked = status === "SUCCESS";

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

    addLog(`AI_PROTOCOL: 正在连接至 ${currentConfig.name}...`);
    await new Promise((r) => setTimeout(r, 800));
    addLog(`NETWORK: 解析端点 [${currentConfig.endpoint}]...`, "system");
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
        addLog(`SIGNAL: 建立稳定连接`, "success");
        setStatus("SUCCESS");
      } else {
        addLog(`ERROR: ${result.error || "连接失败"}`, "error");
        setStatus("ERROR");
      }
    } catch (error) {
      addLog(`ERROR: 连接被远程主机拒绝。403_FORBIDDEN`, "error");
      setStatus("ERROR");
    }
  };

  return (
    <div className="bg-zzz-black border border-zzz-gray p-1 clip-corner-tr group">
      <div className="bg-zzz-dark/50 p-6 space-y-5">
        {/* Header Section - Lights up only on SUCCESS */}
        <div className="flex items-center justify-between border-b border-zzz-gray/30 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`transition-all duration-700 ${
                isLinked ? currentConfig.color : "text-gray-600"
              }`}
            >
              <Sparkles
                size={20}
                className={isLinked ? "fill-current" : ""}
                strokeWidth={2.5}
              />
            </div>
            <div className="flex flex-col">
              <h3
                className={`font-bold font-sans uppercase tracking-widest leading-none transition-colors duration-700 ${
                  isLinked ? "text-white" : "text-gray-500"
                }`}
              >
                AI 协议 (Neural_Link)
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                    status === "SUCCESS"
                      ? `${currentConfig.dotColor} shadow-[0_0_8px_currentColor] animate-pulse`
                      : status === "ERROR"
                      ? "bg-zzz-orange shadow-[0_0_8px_#ff6600]"
                      : "bg-gray-800"
                  }`}
                ></div>
                <span
                  className={`text-[9px] font-mono tracking-tighter uppercase leading-none transition-colors duration-500 ${
                    status === "SUCCESS"
                      ? currentConfig.color
                      : status === "ERROR"
                      ? "text-zzz-orange"
                      : "text-gray-600"
                  }`}
                >
                  {status === "TESTING"
                    ? "Linking..."
                    : status === "SUCCESS"
                    ? "Signal_Established"
                    : status === "ERROR"
                    ? "Connection_Lost"
                    : isConfigured
                    ? "Standby"
                    : "Unlinked"}
                </span>
              </div>
            </div>
          </div>
          <div
            className={`px-2 py-0.5 text-[9px] font-mono border rounded-sm transition-all duration-500 ${
              isLinked
                ? `${currentConfig.borderColor} ${currentConfig.color}`
                : "border-zzz-gray text-gray-700"
            }`}
          >
            {provider}
          </div>
        </div>

        {/* Compact Provider Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-2 px-1">
            <Share2 size={10} /> 协议服务商 (Provider)
          </label>
          <div className="flex bg-black border border-zzz-gray p-1 gap-1">
            {(["GOOGLE", "DEEPSEEK"] as AiProvider[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  onChange({ ...value, activeProvider: p });
                  setStatus("IDLE");
                }}
                className={`
                    flex-1 py-2 text-[10px] font-bold uppercase transition-all relative flex items-center justify-center gap-2
                    ${
                      provider === p
                        ? `text-white ${PROVIDER_CONFIG[p].bgColor}`
                        : "text-gray-600 hover:text-gray-400"
                    }
                `}
              >
                {provider === p && (
                  <div
                    className={`w-1 h-3 ${PROVIDER_CONFIG[p].borderColor} bg-current`}
                  ></div>
                )}
                {p}
                {provider === p && (
                  <Activity
                    size={10}
                    className={`${PROVIDER_CONFIG[p].color} animate-pulse`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-gray-500 uppercase flex justify-between px-1">
              <span className="flex items-center gap-2">
                <Shield size={10} /> 访问密钥 (API_KEY)
              </span>
              <span
                className={`text-[9px] tracking-tighter transition-colors ${
                  isConfigured ? "text-zzz-lime" : "text-zzz-orange opacity-70"
                }`}
              >
                {isConfigured ? "ENCRYPTED" : "REQUIRED_SIGNAL"}
              </span>
            </label>
            <div className="relative group/input">
              <Key
                className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                  isConfigured
                    ? "text-gray-600 group-focus-within/input:text-white"
                    : "text-zzz-orange/30"
                }`}
                size={16}
              />
              <input
                type={showKey ? "text" : "password"}
                value={currentProviderConfig?.apiKey || ""}
                placeholder="在此输入协议密钥..."
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
                className={`w-full bg-black border text-white font-mono text-xs pl-10 pr-10 py-3 focus:outline-none transition-all ${
                  isConfigured
                    ? "border-zzz-gray focus:border-white"
                    : "border-zzz-orange/20 focus:border-zzz-orange/50"
                }`}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-2 px-1">
                <Cpu size={10} /> 指定模型 (Model_ID)
              </label>
              <div className="relative">
                <select
                  value={
                    currentProviderConfig?.model || currentConfig.models[0]
                  }
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
                  className="w-full bg-black border border-zzz-gray text-white text-xs font-mono pl-3 pr-8 py-2.5 focus:outline-none appearance-none cursor-pointer hover:border-gray-500 transition-colors"
                >
                  {currentConfig.models.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleTest}
                disabled={status === "TESTING" || !isConfigured}
                className={`
                    h-[38px] px-6 border font-mono text-[10px] font-bold uppercase transition-all flex items-center gap-2 clip-corner-tr
                    ${
                      !isConfigured
                        ? "border-zzz-gray text-gray-700 cursor-not-allowed"
                        : status === "TESTING"
                        ? `${currentConfig.color} ${currentConfig.borderColor} animate-pulse`
                        : "border-zzz-gray text-gray-500 hover:border-white hover:text-white"
                    }
                `}
              >
                {status === "TESTING" ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Wifi size={12} />
                )}
                测试握手
              </button>
            </div>
          </div>
        </div>

        {/* Terminal Monitor */}
        <TerminalMonitor logs={logs} status={status} />

        {!isConfigured && (
          <div className="mt-2 p-2 bg-zzz-orange/5 border border-zzz-orange/20 flex items-center gap-3 animate-in fade-in duration-500">
            <AlertCircle size={14} className="text-zzz-orange shrink-0" />
            <span className="text-[9px] font-mono text-zzz-orange/80 leading-none uppercase">
              未检测到有效密钥。AI 驱动处于离线状态。
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
