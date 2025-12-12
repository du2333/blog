import TechButton from "@/components/ui/tech-button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, Mail, Radio } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulation
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      toast.success("RECOVERY BEACON ACTIVE", {
        description: "Check your comms channel for the reset key.",
      });
    }, 1500);
  };

  if (isSent) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-zzz-lime/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-zzz-lime animate-pulse">
          <Radio size={32} className="text-zzz-lime" />
        </div>
        <h3 className="text-xl font-bold font-sans uppercase text-white mb-2">
          Signal Sent
        </h3>
        <p className="text-xs font-mono text-gray-400 mb-8 leading-relaxed">
          We have transmitted a recovery key to{" "}
          <span className="text-zzz-cyan">{email}</span>. Please use the link to
          restore your HDD access.
        </p>
        <TechButton
          onClick={() => navigate({ to: "/sign-in" })}
          className="w-full justify-center"
        >
          RETURN TO LOGIN
        </TechButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-zzz-orange/5 border border-zzz-orange/30 text-zzz-orange text-[10px] font-mono leading-relaxed">
        NOTICE: Lost keys cannot be recovered from the Hollow. A reset link will
        be sent to your registered channel.
      </div>

      <div className="space-y-1 group">
        <label className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest group-focus-within:text-zzz-lime transition-colors">
          Registered Email
        </label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-zzz-lime transition-colors"
            size={18}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-zzz-gray text-white font-mono text-sm py-3 pl-10 pr-4 focus:border-zzz-lime focus:outline-none focus:bg-zzz-dark transition-all placeholder-gray-800"
            placeholder="name@example.com"
            required
          />
        </div>
      </div>

      <TechButton
        type="submit"
        disabled={isLoading}
        className="w-full h-12 text-sm justify-center"
        icon={
          isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Radio size={18} />
          )
        }
      >
        {isLoading ? "TRANSMITTING..." : "SEND RECOVERY SIGNAL"}
      </TechButton>

      <div className="text-center">
        <button
          type="button"
          onClick={() => navigate({ to: "/sign-in" })}
          className="text-[10px] font-mono font-bold text-gray-500 hover:text-white uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors group"
        >
          <ArrowRight
            size={12}
            className="rotate-180 group-hover:-translate-x-1 transition-transform"
          />{" "}
          Back to Login
        </button>
      </div>
    </form>
  );
}
