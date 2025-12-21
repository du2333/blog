import { Terminal } from "lucide-react";
import { useEffect, useRef } from "react";

export interface TerminalLog {
  msg: string;
  type: "info" | "success" | "error" | "system";
}

interface TerminalMonitorProps {
  logs: TerminalLog[];
  status: "IDLE" | "TESTING" | "SUCCESS" | "ERROR";
}

export function TerminalMonitor({ logs, status }: TerminalMonitorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (status === "IDLE" && logs.length === 0) return null;

  return (
    <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 mb-1 px-2">
        <Terminal size={10} className="text-gray-600" />
        <span className="text-[9px] font-mono font-bold text-gray-600 uppercase tracking-widest">
          Handshake_Monitor
        </span>
      </div>
      <div
        ref={scrollRef}
        className="bg-black border border-zzz-gray p-3 font-mono text-[10px] h-28 overflow-y-auto custom-scrollbar relative"
      >
        <div className="absolute inset-0 bg-stripe-pattern opacity-5 pointer-events-none"></div>
        {logs.map((log, i) => (
          <div
            key={i}
            className={`
            mb-1 wrap-break-word
            ${log.type === "success" ? "text-zzz-lime" : ""}
            ${log.type === "error" ? "text-zzz-orange" : ""}
            ${log.type === "system" ? "text-zzz-cyan" : ""}
            ${log.type === "info" ? "text-gray-500" : ""}
          `}
          >
            {log.msg}
          </div>
        ))}
        {status === "TESTING" && (
          <div className="flex items-center gap-2 text-zzz-lime animate-pulse">
            <span>&gt;&gt;</span>
            <div className="w-1 h-3 bg-zzz-lime"></div>
          </div>
        )}
      </div>
    </div>
  );
}
