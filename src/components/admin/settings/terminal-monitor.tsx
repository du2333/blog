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
    <div className="mt-6 animate-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Terminal size={10} strokeWidth={1.5} className="text-zinc-400" />
        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
          Sync_Monitor
        </span>
      </div>
      <div
        ref={scrollRef}
        className="bg-zinc-50 dark:bg-black/40 border border-zinc-100 dark:border-white/5 p-4 font-mono text-[10px] h-32 overflow-y-auto custom-scrollbar relative rounded-sm"
      >
        <div className="space-y-1">
          {logs.map((log, i) => (
            <div
              key={i}
              className={`
              wrap-break-word leading-relaxed
              ${log.type === "success" ? "text-green-500" : ""}
              ${log.type === "error" ? "text-red-500 font-bold" : ""}
              ${log.type === "system" ? "text-zinc-900 dark:text-zinc-100 opacity-60" : ""}
              ${log.type === "info" ? "text-zinc-400" : ""}
            `}
            >
              <span className="opacity-30 mr-2">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              {log.msg}
            </div>
          ))}
          {status === "TESTING" && (
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 animate-pulse mt-1 opacity-40">
              <span>_</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
