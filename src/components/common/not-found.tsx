import { AlertOctagon, ArrowLeft, Radio } from "lucide-react";
import TechButton from "@/components/ui/tech-button";
import { useNavigate } from "@tanstack/react-router";

export function NotFound() {
  const navigate = useNavigate();
  const onReturn = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full relative overflow-hidden p-6 text-center">
      {/* Background Noise Effect */}
      <div className="absolute inset-0 bg-stripe-pattern opacity-10 pointer-events-none"></div>

      {/* Glitch Container */}
      <div className="relative mb-8 animate-[pulse_3s_infinite]">
        <div className="absolute inset-0 bg-zzz-orange blur-2xl opacity-20 animate-pulse"></div>
        <AlertOctagon size={120} className="text-zzz-gray relative z-10" />
        <Radio
          size={60}
          className="text-zzz-orange absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-spin-reverse"
        />
      </div>

      <h1 className="text-8xl md:text-9xl font-black font-sans text-transparent bg-clip-text bg-linear-to-b from-white to-gray-800 tracking-tighter mb-2 animate-glitch relative">
        404
        <span
          className="absolute top-0 left-0 -ml-1 text-zzz-orange opacity-50 animate-glitch"
          aria-hidden="true"
        >
          404
        </span>
        <span
          className="absolute top-0 left-0 ml-1 text-zzz-cyan opacity-50 animate-glitch"
          aria-hidden="true"
        >
          404
        </span>
      </h1>

      <div className="bg-zzz-black border border-zzz-orange/50 px-4 py-1 text-zzz-orange font-mono text-sm font-bold tracking-[0.2em] mb-8 uppercase animate-pulse">
        Signal_Lost // Coordinates_Unknown
      </div>

      <p className="max-w-md text-gray-400 font-mono mb-10 text-sm md:text-base leading-relaxed">
        The requested data sector could not be located. It may have been
        consumed by a Hollow or corrupted by high ether activity.
      </p>

      <TechButton
        onClick={onReturn}
        variant="primary"
        icon={<ArrowLeft size={16} />}
      >
        RETURN TO NEW ERIDU
      </TechButton>

      {/* Footer code */}
      <div className="absolute bottom-10 left-0 w-full text-center">
        <div className="text-[10px] font-mono text-zzz-gray uppercase tracking-widest">
          Error_Code: hollow_void_null_ref
        </div>
      </div>
    </div>
  );
}
