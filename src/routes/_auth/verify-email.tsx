import TechButton from "@/components/ui/tech-button";
import { cn } from "@/lib/utils";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Terminal,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

export const Route = createFileRoute("/_auth/verify-email")({
  validateSearch: z.object({
    error: z.string().optional(),
  }),
  beforeLoad: ({ context }) => {
    // If email verification is not required, redirect to login
    if (!context.isEmailVerficationRequired) {
      throw redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { error } = Route.useSearch();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"ANALYZING" | "SUCCESS" | "ERROR">(
    "ANALYZING"
  );
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const addLog = (msg: string) => setLog((prev) => [...prev, msg]);

    // Simulate the visual process of checking the "Incoming Signal"
    const analyzeSignal = async () => {
      addLog("> DETECTING INCOMING DATA STREAM...");
      await new Promise((r) => setTimeout(r, 600));

      addLog("> PARSING AUTHENTICATION HEADER...");
      await new Promise((r) => setTimeout(r, 800));

      if (error) {
        addLog(`> ERROR DETECTED: ${error.toUpperCase()}`);
        addLog("> SIGNAL CORRUPTED.");
        setStatus("ERROR");
      } else {
        addLog("> SIGNATURE MATCHED.");
        addLog("> PROXY ACCESS GRANTED.");
        setStatus("SUCCESS");
      }
    };

    analyzeSignal();
  }, [error]);

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black font-sans uppercase text-white italic tracking-tighter">
          Signal{" "}
          <span
            className={status === "ERROR" ? "text-zzz-orange" : "text-zzz-lime"}
          >
            Verification
          </span>
        </h1>
        <p className="text-xs font-mono text-gray-500 mt-2 tracking-[0.2em] uppercase">
          PROXY AUTHENTICATION PROTOCOL
        </p>
      </div>

      {/* Terminal Card */}
      <div
        className={`
            bg-zzz-black border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-0 relative clip-corner-tr overflow-hidden flex flex-col min-h-[300px]
            ${status === "ERROR" ? "border-zzz-orange" : "border-zzz-lime"}
        `}
      >
        {/* Status Visual */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 border-b border-zzz-gray/30 bg-zzz-dark/50 relative">
          {status === "ANALYZING" && (
            <div className="relative">
              <div className="absolute inset-0 bg-zzz-lime blur-xl opacity-20 animate-pulse"></div>
              <Loader2
                size={64}
                className="text-zzz-lime animate-spin relative z-10"
              />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <Terminal size={32} className="text-black animate-pulse" />
              </div>
            </div>
          )}

          {status === "SUCCESS" && (
            <div className="relative animate-in zoom-in-95 duration-300">
              <div className="absolute inset-0 bg-zzz-lime blur-2xl opacity-20"></div>
              <div className="w-20 h-20 bg-zzz-lime rounded-full flex items-center justify-center mb-4 mx-auto shadow-[0_0_30px_#ccff00]">
                <ShieldCheck size={40} className="text-black" />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-widest text-center">
                Identity Confirmed
              </h2>
              <div className="text-[10px] font-mono text-zzz-lime text-center mt-1">
                SESSION_ACTIVE
              </div>
            </div>
          )}

          {status === "ERROR" && (
            <div className="relative animate-in shake duration-300">
              <div className="absolute inset-0 bg-zzz-orange blur-2xl opacity-20"></div>
              <div className="w-20 h-20 bg-zzz-orange rounded-full flex items-center justify-center mb-4 mx-auto border-2 border-white/20">
                <AlertTriangle size={40} className="text-black" />
              </div>
              <h2 className="text-xl font-bold text-zzz-orange uppercase tracking-widest text-center">
                Link Failed
              </h2>
              <p className="text-[10px] font-mono text-gray-400 mt-2 text-center uppercase">
                {error === "invalid_token" ? "TOKEN_EXPIRED_OR_INVALID" : error}
              </p>
            </div>
          )}
        </div>

        {/* Terminal Log */}
        <div className="bg-black p-4 font-mono text-[10px] space-y-1 h-32 overflow-y-auto custom-scrollbar border-t border-zzz-gray/30">
          {log.map((line, i) => (
            <div
              key={i}
              className={cn(
                line.includes("ERROR") ? "text-zzz-orange" : "text-zzz-gray",
                line.includes("GRANTED") || line.includes("ACTIVE")
                  ? "text-zzz-lime"
                  : ""
              )}
            >
              {line}
            </div>
          ))}
          {status === "ANALYZING" && (
            <div className="text-zzz-lime animate-pulse">_</div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-zzz-dark border-t border-zzz-gray/30 flex justify-center">
          {status === "SUCCESS" ? (
            <TechButton
              onClick={() => navigate({ to: "/admin" })}
              className="w-full justify-center"
              icon={<ArrowRight size={16} />}
            >
              ENTER SYSTEM
            </TechButton>
          ) : status === "ERROR" ? (
            <div className="flex gap-2 w-full">
              <TechButton
                onClick={() => navigate({ to: "/login" })}
                variant="secondary"
                className="flex-1 justify-center"
              >
                RETURN
              </TechButton>
              <TechButton
                onClick={() => navigate({ to: "/login" })}
                variant="danger"
                className="flex-1 justify-center"
              >
                RESEND SIGNAL
              </TechButton>
            </div>
          ) : (
            <div className="text-[10px] text-gray-500 font-mono flex items-center gap-2">
              <Wifi size={12} className="animate-pulse" /> ESTABLISHING LINK...
            </div>
          )}
        </div>
      </div>
    </>
  );
}
