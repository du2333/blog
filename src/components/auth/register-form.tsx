import TechButton from "@/components/ui/tech-button";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  Key,
  Loader2,
  Lock,
  Mail,
  Shield,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);

  // Countdown timer logic
  useEffect(() => {
    if (codeCountdown > 0) {
      const timer = setTimeout(() => setCodeCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [codeCountdown]);

  const handleSendCode = () => {
    if (!formData.email) {
      toast.error("MISSING TARGET", {
        description: "Please enter an email address first.",
      });
      return;
    }
    toast.success("SIGNAL TRANSMITTED", {
      description: `Verification code sent to ${formData.email}`,
    });
    setCodeCountdown(60);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulation
    setTimeout(() => {
      setIsLoading(false);
      toast.success("PROXY ID CREATED", {
        description: "Registration complete. Redirecting to login...",
      });
      navigate({ to: "/sign-in" });
    }, 1500);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Username */}
      <div className="space-y-1 group">
        <label className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest group-focus-within:text-zzz-lime transition-colors">
          Codename
        </label>
        <div className="relative">
          <User
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-zzz-lime transition-colors"
            size={16}
          />
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="w-full bg-black border border-zzz-gray text-white font-mono text-xs py-3 pl-10 pr-4 focus:border-zzz-lime focus:outline-none focus:bg-zzz-dark transition-all placeholder-gray-800"
            placeholder="ENTER_PROXY_NAME"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1 group">
        <label className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest group-focus-within:text-zzz-cyan transition-colors">
          Comms Channel (Email)
        </label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-zzz-cyan transition-colors"
            size={16}
          />
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full bg-black border border-zzz-gray text-white font-mono text-xs py-3 pl-10 pr-4 focus:border-zzz-cyan focus:outline-none focus:bg-zzz-dark transition-all placeholder-gray-800"
            placeholder="name@example.com"
            required
          />
        </div>
      </div>

      {/* Verification Code */}
      <div className="space-y-1 group">
        <label className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest group-focus-within:text-zzz-orange transition-colors">
          Auth Token
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Key
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-zzz-orange transition-colors"
              size={16}
            />
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="w-full bg-black border border-zzz-gray text-white font-mono text-xs py-3 pl-10 pr-4 focus:border-zzz-orange focus:outline-none focus:bg-zzz-dark transition-all placeholder-gray-800"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>
          <button
            type="button"
            onClick={handleSendCode}
            disabled={codeCountdown > 0}
            className="px-3 min-w-[100px] border border-zzz-gray bg-zzz-dark text-[10px] font-bold font-mono text-zzz-cyan hover:border-zzz-cyan hover:bg-zzz-cyan/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
          >
            {codeCountdown > 0 ? `${codeCountdown}s` : "Get_Code"}
          </button>
        </div>
      </div>

      {/* Passwords */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1 group">
          <label className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest group-focus-within:text-white transition-colors">
            Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-white transition-colors"
              size={16}
            />
            <input
              type="password"
              className="w-full bg-black border border-zzz-gray text-white font-mono text-xs py-3 pl-10 pr-2 focus:border-white focus:outline-none transition-all placeholder-gray-800"
              placeholder="••••••"
              required
            />
          </div>
        </div>
        <div className="space-y-1 group">
          <label className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest group-focus-within:text-white transition-colors">
            Confirm
          </label>
          <div className="relative">
            <Shield
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-white transition-colors"
              size={16}
            />
            <input
              type="password"
              className="w-full bg-black border border-zzz-gray text-white font-mono text-xs py-3 pl-10 pr-2 focus:border-white focus:outline-none transition-all placeholder-gray-800"
              placeholder="••••••"
              required
            />
          </div>
        </div>
      </div>

      <TechButton
        type="submit"
        disabled={isLoading}
        className="w-full h-12 text-sm justify-center mt-4"
        icon={
          isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <ChevronRight size={18} />
          )
        }
      >
        {isLoading ? "REGISTERING..." : "INITIATE REGISTRATION"}
      </TechButton>
    </form>
  );
}
