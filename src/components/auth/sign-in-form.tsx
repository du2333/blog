import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Fingerprint } from "lucide-react";
import { Lock } from "lucide-react";
import TechButton from "@/components/ui/tech-button";
import { Loader2 } from "lucide-react";
import { Zap } from "lucide-react";
import { ShieldCheck } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export function SignInForm() {
  const navigate = useNavigate();

  const [proxyId, setProxyId] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<
    "IDLE" | "VERIFYING" | "SYNCING" | "SUCCESS"
  >("IDLE");
  const [error, setError] = useState("");

  const login = async (proxyId: string, accessKey: string) => {
    return proxyId === "admin" && accessKey === "admin";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proxyId || !accessKey) {
      setError("INPUT_MISSING: Credentials required");
      return;
    }

    setError("");
    setIsLoading(true);
    setLoginStep("VERIFYING");

    try {
      const success = await login(proxyId, accessKey);

      if (success) {
        setLoginStep("SYNCING");
        // Sequence animations for "Connection Established" feel
        setTimeout(() => {
          setLoginStep("SUCCESS");
          setTimeout(() => {
            navigate({ to: "/admin", replace: true });
            toast.success("NEURAL LINK ESTABLISHED", {
              description: "Welcome back, Phaethon.",
            });
          }, 800);
        }, 800);
      } else {
        setLoginStep("IDLE");
        setIsLoading(false);
        setError("ACCESS_DENIED: Invalid Proxy ID or Key");
        toast.error("CONNECTION REFUSED", {
          description: "Credentials rejected by host.",
        });
      }
    } catch (err) {
      setLoginStep("IDLE");
      setIsLoading(false);
      setError("SYSTEM_ERROR: Network unreachable");
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-zzz-orange/10 border border-zzz-orange p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={16} className="text-zzz-orange shrink-0 mt-0.5" />
          <div className="text-xs font-mono text-zzz-orange font-bold uppercase">
            {error}
          </div>
        </div>
      )}

      {/* Inputs */}
      <div className="space-y-4">
        <div className="space-y-1 group">
          <label className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest group-focus-within:text-zzz-lime transition-colors">
            Proxy ID
          </label>
          <div className="relative">
            <Fingerprint
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-zzz-lime transition-colors"
              size={18}
            />
            <input
              type="text"
              value={proxyId}
              onChange={(e) => setProxyId(e.target.value)}
              className="w-full bg-black border border-zzz-gray text-white font-mono text-sm py-3 pl-10 pr-4 focus:border-zzz-lime focus:outline-none focus:bg-zzz-dark transition-all placeholder-gray-800"
              placeholder="ENTER_ID"
              autoComplete="username"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-1 group">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest group-focus-within:text-zzz-cyan transition-colors">
              Access Key
            </label>
            <Link
              to="/forgot-password"
              tabIndex={-1}
              className="text-[9px] font-mono font-bold text-gray-600 hover:text-zzz-cyan uppercase tracking-wider transition-colors"
            >
              Lost Key?
            </Link>
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-zzz-cyan transition-colors"
              size={18}
            />
            <input
              type="password"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              className="w-full bg-black border border-zzz-gray text-white font-mono text-sm py-3 pl-10 pr-4 focus:border-zzz-cyan focus:outline-none focus:bg-zzz-dark transition-all placeholder-gray-800"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <TechButton
        type="submit"
        disabled={isLoading}
        className={`w-full h-12 text-sm justify-center ${
          loginStep === "SUCCESS"
            ? "bg-zzz-lime! text-black! border-zzz-lime!"
            : ""
        }`}
        icon={
          loginStep === "VERIFYING" ? (
            <Loader2 className="animate-spin" size={18} />
          ) : loginStep === "SYNCING" ? (
            <Zap className="animate-pulse" size={18} />
          ) : loginStep === "SUCCESS" ? (
            <ShieldCheck size={18} />
          ) : (
            <ChevronRight size={18} />
          )
        }
      >
        {loginStep === "IDLE" && "ESTABLISH CONNECTION"}
        {loginStep === "VERIFYING" && "VERIFYING CREDENTIALS..."}
        {loginStep === "SYNCING" && "SYNCING NEURAL CLOUD..."}
        {loginStep === "SUCCESS" && "ACCESS GRANTED"}
      </TechButton>
    </form>
  );
}
