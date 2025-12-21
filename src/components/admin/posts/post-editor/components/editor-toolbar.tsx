import {
  ArrowLeft,
  Check,
  Cpu,
  Loader2,
  RefreshCw,
  Settings,
  X,
  Eye,
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
  onViewPublic: () => void;
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
  onViewPublic,
}: EditorToolbarProps) {
  return (
    <div className="h-20 border-b border-zinc-100 dark:border-white/5 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl flex items-center justify-between px-8 z-40 shrink-0 transition-all sticky top-0">
      {/* Left Section */}
      <div className="flex items-center gap-8">
        <button
          onClick={onBack}
          className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors flex items-center gap-3 group"
        >
          <ArrowLeft size={20} strokeWidth={1.2} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold hidden md:inline">
            Back
          </span>
        </button>

        <div className="h-6 w-px bg-zinc-100 dark:bg-white/10" />

        <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${
              status === "published" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-amber-500"
            }`} />
            <span className="font-bold text-zinc-950 dark:text-zinc-100">
              {status?.toUpperCase() || "DRAFT"}
            </span>
          </div>
          <span className="opacity-20 font-sans">/</span>
          <span className="opacity-40">Entry #{postId}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4 border-r border-zinc-100 dark:border-white/10 pr-8 mr-2 hidden sm:flex">
          <SaveIndicator
            saveStatus={saveStatus}
            lastSaved={lastSaved}
            error={error}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onViewPublic}
            disabled={status !== "published"}
            className="p-2.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors disabled:opacity-10"
            title="预览公开页面"
          >
            <Eye size={20} strokeWidth={1.2} />
          </button>

          <button
            onClick={handleProcessData}
            disabled={status !== "published" || processState !== "IDLE"}
            className={`
                flex items-center gap-2.5 px-6 py-2.5 text-[10px] uppercase tracking-[0.3em] font-bold transition-all border border-transparent rounded-sm
                ${
                  processState === "SUCCESS"
                    ? "text-green-500 bg-green-500/5"
                    : "text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-white/5 disabled:opacity-10"
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
            <span className="hidden md:inline">
              {processState === "PROCESSING"
                ? "Deploying"
                : processState === "SUCCESS"
                ? "Ready"
                : "Deploy"}
            </span>
          </button>

          <button
            onClick={onToggleSettings}
            className={`flex items-center gap-3 px-6 py-2.5 rounded-sm transition-all duration-500 border ${
              isSettingsOpen
                ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-xl"
                : "text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 border-zinc-100 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20"
            }`}
          >
            <Settings size={18} strokeWidth={1.2} className={isSettingsOpen ? "rotate-90 transition-transform duration-700" : ""} />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Settings</span>
          </button>
        </div>
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
    <div className="flex items-center gap-4 text-[9px] font-mono tracking-widest uppercase">
      {saveStatus === "ERROR" ? (
        <>
          <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-500">{error || "Save Failed"}</span>
        </>
      ) : saveStatus === "SAVING" ? (
        <>
          <Loader2 size={12} className="text-zinc-400 animate-spin" strokeWidth={1.5} />
          <span className="text-zinc-400">Syncing...</span>
        </>
      ) : saveStatus === "PENDING" ? (
        <>
          <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-zinc-400">Modified</span>
        </>
      ) : (
        <>
          <div className="w-1 h-1 rounded-full bg-green-500" />
          <span className="text-zinc-400 font-medium">
            Saved 
            {lastSaved && (
              <span className="opacity-30 ml-2 font-light">
                {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            )}
          </span>
        </>
      )}
    </div>
  );
}
