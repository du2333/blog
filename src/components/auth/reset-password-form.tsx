import TechButton from "@/components/ui/tech-button";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Lock, Shield, Terminal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("MISMATCH_ERROR", {
        description: "Security keys do not match.",
      });
      return;
    }

    setIsLoading(true);

    // Simulation
    setTimeout(() => {
      setIsLoading(false);
      toast.success("PROTOCOL OVERWRITTEN", {
        description: "New access key established. Redirecting to login...",
      });
      navigate({ to: "/sign-in" });
    }, 1500);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-zzz-cyan/5 border border-zzz-cyan/30 text-zzz-cyan text-[10px] font-mono leading-relaxed mb-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1 font-bold">
          <Terminal size={12} /> SYSTEM_NOTICE
        </div>
        AUTHORIZATION: RESET_TOKEN_VERIFIED
        <br />
        STATUS: AWAITING NEW KEY INPUT
        <div className="absolute top-0 right-0 w-8 h-8 bg-linear-to-bl from-zzz-cyan/20 to-transparent"></div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1 group">
          <label className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest group-focus-within:text-white transition-colors">
            New Access Key
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-zzz-cyan transition-colors"
              size={16}
            />
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full bg-black border border-zzz-gray text-white font-mono text-xs py-3 pl-10 pr-2 focus:border-zzz-cyan focus:outline-none transition-all placeholder-gray-800 focus:bg-zzz-dark"
              placeholder="••••••"
              required
            />
          </div>
        </div>
        <div className="space-y-1 group">
          <label className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest group-focus-within:text-white transition-colors">
            Confirm Key
          </label>
          <div className="relative">
            <Shield
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-zzz-cyan transition-colors"
              size={16}
            />
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full bg-black border border-zzz-gray text-white font-mono text-xs py-3 pl-10 pr-2 focus:border-zzz-cyan focus:outline-none transition-all placeholder-gray-800 focus:bg-zzz-dark"
              placeholder="••••••"
              required
            />
          </div>
        </div>
      </div>

      <TechButton
        type="submit"
        disabled={isLoading}
        variant="secondary"
        className="w-full h-12 text-sm justify-center border-zzz-cyan text-zzz-cyan hover:bg-zzz-cyan hover:text-black hover:border-zzz-cyan"
        icon={
          isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )
        }
      >
        {isLoading ? "REWRITING..." : "ESTABLISH NEW KEY"}
      </TechButton>
    </form>
  );
}
