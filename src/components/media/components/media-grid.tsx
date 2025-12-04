import { formatBytes, getOptimizedImageUrl } from "@/lib/files";
import { CheckCircle2, Eye, Film, Link2, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
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

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {media.map((asset) => {
          const isSelected = selectedIds.has(asset.key);
          const isLinked = linkedMediaIds.has(asset.key);
          const isImage = asset.mimeType.startsWith("image/");

          return (
            <div
              key={asset.key}
              onClick={() => onToggleSelect(asset.key)}
              className={`
                group relative aspect-square flex flex-col clip-corner-bl cursor-pointer transition-all
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
              <div className="flex-1 relative overflow-hidden bg-zzz-dark/50">
                {isImage ? (
                  <img
                    src={getOptimizedImageUrl(asset.key, 300)}
                    alt={asset.fileName}
                    className="w-full h-full object-cover transition-opacity duration-300 opacity-80 group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <Film size={32} />
                  </div>
                )}

                {/* Linked Indicator */}
                {isLinked && (
                  <div
                    className="absolute top-2 right-2 z-10 bg-zzz-black/80 backdrop-blur border border-zzz-orange text-zzz-orange p-1 rounded-sm"
                    title="Asset Linked to Post"
                  >
                    <Link2 size={12} />
                  </div>
                )}

                {/* Selection Checkbox */}
                <div
                  className={`absolute top-2 left-2 z-10 transition-all duration-200 ${
                    isSelected
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-90 group-hover:opacity-50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 flex items-center justify-center border ${
                      isSelected
                        ? "bg-zzz-cyan border-zzz-cyan text-black"
                        : "bg-black border-gray-400"
                    }`}
                  >
                    {isSelected && <CheckCircle2 size={12} />}
                  </div>
                </div>

                {/* Quick Preview Eye Button - Only show for images */}
                {isImage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(asset);
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur border border-zzz-cyan text-zzz-cyan rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-zzz-cyan hover:text-black transition-all z-20 scale-75 group-hover:scale-100 cursor-pointer"
                    title="Preview Asset"
                  >
                    <Eye size={18} />
                  </button>
                )}
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
