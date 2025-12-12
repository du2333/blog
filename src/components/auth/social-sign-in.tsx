import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Github } from "lucide-react";
import { toast } from "sonner";

export function SocialSignIn() {
  const navigate = useNavigate();

  const handleGithubLogin = async () => {
    // Simulate Social Auth Process
    const toastId = toast.loading("CONNECTING TO GITHUB NODE...");

    setTimeout(async () => {
      // Use existing login mock to set user state
      toast.dismiss(toastId);
      toast.success("EXTERNAL SIGNAL VERIFIED", {
        description: "Access granted via GitHub Protocol.",
      });
      navigate({ to: "/admin", replace: true });
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="relative flex items-center py-2">
        <div className="grow border-t border-zzz-gray"></div>
        <span className="shrink-0 mx-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
          Or Access Via
        </span>
        <div className="grow border-t border-zzz-gray"></div>
      </div>

      <button
        type="button"
        onClick={handleGithubLogin}
        className="group relative w-full h-12 bg-black border border-zzz-gray hover:border-white transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden clip-corner-bl"
      >
        {/* Hover Fill Effect */}
        <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"></div>

        <Github
          size={18}
          className="relative z-10 text-white group-hover:text-black transition-colors"
        />
        <span className="relative z-10 font-mono text-xs font-bold uppercase tracking-wider text-white group-hover:text-black transition-colors">
          Github Protocol
        </span>
        <ArrowRight
          size={14}
          className="relative z-10 text-white group-hover:text-black opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300"
        />
      </button>
    </div>
  );
}
