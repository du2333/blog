import React, { useState, useEffect, memo, useRef } from "react";
import {
  X,
  Grid,
  Link as LinkIcon,
  Check,
  Search,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import TechButton from "@/components/ui/tech-button";
import { useDelayUnmount } from "@/hooks/use-delay-unmount";
import { useMediaPicker } from "@/components/admin/media-library/hooks";
import { MediaAsset } from "@/components/admin/media-library/types";
import { getOptimizedImageUrl } from "@/lib/images/utils";
import { LoadingFallback } from "@/components/common/loading-fallback";

export type ModalType = "LINK" | "IMAGE" | null;

interface InsertModalProps {
  type: ModalType;
  initialUrl?: string;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

// Memoized Media Item Component to prevent unnecessary re-renders and handle smooth loading
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
                relative aspect-square border-2 cursor-pointer transition-all bg-zzz-dark/50 group overflow-hidden
                ${
                  isSelected
                    ? "border-zzz-lime opacity-100"
                    : "border-zzz-gray opacity-60 hover:opacity-100 hover:border-white"
                }
            `}
      >
        {/* Placeholder / Skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-zzz-gray/10 animate-pulse flex items-center justify-center">
            <ImageIcon size={20} className="text-zzz-gray/30" />
          </div>
        )}

        <img
          src={getOptimizedImageUrl(media.key)}
          alt={media.fileName}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
        />

        {isSelected && (
          <div className="absolute inset-0 bg-zzz-lime/20 flex items-center justify-center backdrop-blur-[1px]">
            <div className="bg-zzz-lime text-black rounded-full p-1 shadow-lg transform scale-100 transition-transform">
              <Check size={16} />
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-black/90 p-1 text-[9px] font-mono text-white truncate px-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {media.fileName}
        </div>
      </div>
    );
  }
);

const InsertModal: React.FC<InsertModalProps> = ({
  type,
  initialUrl = "",
  onClose,
  onSubmit,
}) => {
  const isMounted = !!type;
  const shouldRender = useDelayUnmount(isMounted, 200);

  // Keep track of the last active type so we don't render empty content during exit animation
  const [activeType, setActiveType] = useState<ModalType>(type);

  useEffect(() => {
    if (type) setActiveType(type);
  }, [type]);

  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [selectedMediaKey, setSelectedMediaKey] = useState<string | null>(null);

  // Use media picker hook for real data
  const {
    mediaItems,
    searchQuery,
    setSearchQuery,
    loadMore,
    hasMore,
    isLoadingMore,
    isPending,
  } = useMediaPicker();

  // Intersection observer for infinite scroll
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
      { threshold: 0.1 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, loadMore]);

  useEffect(() => {
    if (type) {
      setInputUrl(initialUrl);
      setSelectedMediaKey(null);
      setSearchQuery("");
    }
  }, [initialUrl, type, setSearchQuery]);

  const handleSubmit = () => {
    onSubmit(inputUrl);
  };

  const handleMediaSelect = (media: MediaAsset) => {
    if (selectedMediaKey === media.key) {
      setSelectedMediaKey(null);
      setInputUrl("");
    } else {
      setSelectedMediaKey(media.key);
      // Use the original URL (server applies quality=80 by default)
      setInputUrl(media.url);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 ${
        isMounted ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/90 transition-opacity duration-200 ${
          isMounted ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`
            bg-zzz-black border-2 border-zzz-lime shadow-[0_0_50px_rgba(204,255,0,0.2)] relative z-10 clip-corner-bl flex flex-col w-full max-w-lg max-h-[85vh] overflow-hidden transform-gpu
            ${
              isMounted
                ? "animate-in fade-in zoom-in-95"
                : "animate-out fade-out zoom-out-95"
            } duration-200
       `}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zzz-gray bg-zzz-dark/50 shrink-0">
          <div className="flex items-center gap-2 text-zzz-lime font-mono font-bold uppercase tracking-wider text-sm">
            {activeType === "LINK" ? (
              <LinkIcon size={16} />
            ) : (
              <Grid size={16} />
            )}
            {activeType === "LINK" ? "插入超链接" : "选择资产"}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-6 flex-1 overflow-hidden min-h-0 p-6">
          {/* Image Selection Area */}
          {activeType === "IMAGE" && (
            <div className="flex flex-col gap-4 flex-1 min-h-0">
              {/* Search Bar */}
              <div className="relative shrink-0">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="检索媒体库..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black border border-zzz-gray text-white text-xs font-mono pl-9 pr-3 py-3 focus:border-zzz-cyan focus:outline-none transition-colors"
                />
              </div>

              {/* Media Grid */}
              <div className="flex-1 overflow-y-auto custom-scrollbar border border-zzz-gray/20 bg-zzz-dark/20 p-2 min-h-[200px]">
                {isPending ? (
                  <LoadingFallback />
                ) : mediaItems.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500 font-mono text-xs">
                    未找到资产
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 content-start">
                    {mediaItems.map((media) => (
                      <MediaItem
                        key={media.key}
                        media={media}
                        isSelected={selectedMediaKey === media.key}
                        onSelect={handleMediaSelect}
                      />
                    ))}
                    {/* Sentinel for infinite scroll */}
                    <div
                      ref={observerTarget}
                      className="col-span-3 h-4 flex items-center justify-center"
                    >
                      {isLoadingMore && (
                        <Loader2
                          size={14}
                          className="animate-spin text-zzz-lime"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* URL Input */}
          <div className="shrink-0">
            <label className="text-[10px] text-gray-500 font-bold font-mono uppercase tracking-widest block mb-2">
              {activeType === "IMAGE"
                ? "或外部链接"
                : "目标链接"}
            </label>
            <input
              type="text"
              autoFocus={activeType === "LINK"}
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                // deselect media if user types something different
                if (selectedMediaKey) {
                  setSelectedMediaKey(null);
                }
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="https://..."
              className="w-full bg-black border border-zzz-gray text-zzz-white text-xs font-mono p-3 focus:border-zzz-cyan focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-4 border-t border-zzz-gray/30 bg-zzz-dark/30 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-zzz-gray text-gray-400 text-xs font-bold uppercase hover:text-white hover:border-white transition-colors"
          >
            取消
          </button>
          <TechButton
            size="sm"
            onClick={handleSubmit}
            icon={<Check size={14} />}
          >
            确认
          </TechButton>
        </div>

        {/* Decorative Corner */}
        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-zzz-lime"></div>
      </div>
    </div>
  );
};

export default InsertModal;
