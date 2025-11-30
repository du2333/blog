import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Save,
  Settings,
  X,
} from "lucide-react";
import type { SaveStatus } from "../types";

interface EditorToolbarProps {
  mode: "new" | "edit";
  postId?: number;
  status: string;
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  error: string | null;
  isSettingsOpen: boolean;
  onBack: () => void;
  onToggleSettings: () => void;
  onSave: () => void;
}

export function EditorToolbar({
  mode,
  postId,
  status,
  saveStatus,
  lastSaved,
  error,
  isSettingsOpen,
  onBack,
  onToggleSettings,
  onSave,
}: EditorToolbarProps) {
  return (
    <div className="h-16 border-b border-zzz-gray bg-zzz-dark/80 backdrop-blur-md flex items-center justify-between px-6 z-40 shrink-0">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span className="font-mono text-xs hidden md:inline">
            RETURN_LOGS
          </span>
        </button>

        <div className="h-6 w-px bg-zzz-gray" />

        <div className="font-mono text-xs text-gray-500 uppercase">
          <span
            className={
              status === "published" ? "text-zzz-lime" : "text-zzz-orange"
            }
          >
            {status || "DRAFT"}
          </span>
          <span className="mx-2">//</span>
          <span>{mode === "new" ? "NEW_ENTRY" : postId}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        <SaveIndicator
          saveStatus={saveStatus}
          lastSaved={lastSaved}
          error={error}
        />

        <div className="h-6 w-px bg-zzz-gray" />

        <button
          onClick={onToggleSettings}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase transition-colors border cursor-pointer ${
            isSettingsOpen
              ? "bg-zzz-gray text-white border-white"
              : "text-gray-400 border-transparent hover:text-white"
          }`}
        >
          <Settings size={16} />
          <span className="hidden md:inline">Config</span>
        </button>

        {mode === "new" && (
          <button
            onClick={onSave}
            disabled={saveStatus === "SAVING"}
            className="flex items-center gap-2 px-4 py-2 bg-zzz-lime text-black text-xs font-bold uppercase transition-colors hover:bg-white disabled:opacity-50"
          >
            {saveStatus === "SAVING" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            CREATE
          </button>
        )}
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
    <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase">
      {saveStatus === "ERROR" ? (
        <>
          <X size={12} className="text-zzz-orange" />
          <span className="text-zzz-orange">{error}</span>
        </>
      ) : saveStatus === "SAVING" ? (
        <>
          <RefreshCw size={12} className="text-zzz-orange animate-spin" />
          <span className="text-zzz-orange">TRANSMITTING...</span>
        </>
      ) : saveStatus === "PENDING" ? (
        <>
          <div className="w-3 h-3 rounded-full bg-gray-500 animate-pulse" />
          <span className="text-gray-400">UNSAVED</span>
        </>
      ) : (
        <>
          <CheckCircle2 size={12} className="text-zzz-lime" />
          <span className="text-zzz-lime">
            SYNCED {lastSaved && `[${lastSaved.toLocaleTimeString()}]`}
          </span>
        </>
      )}
    </div>
  );
}
