import React from "react";
import { AlertTriangle, X, Check, Trash2, Loader2 } from "lucide-react";
import TechButton from "@/components/ui/tech-button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "确定",
  isDanger = false,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Content */}
      <div
        className={`
        relative w-full max-w-md bg-zzz-black border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] 
        flex flex-col clip-corner-tr animate-in zoom-in-95 duration-300
        ${
          isDanger
            ? "border-zzz-orange shadow-[0_0_30px_rgba(255,102,0,0.15)]"
            : "border-zzz-lime"
        }
      `}
      >
        {/* Header */}
        <div
          className={`
            px-6 py-4 border-b flex items-center justify-between
            ${
              isDanger
                ? "bg-zzz-orange/10 border-zzz-orange/30"
                : "bg-zzz-lime/10 border-zzz-lime/30"
            }
        `}
        >
          <div
            className={`flex items-center gap-2 font-mono font-bold uppercase tracking-widest text-sm ${
              isDanger ? "text-zzz-orange" : "text-zzz-lime"
            }`}
          >
            <AlertTriangle size={16} />
            {title}
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 relative overflow-hidden">
          {/* Background Stripe Decoration */}
          <div className="absolute inset-0 bg-stripe-pattern opacity-5 pointer-events-none"></div>

          <p className="font-mono text-sm text-gray-300 leading-relaxed relative z-10">
            {message}
          </p>

          {isDanger && (
            <div className="mt-4 p-3 border border-red-500/30 bg-red-500/5 text-[10px] font-mono text-red-400">
              警告：此操作无法撤销。数据将从 HDD 中清除。
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zzz-gray bg-zzz-dark flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold font-mono text-gray-500 hover:text-white uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消操作
          </button>
          <TechButton
            variant={isDanger ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            icon={
              isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isDanger ? (
                <Trash2 size={14} />
              ) : (
                <Check size={14} />
              )
            }
          >
            {isLoading ? "PROCESSING..." : confirmLabel}
          </TechButton>
        </div>

        {/* Decorative Corner */}
        <div
          className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${
            isDanger ? "border-zzz-orange" : "border-zzz-lime"
          }`}
        ></div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
