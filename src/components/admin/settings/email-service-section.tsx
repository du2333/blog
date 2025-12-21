import {
  AlertCircle,
  AtSign,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Mail,
  Radio,
  ShieldCheck,
  User,
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
  const isLinked = status === "SUCCESS";

  const handleTest = async () => {
    if (!isConfigured) return;
    setStatus("TESTING");
    setLogs([]);
    const addLog = (msg: string, type: TerminalLog["type"] = "info") =>
      setLogs((prev) => [...prev, { msg: `> ${msg}`, type }]);

    addLog(`EMAIL_PROTOCOL: 初始化安全握手...`);
    await new Promise((r) => setTimeout(r, 500));
    addLog(`AUTHENTICATOR: 正在验证 Resend 令牌签名...`, "system");
    await new Promise((r) => setTimeout(r, 500));
    addLog(`SENDER_VERIFY: 验证发件人地址 ${value.senderAddress}...`, "info");

    try {
      const result = await testEmailConnection({
        data: {
          apiKey: value.apiKey!,
          senderAddress: value.senderAddress!,
          senderName: value.senderName,
        },
      });

      if (result.success) {
        await new Promise((r) => setTimeout(r, 300));
        addLog(`SMTP_HANDSHAKE: 测试邮件已发送至你的管理员邮箱`, "success");
        addLog(`SIGNAL: 建立稳定连接 [STATUS: 200_OK]`, "success");
        setStatus("SUCCESS");
      } else {
        addLog(`ERROR: ${result.error || "连接失败"}`, "error");
        setStatus("ERROR");
      }
    } catch (error) {
      addLog(
        `ERROR: ${error instanceof Error ? error.message : "未知错误"}`,
        "error"
      );
      setStatus("ERROR");
    }
  };

  return (
    <div className="bg-zzz-black border border-zzz-gray p-1 clip-corner-tr group">
      <div className="bg-zzz-dark/50 p-6 space-y-5">
        {/* Header - Symmetric with AI Section, Lights up only on SUCCESS */}
        <div className="flex items-center justify-between border-b border-zzz-gray/30 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`transition-all duration-700 ${
                isLinked ? "text-zzz-cyan" : "text-gray-600"
              }`}
            >
              <Mail size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h3
                className={`font-bold font-sans uppercase tracking-widest leading-none transition-colors duration-700 ${
                  isLinked ? "text-white" : "text-gray-500"
                }`}
              >
                邮件服务 (Relay_Tunnel)
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                    status === "SUCCESS"
                      ? "bg-zzz-cyan shadow-[0_0_8px_#00ccff] animate-pulse"
                      : status === "ERROR"
                      ? "bg-zzz-orange shadow-[0_0_8px_#ff6600]"
                      : "bg-gray-800"
                  }`}
                ></div>
                <span
                  className={`text-[9px] font-mono tracking-tighter uppercase leading-none transition-colors duration-500 ${
                    status === "SUCCESS"
                      ? "text-zzz-cyan"
                      : status === "ERROR"
                      ? "text-zzz-orange"
                      : "text-gray-600"
                  }`}
                >
                  {status === "TESTING"
                    ? "Linking..."
                    : status === "SUCCESS"
                    ? "Tunnel_Secured"
                    : status === "ERROR"
                    ? "Signal_Blocked"
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
                ? "border-zzz-cyan text-zzz-cyan"
                : "border-zzz-gray text-gray-700"
            }`}
          >
            RESEND
          </div>
        </div>

        <div className="space-y-5">
          {/* API Key Field */}
          <div className="space-y-1.5 group/input">
            <label className="text-[10px] font-mono text-gray-500 uppercase flex justify-between px-1">
              <span className="flex items-center gap-2">
                <ShieldCheck size={10} /> 验证令牌 (Auth_Token)
              </span>
              <span
                className={`text-[9px] tracking-tighter transition-colors ${
                  isConfigured ? "text-zzz-cyan" : "text-zzz-orange opacity-70"
                }`}
              >
                {isConfigured ? "RESEND_V1" : "REQUIRED_TOKEN"}
              </span>
            </label>
            <div className="relative">
              <Key
                className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                  isConfigured
                    ? "text-gray-600 group-focus-within/input:text-zzz-cyan"
                    : "text-zzz-orange/30"
                }`}
                size={16}
              />
              <input
                type={showKey ? "text" : "password"}
                value={value.apiKey || ""}
                placeholder="在此输入 Resend 令牌..."
                onChange={(e) => {
                  onChange({ ...value, apiKey: e.target.value });
                  setStatus("IDLE");
                }}
                className={`w-full bg-black border text-white font-mono text-xs pl-10 pr-10 py-3 focus:outline-none transition-all ${
                  isConfigured
                    ? "border-zzz-gray focus:border-zzz-cyan"
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

          <div className="grid grid-cols-1 gap-5">
            {/* Sender Name */}
            <div className="space-y-1.5 group/input">
              <label className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-2 px-1">
                <User size={10} /> 发件人显示名称
              </label>
              <input
                value={value.senderName || ""}
                onChange={(e) =>
                  onChange({ ...value, senderName: e.target.value })
                }
                className="w-full bg-black border border-zzz-gray text-white text-xs font-mono px-3 py-3 focus:border-zzz-cyan focus:outline-none transition-all hover:border-gray-500"
                placeholder="例如: Inter-Knot Archive"
              />
            </div>

            {/* Sender Email */}
            <div className="space-y-1.5 group/input">
              <label className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-2 px-1">
                <AtSign size={10} /> 传输信道 (Sender_Email)
              </label>
              <div className="relative">
                <AtSign
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-zzz-cyan transition-colors"
                  size={14}
                />
                <input
                  value={value.senderAddress || ""}
                  onChange={(e) =>
                    onChange({ ...value, senderAddress: e.target.value })
                  }
                  className="w-full bg-black border border-zzz-gray text-white text-xs font-mono pl-9 pr-3 py-3 focus:border-zzz-cyan focus:outline-none transition-all hover:border-gray-500"
                  placeholder="noreply@yourdomain.com"
                />
              </div>
            </div>
          </div>

          {/* Test Button */}
          <div className="flex justify-end">
            <button
              onClick={handleTest}
              disabled={status === "TESTING" || !isConfigured}
              className={`
                    h-[38px] px-6 border font-mono text-[10px] font-bold uppercase transition-all flex items-center gap-2 clip-corner-tr
                    ${
                      !isConfigured
                        ? "border-zzz-gray text-gray-700 cursor-not-allowed"
                        : status === "TESTING"
                        ? "text-zzz-cyan animate-pulse border-zzz-cyan"
                        : "border-zzz-gray text-gray-500 hover:border-white hover:text-white"
                    }
                `}
            >
              {status === "TESTING" ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Radio size={12} />
              )}
              测试信道握手
            </button>
          </div>
        </div>

        <TerminalMonitor logs={logs} status={status} />

        {!isConfigured && (
          <div className="mt-2 p-2 bg-zzz-orange/5 border border-zzz-orange/20 flex items-center gap-3 animate-in fade-in duration-500">
            <AlertCircle size={14} className="text-zzz-orange shrink-0" />
            <span className="text-[9px] font-mono text-zzz-orange/80 leading-none uppercase">
              信道令牌缺失。邮件转发服务不可用。
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
