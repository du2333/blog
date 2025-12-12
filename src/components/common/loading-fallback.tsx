import { Disc, Zap } from "lucide-react";

export function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] flex-1 text-zzz-lime w-full h-full py-20">
      <div className="relative">
        <Disc size={64} className="animate-spin text-zzz-gray" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap size={24} className="fill-current animate-pulse text-zzz-lime" />
        </div>
        {/* Orbiting particle */}
        <div className="absolute inset-0 animate-spin-reverse">
          <div className="w-2 h-2 bg-zzz-cyan rounded-full absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2"></div>
        </div>
      </div>

      <div className="mt-8 font-mono font-bold tracking-widest text-sm animate-pulse text-white">
        ESTABLISHING_CONNECTION...
      </div>
      <div className="mt-2 text-[10px] font-mono text-gray-500">
        PROXY_NETWORK // ENCRYPTED
      </div>

      <style>{`
        @keyframes spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
        }
        .animate-spin-reverse {
            animation: spin-reverse 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
