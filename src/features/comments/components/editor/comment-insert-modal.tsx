import { ClientOnly } from "@tanstack/react-router";
import { Globe, Image as ImageIcon, Link as LinkIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type React from "react";
import { useDelayUnmount } from "@/hooks/use-delay-unmount";

export type ModalType = "LINK" | "IMAGE" | null;

interface InsertModalProps {
  type: ModalType;
  initialUrl?: string;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

const InsertModalInternal: React.FC<InsertModalProps> = ({
  type,
  initialUrl = "",
  onClose,
  onSubmit,
}) => {
  const isMounted = !!type;
  const shouldRender = useDelayUnmount(isMounted, 500);
  const [activeType, setActiveType] = useState<ModalType>(type);
  const [inputUrl, setInputUrl] = useState(initialUrl);

  useEffect(() => {
    if (type) {
      setActiveType(type);
      setInputUrl(initialUrl);
    }
  }, [type, initialUrl]);

  const handleSubmit = () => {
    const trimmed = inputUrl.trim();
    if (activeType === "LINK") {
      // Allow empty submit to support "remove link" when editing an existing link.
      if (trimmed || initialUrl.trim()) onSubmit(trimmed);
      return;
    }

    if (trimmed) onSubmit(trimmed);
  };

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6 transition-all duration-500 ease-in-out ${
        isMounted
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/95 backdrop-blur-2xl"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`
            relative w-full max-w-4xl bg-background border border-border shadow-2xl 
            flex flex-col overflow-hidden rounded-sm max-h-[90vh] transition-all duration-500 ease-in-out transform
            ${
              isMounted
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-8 scale-[0.99] opacity-0"
            }
       `}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-8 md:p-12 pb-6 shrink-0">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground">
              {activeType === "LINK" ? (
                <LinkIcon size={14} />
              ) : (
                <ImageIcon size={14} />
              )}
              <span>{activeType === "LINK" ? "超链接" : "插入图片"}</span>
            </div>
            <h2 className="text-3xl font-serif font-medium text-foreground">
              {activeType === "LINK" ? "插入超链接" : "插入图片"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} strokeWidth={1} />
          </button>
        </div>

        <div className="flex flex-col gap-8 flex-1 overflow-hidden min-h-0 px-8 md:px-12 pb-8">
          {/* URL Input */}
          <div className="space-y-4 pb-4">
            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 flex items-center gap-2">
              <Globe size={12} strokeWidth={1.5} />
              {activeType === "IMAGE" ? "图片 URL" : "目标链接地址"}
            </label>
            <input
              type="url"
              autoFocus={activeType === "LINK"}
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="https://example.com/..."
              className="w-full bg-transparent border-b border-border text-foreground text-sm py-4 focus:border-foreground focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-8 md:p-12 py-8 border-t border-border flex flex-col sm:flex-row justify-end gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              activeType === "LINK"
                ? !inputUrl.trim() && !initialUrl.trim()
                : !inputUrl.trim()
            }
            className="px-10 py-4 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.3em] hover:opacity-90 transition-all shadow-xl shadow-black/10 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            {activeType === "LINK" && !inputUrl.trim() && initialUrl.trim()
              ? "移除链接"
              : "确认插入"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const InsertModal: React.FC<InsertModalProps> = (props) => {
  return (
    <ClientOnly>
      <InsertModalInternal {...props} />
    </ClientOnly>
  );
};

export default InsertModal;
