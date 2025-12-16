import TechButton from "@/components/ui/tech-button";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
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
    <div className="h-14 md:h-16 border-b border-zzz-gray bg-zzz-dark/80 backdrop-blur-md flex items-center justify-between px-3 md:px-6 z-40 shrink-0 transition-all">
      {/* Left Section */}
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 p-1"
        >
          <ArrowLeft size={18} />
          <span className="font-mono text-xs hidden md:inline">
            返回日志
          </span>
        </button>

        <div className="h-4 md:h-6 w-px bg-zzz-gray" />

        <div className="font-mono text-[10px] md:text-xs text-gray-500 uppercase flex items-center whitespace-nowrap">
          <span
            className={
              status === "published" ? "text-zzz-lime" : "text-zzz-orange"
            }
          >
            {status || "DRAFT"}
          </span>
          <span className="mx-1.5 md:mx-2">//</span>
          <span>#{postId}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-6">
        <div className="hidden md:flex items-center gap-2">
          <TechButton
            variant={processState === "SUCCESS" ? "primary" : "secondary"}
            size="sm"
            onClick={handleProcessData}
            disabled={status !== "published" || processState !== "IDLE"}
            icon={
              processState === "PROCESSING" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : processState === "SUCCESS" ? (
                <Check size={14} />
              ) : (
                <Cpu size={14} />
              )
            }
            className={`
                        transition-all duration-300 min-w-[140px] justify-center
                        ${
                          processState === "IDLE"
                            ? "border-dashed opacity-80 hover:opacity-100"
                            : ""
                        }
                    `}
          >
            {processState === "PROCESSING"
              ? "TRANSMITTING..."
              : processState === "SUCCESS"
              ? "SIGNAL_QUEUED"
              : "发布更新"}
          </TechButton>
        </div>

        <SaveIndicator
          saveStatus={saveStatus}
          lastSaved={lastSaved}
          error={error}
        />

        <div className="h-4 md:h-6 w-px bg-zzz-gray hidden sm:block" />

        <button
          onClick={onToggleSettings}
          className={`flex items-center gap-2 px-2 md:px-3 py-2 text-xs font-bold uppercase transition-colors border cursor-pointer ${
            isSettingsOpen
              ? "bg-zzz-gray text-white border-white"
              : "text-gray-400 border-transparent hover:text-white"
          }`}
        >
          <Settings size={16} />
          <span className="hidden md:inline">日志配置</span>
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
    <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase">
      {saveStatus === "ERROR" ? (
        <>
          <X size={12} className="text-zzz-orange" />
          <span className="text-zzz-orange hidden sm:inline">{error}</span>
        </>
      ) : saveStatus === "SAVING" ? (
        <>
          <RefreshCw size={12} className="text-zzz-orange animate-spin" />
          <span className="text-zzz-orange hidden sm:inline">
            传输中...
          </span>
        </>
      ) : saveStatus === "PENDING" ? (
        <>
          <div className="w-3 h-3 rounded-full bg-gray-500 animate-pulse" />
          <span className="text-gray-400 hidden sm:inline">未同步</span>
        </>
      ) : (
        <>
          <CheckCircle2 size={12} className="text-zzz-lime" />
          <span className="text-zzz-lime hidden sm:inline">
            已同步{" "}
            {lastSaved && (
              <span className="hidden lg:inline">
                [{lastSaved.toLocaleTimeString()}]
              </span>
            )}
          </span>
        </>
      )}
    </div>
  );
}
