import { ClientOnly } from "@tanstack/react-router";
import {
  Check,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MediaAsset } from "@/features/media/components/media-library/types";
import type React from "react";
import { useMediaPicker } from "@/features/media/components/media-library/hooks";
import { useDelayUnmount } from "@/hooks/use-delay-unmount";
import { getOptimizedImageUrl } from "@/features/media/media.utils";

export type ModalType = "LINK" | "IMAGE" | null;

interface InsertModalProps {
  type: ModalType;
  initialUrl?: string;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

const MediaItem = memo(
  ({
    media,
    isSelected,
    onSelect,
  }: {
    media: MediaAsset;
    isSelected: boolean;
    onSelect: (m: MediaAsset) => void;
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
      <div
        onClick={() => onSelect(media)}
        className={`
                relative aspect-square border cursor-pointer transition-all duration-500 bg-muted/30 group overflow-hidden rounded-sm
                ${
                  isSelected
                    ? "border-primary opacity-100 shadow-lg"
                    : "border-border opacity-60 hover:opacity-100 hover:border-foreground"
                }
            `}
      >
        {!isLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <ImageIcon size={18} className="text-muted-foreground/30" />
          </div>
        )}

        <img
          src={getOptimizedImageUrl(media.key)}
          alt={media.fileName}
          className={`w-full h-full object-cover transition-all duration-1000 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${isSelected ? "scale-105" : "group-hover:scale-110"}`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />

        {isSelected && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center backdrop-blur-[1px]">
            <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-xl animate-in zoom-in-50 duration-300">
              <Check size={14} strokeWidth={3} />
            </div>
          </div>
        )}
      </div>
    );
  },
);

MediaItem.displayName = "MediaItem";

const InsertModalInternal: React.FC<InsertModalProps> = ({
  type,
  initialUrl = "",
  onClose,
  onSubmit,
}) => {
  const isMounted = !!type;
  const shouldRender = useDelayUnmount(isMounted, 500);
  const [activeType, setActiveType] = useState<ModalType>(type);

  useEffect(() => {
    if (type) setActiveType(type);
  }, [type]);

  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [selectedMediaKey, setSelectedMediaKey] = useState<string | null>(null);

  const {
    mediaItems,
    searchQuery,
    setSearchQuery,
    loadMore,
    hasMore,
    isLoadingMore,
    isPending,
  } = useMediaPicker();

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  useEffect(() => {
    if (type) {
      setInputUrl(initialUrl);
      setSelectedMediaKey(null);
      setSearchQuery("");
    }
  }, [initialUrl, type, setSearchQuery]);

  const handleSubmit = () => {
    if (inputUrl.trim()) {
      onSubmit(inputUrl);
    }
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
              <span>{activeType === "LINK" ? "超链接" : "媒体资产"}</span>
            </div>
            <h2 className="text-3xl font-serif font-medium text-foreground">
              {activeType === "LINK" ? "插入超链接" : "选择媒体资产"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} strokeWidth={1} />
          </button>
        </div>

        <div className="flex flex-col gap-8 flex-1 overflow-hidden min-h-0 px-8 md:px-12 pb-8">
          {activeType === "IMAGE" && (
            <div className="flex flex-col gap-6 flex-1 min-h-0">
              {/* Search Bar */}
              <div className="relative shrink-0 group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-foreground transition-colors"
                  size={16}
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  placeholder="搜索媒体库内容..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/30 border-none text-foreground text-xs pl-12 pr-4 py-4 focus:ring-1 focus:ring-primary rounded-sm transition-all font-light"
                />
              </div>

              {/* Media Grid */}
              <div className="flex-1 overflow-y-auto custom-scrollbar border border-border bg-muted/20 p-4 rounded-sm">
                {isPending ? (
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="aspect-square bg-muted animate-pulse rounded-sm"
                      />
                    ))}
                  </div>
                ) : mediaItems.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-muted-foreground font-serif italic text-sm">
                    未找到相关资产
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 content-start pb-4">
                    {mediaItems.map((media) => (
                      <MediaItem
                        key={media.key}
                        media={media}
                        isSelected={selectedMediaKey === media.key}
                        onSelect={(m) => {
                          setSelectedMediaKey(m.key);
                          setInputUrl(m.url);
                        }}
                      />
                    ))}
                    <div
                      ref={observerTarget}
                      className="col-span-full h-8 flex items-center justify-center"
                    >
                      {isLoadingMore && (
                        <Loader2
                          size={16}
                          className="animate-spin text-zinc-400"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* URL Input */}
          <div className="space-y-4 pb-4">
            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 flex items-center gap-2">
              <Globe size={12} strokeWidth={1.5} />
              {activeType === "IMAGE" ? "或输入外部链接" : "目标链接地址"}
            </label>
            <input
              type="text"
              autoFocus={activeType === "LINK"}
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (selectedMediaKey) setSelectedMediaKey(null);
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
            onClick={onClose}
            className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!inputUrl.trim()}
            className="px-10 py-4 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.3em] hover:opacity-90 transition-all shadow-xl shadow-black/10 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            确认插入
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
