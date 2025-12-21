import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, Check, Trash2, Loader2 } from "lucide-react";
import { ClientOnly } from "@tanstack/react-router";

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

const ConfirmationModalInternal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "确定",
  isDanger = false,
  isLoading = false,
}) => {
  return createPortal(
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6 transition-all duration-500 ease-in-out ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-white/95 dark:bg-[#050505]/98 backdrop-blur-2xl"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Content */}
      <div
        className={`
          relative w-full max-w-lg bg-white dark:bg-[#0c0c0c] border border-zinc-100 dark:border-zinc-900
          flex flex-col shadow-2xl transform transition-all duration-500 ease-in-out rounded-sm
          ${
            isOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-8 scale-[0.99] opacity-0"
          }
        `}
      >
        {/* Header */}
        <div className="px-8 pt-10 pb-6 flex items-start justify-between">
          <div className="space-y-2">
            <div
              className={`flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold ${
                isDanger ? "text-red-500" : "text-zinc-400"
              }`}
            >
              <AlertTriangle size={14} strokeWidth={1.5} />
              <span>系统确认</span>
            </div>
            <h2 className="text-3xl font-serif font-medium text-zinc-950 dark:text-zinc-50">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 -mr-2 text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors disabled:opacity-50"
          >
            <X size={20} strokeWidth={1} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pb-10">
          <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
            {message}
          </p>

          {isDanger && (
            <div className="mt-8 p-4 bg-red-500/5 border-l-2 border-red-500 text-[11px] font-sans uppercase tracking-widest text-red-500/80">
              此操作无法撤销。数据将永久移除。
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-10 flex flex-col sm:flex-row justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors disabled:opacity-50 border border-transparent hover:border-zinc-100 dark:hover:border-white/5"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              flex items-center justify-center gap-3 px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500
              ${
                isDanger
                  ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
                  : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 shadow-lg shadow-black/10"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isDanger ? (
              <Trash2 size={14} />
            ) : (
              <Check size={14} />
            )}
            <span>{isLoading ? "处理中..." : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default function ConfirmationModal(props: ConfirmationModalProps) {
  return (
    <ClientOnly>
      <ConfirmationModalInternal {...props} />
    </ClientOnly>
  );
}
