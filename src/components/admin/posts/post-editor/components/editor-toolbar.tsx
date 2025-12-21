import {
  ArrowLeft,
  Check,
  Cpu,
  Loader2,
  RefreshCw,
  Settings,
  X,
} from "lucide-react";
import type { SaveStatus } from "../types";
import { PostStatus } from "@/lib/db/schema";

interface EditorToolbarProps {
  postId: number;
  status: PostStatus;
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  error: string | null;
  isSettingsOpen: boolean;
  onBack: () => void;
  onToggleSettings: () => void;
  handleProcessData: () => void;
  processState: "IDLE" | "PROCESSING" | "SUCCESS";
}

export function EditorToolbar({
  postId,
  status,
  saveStatus,
  lastSaved,
  error,
  isSettingsOpen,
  onBack,
  onToggleSettings,
  handleProcessData,
  processState,
}: EditorToolbarProps) {
  return (
    <div className="h-16 border-b border-zinc-100 dark:border-white/5 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl flex items-center justify-between px-6 z-40 shrink-0 transition-all">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <button
          onClick={onBack}
          className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors flex items-center gap-2 group"
        >
          <ArrowLeft size={18} strokeWidth={1.2} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold hidden md:inline">
            返回
          </span>
        </button>

        <div className="h-4 w-px bg-zinc-100 dark:bg-white/10" />

        <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-3">
          <span
            className={`font-bold ${
              status === "published" ? "text-green-500" : "text-amber-500"
            }`}
          >
            {status?.toUpperCase() || "DRAFT"}
          </span>
          <span className="opacity-20 font-sans">/</span>
          <span className="opacity-60">ID: {postId}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleProcessData}
            disabled={status !== "published" || processState !== "IDLE"}
            className={`
                flex items-center gap-2.5 px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold transition-all
                ${
                  processState === "SUCCESS"
                    ? "text-green-500"
                    : "text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 disabled:opacity-10"
                }
            `}
          >
            {processState === "PROCESSING" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : processState === "SUCCESS" ? (
              <Check size={14} strokeWidth={3} />
            ) : (
              <Cpu size={14} strokeWidth={1.2} />
            )}
            <span>
              {processState === "PROCESSING"
                ? "部署中"
                : processState === "SUCCESS"
                ? "已就绪"
                : "全域部署"}
            </span>
          </button>
        </div>

        <SaveIndicator
          saveStatus={saveStatus}
          lastSaved={lastSaved}
          error={error}
        />

        <div className="h-4 w-px bg-zinc-100 dark:bg-white/10 hidden sm:block" />

        <button
          onClick={onToggleSettings}
          className={`flex items-center gap-2 p-2 rounded-full transition-all duration-700 ${
            isSettingsOpen
              ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rotate-180"
              : "text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-white/5"
          }`}
          title="文章配置"
        >
          <Settings size={18} strokeWidth={1.2} />
        </button>
      </div>
    </div>
  );
}

function SaveIndicator({
  saveStatus,
  lastSaved,
  error,
}: {
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  error: string | null;
}) {
  return (
    <div className="flex items-center gap-3 text-[9px] font-mono tracking-widest uppercase">
      {saveStatus === "ERROR" ? (
        <>
          <X size={12} className="text-red-500" />
          <span className="text-red-500 hidden sm:inline">{error}</span>
        </>
      ) : saveStatus === "SAVING" ? (
        <>
          <RefreshCw size={12} className="text-zinc-400 animate-spin" strokeWidth={1.5} />
          <span className="text-zinc-400 hidden sm:inline">正在同步记录</span>
        </>
      ) : saveStatus === "PENDING" ? (
        <>
          <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-zinc-400 hidden sm:inline">等待保存</span>
        </>
      ) : (
        <>
          <div className="w-1 h-1 rounded-full bg-green-500" />
          <span className="text-zinc-400 hidden sm:inline">
            记录已同步{" "}
            {lastSaved && (
              <span className="opacity-30 ml-1">
                {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            )}
          </span>
        </>
      )}
    </div>
  );
}
