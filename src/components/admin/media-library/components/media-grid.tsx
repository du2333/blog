import { getOptimizedImageUrl } from "@/lib/images/utils";
import { formatBytes } from "@/lib/utils";
import { CheckCircle2, Circle, Film, Link2, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useLongPress } from "../hooks";
import { MediaAsset } from "../types";

interface MediaGridProps {
  media: MediaAsset[];
  selectedIds: Set<string>; // 使用 key 作为标识
  onToggleSelect: (key: string) => void;
  onPreview: (asset: MediaAsset) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  linkedMediaIds: Set<string>;
}

function MediaCard({
  asset,
  isSelected,
  isLinked,
  isImage,
  onToggleSelect,
  onPreview,
  selectionModeActive,
}: {
  asset: MediaAsset;
  isSelected: boolean;
  isLinked: boolean;
  isImage: boolean;
  onToggleSelect: (key: string) => void;
  onPreview: (asset: MediaAsset) => void;
  selectionModeActive: boolean;
}) {
  const thumbnailUrl = getOptimizedImageUrl(asset.key);

  const handleStandardClick = () => {
    if (selectionModeActive) {
      onToggleSelect(asset.key);
    } else {
      onPreview(asset);
    }
  };

  const handleLongPress = () => {
    // Long press always toggles selection (entering selection mode if not active)
    onToggleSelect(asset.key);
  };

  const longPressHandlers = useLongPress(handleLongPress, handleStandardClick, {
    delay: 500,
  });

  return (
    <div
      {...longPressHandlers}
      className={`
        group relative aspect-square flex flex-col clip-corner-bl cursor-pointer transition-all touch-manipulation select-none
        border-2 ${
          isSelected
            ? "border-zzz-cyan bg-zzz-cyan/5"
            : isLinked
            ? "border-zzz-orange/30"
            : "border-zzz-gray bg-black hover:border-gray-500"
        }
        `}
    >
      {/* Preview */}
      <div className="flex-1 relative overflow-hidden bg-zzz-dark/50 pointer-events-none">
        {isImage ? (
          <img
            src={thumbnailUrl}
            alt={asset.fileName}
            className="w-full h-full object-cover transition-opacity duration-300 opacity-80 group-hover:opacity-100"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <Film size={32} />
          </div>
        )}

        {/* Linked Indicator */}
        {isLinked && (
          <div
            className="absolute top-2 right-2 z-10 bg-zzz-black/80 backdrop-blur border border-zzz-orange text-zzz-orange p-1 rounded-sm pointer-events-none"
            title="Asset Linked to Post"
          >
            <Link2 size={12} />
          </div>
        )}

        {/* Selection Checkbox 
            - Always visible on mobile (opacity-100)
            - On Desktop (md): Hidden by default (md:opacity-0), visible on hover (md:group-hover:opacity-100)
            - If selected: Always visible (opacity-100 override)
        */}
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(asset.key);
          }}
          className={`
                absolute top-0 left-0 p-3 z-20 transition-all duration-200 cursor-pointer pointer-events-auto
                ${
                  isSelected
                    ? "opacity-100"
                    : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
                }
            `}
        >
          <div
            className={`
                w-6 h-6 flex items-center justify-center border rounded-full backdrop-blur-sm shadow-md transition-all
                ${
                  isSelected
                    ? "bg-zzz-cyan border-zzz-cyan text-black"
                    : "bg-black/50 border-white/50 text-transparent hover:bg-black hover:border-zzz-cyan"
                }
            `}
          >
            {isSelected ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          </div>
        </div>
      </div>

      {/* Info */}
      <div
        className={`p-3 border-t transition-colors ${
          isSelected
            ? "border-zzz-cyan bg-zzz-cyan/10"
            : isLinked
            ? "border-zzz-orange/30 bg-zzz-orange/5"
            : "border-zzz-gray bg-zzz-dark/80"
        }`}
      >
        <div
          className={`text-xs font-bold truncate mb-1 ${
            isLinked ? "text-zzz-orange" : "text-white"
          }`}
        >
          {asset.fileName}
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
          <span>{formatBytes(asset.sizeInBytes)}</span>
          <span>
            {asset.createdAt
              ? new Date(asset.createdAt).toLocaleDateString()
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

export function MediaGrid({
  media,
  selectedIds,
  onToggleSelect,
  onPreview,
  onLoadMore,
  hasMore,
  isLoadingMore,
  linkedMediaIds,
}: MediaGridProps) {
  const observerTarget = useRef(null);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          onLoadMore
        ) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  if (media.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-zzz-gray bg-black/50 text-gray-500 font-mono text-xs">
        扇区内未找到资产
      </div>
    );
  }

  const selectionModeActive = selectedIds.size > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {media.map((asset) => {
          const isSelected = selectedIds.has(asset.key);
          const isLinked = linkedMediaIds.has(asset.key);
          const isImage = asset.mimeType.startsWith("image/");

          return (
            <MediaCard
              key={asset.key}
              asset={asset}
              isSelected={isSelected}
              isLinked={isLinked}
              isImage={isImage}
              onToggleSelect={onToggleSelect}
              onPreview={onPreview}
              selectionModeActive={selectionModeActive}
            />
          );
        })}
      </div>

      {/* Loading / Sentinel */}
      <div
        ref={observerTarget}
        className="h-10 flex items-center justify-center w-full"
      >
        {isLoadingMore && (
          <div className="flex items-center gap-2 text-zzz-lime text-xs font-mono animate-pulse">
            <Loader2 size={16} className="animate-spin" />{" "}
            LOADING_SECTOR_DATA...
          </div>
        )}
        {!hasMore && media.length > 0 && (
          <div className="text-gray-600 text-[10px] font-mono">
            END_OF_ARCHIVE
          </div>
        )}
      </div>
    </div>
  );
}
