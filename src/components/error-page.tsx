import TechButton from "@/components/ui/tech-button";
import { AlertTriangle, RefreshCw, Skull, Terminal } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

export function ErrorPage({ error }: { error: Error }) {
  const router = useRouter();
  const onReset = () => {
    router.invalidate();
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full p-6 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-zzz-black radial-gradient(circle at center, #1a0500 0%, #000000 70%)"></div>
      <div className="absolute inset-0 bg-stripe-pattern opacity-5"></div>

      <div className="relative z-10 max-w-2xl w-full bg-zzz-dark border-2 border-zzz-orange shadow-[0_0_50px_rgba(255,102,0,0.2)] p-8 md:p-12 clip-corner-tr flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-zzz-orange/10 rounded-full flex items-center justify-center mb-6 border border-zzz-orange animate-pulse">
          <Skull size={40} className="text-zzz-orange" />
        </div>

        <h2 className="text-4xl md:text-5xl font-black font-sans text-white uppercase mb-2">
          System <span className="text-zzz-orange">Corruption</span>
        </h2>

        <div className="text-xs font-mono text-zzz-orange bg-zzz-orange/10 px-3 py-1 mb-8 tracking-widest uppercase border border-zzz-orange/20">
          Critical_Failure // Ether_Overload
        </div>

        <p className="text-gray-400 font-mono text-sm mb-8 leading-relaxed">
          An unrecoverable error has occurred in the Proxy Network. The
          application state has been compromised. Immediate reboot recommended.
        </p>

        {/* Stack Trace / Error Details */}
        {error && (
          <div className="w-full bg-black border border-zzz-gray p-4 mb-8 text-left overflow-hidden relative group">
            <div className="flex items-center gap-2 text-zzz-gray text-xs mb-2 font-bold uppercase border-b border-zzz-gray/30 pb-2">
              <Terminal size={12} /> Error_Log
            </div>
            <pre className="font-mono text-[10px] md:text-xs text-red-400 whitespace-pre-wrap wrap-break-word custom-scrollbar max-h-32 overflow-y-auto">
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
            </pre>
            {/* Decoration */}
            <div className="absolute top-0 right-0 p-2 text-zzz-orange opacity-20">
              <AlertTriangle size={16} />
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <TechButton
            onClick={onReset}
            variant="danger"
            icon={<RefreshCw size={16} />}
          >
            REBOOT SYSTEM
          </TechButton>
        </div>
      </div>
    </div>
  );
}
