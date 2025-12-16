import { authClient } from "@/lib/auth/auth.client";
import { ArrowRight, Github, Loader2 } from "lucide-react";
import { useState } from "react";

export function SocialLogin({ redirectTo }: { redirectTo?: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);

    await authClient.signIn.social({
      provider: "github",
      errorCallbackURL: `${window.location.origin}/login`,
      callbackURL: redirectTo
        ? `${window.location.origin}${redirectTo}`
        : `${window.location.origin}/admin`,
    });
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
        disabled={isLoading}
        className="group relative w-full h-12 bg-black border border-zzz-gray hover:border-white transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden clip-corner-bl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Hover Fill Effect */}
        <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"></div>

        {isLoading ? (
          <Loader2
            size={18}
            className="relative z-10 text-zzz-lime animate-spin"
          />
        ) : (
          <Github
            size={18}
            className="relative z-10 text-white group-hover:text-black transition-colors"
          />
        )}

        <span className="relative z-10 font-mono text-xs font-bold uppercase tracking-wider text-white group-hover:text-black transition-colors">
          {isLoading ? "HANDSHAKE..." : "Github Protocol"}
        </span>

        {!isLoading && (
          <ArrowRight
            size={14}
            className="relative z-10 text-white group-hover:text-black opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300"
          />
        )}
      </button>
    </div>
  );
}
