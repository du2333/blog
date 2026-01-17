import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { MediaAsset } from "@/features/media/components/media-library/types";
import {
  MediaGrid,
  MediaPreviewModal,
  MediaToolbar,
  UploadModal,
} from "@/features/media/components/media-library/components";
import {
  useMediaLibrary,
  useMediaUpload,
} from "@/features/media/components/media-library/hooks";
import { MediaLibrarySkeleton } from "@/features/media/components/media-library/media-skeleton";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { formatBytes } from "@/lib/utils";

export const Route = createFileRoute("/admin/media/")({
  component: MediaLibrary,
  loader: () => ({
    title: "媒体库",
  }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title,
      },
    ],
  }),
});

function MediaLibrary() {
  // Logic Hooks
  const {
    mediaItems,
    searchQuery,
    setSearchQuery,
    selectedIds,
    toggleSelection,
    selectAll,
    deleteTarget,
    isDeleting,
    requestDelete,
    confirmDelete,
    cancelDelete,
    loadMore,
    hasMore,
    isLoadingMore,
    isPending,
    totalMediaSize,
    updateAsset,
    linkedMediaIds,
  } = useMediaLibrary();

  const isInitialPending = isPending && !mediaItems.length;

  const {
    isOpen: isUploadOpen,
    setIsOpen: setIsUploadOpen,
    queue: uploadQueue,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    processFiles,
    reset: resetUpload,
  } = useMediaUpload();

  // View State
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  const handleDeleteRequest = async () => {
    try {
      await requestDelete(Array.from(selectedIds));
    } catch (error) {
      // Error is already handled in requestDelete via toast
      console.error("Delete request failed:", error);
    }
  };

  if (isInitialPending && !searchQuery) {
    return <MediaLibrarySkeleton />;
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/30">
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-medium tracking-tight">
              媒体库
            </h1>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              DIGITAL_ASSET_ARCHIVE
            </p>
          </div>
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="h-9 px-4 text-[10px] uppercase tracking-[0.2em] font-medium rounded-none gap-2 bg-foreground text-background hover:bg-foreground/90"
          >
            <Plus size={12} />
            上传文件
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 border border-border/30 bg-background/50 hover:bg-accent/5 transition-colors group">
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-mono mb-2 group-hover:text-foreground transition-colors">
              总容量
            </div>
            <div className="text-3xl font-serif text-foreground">
              {formatBytes(totalMediaSize ?? 0)}
              <span className="text-xs text-muted-foreground ml-2 font-mono">
                已用
              </span>
            </div>
          </div>
          <div className="p-6 border border-border/30 bg-background/50 hover:bg-accent/5 transition-colors group">
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-mono mb-2 group-hover:text-foreground transition-colors">
              资产数量
            </div>
            <div className="text-3xl font-serif text-foreground">
              {mediaItems.length}
              <span className="text-xs text-muted-foreground ml-2 font-mono">
                个
              </span>
            </div>
          </div>
          <div className="p-6 border border-border/30 bg-background/50 hover:bg-accent/5 transition-colors group">
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-mono mb-2 group-hover:text-foreground transition-colors">
              已选择
            </div>
            <div className="text-3xl font-serif text-foreground">
              {selectedIds.size}
              <span className="text-xs text-muted-foreground ml-2 font-mono">
                选中
              </span>
            </div>
          </div>
        </div>

        <div className="animate-in fade-in duration-1000 delay-200 fill-mode-both space-y-12">
          {/* Toolbar */}
          <MediaToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCount={selectedIds.size}
            totalCount={mediaItems.length}
            onSelectAll={selectAll}
            onDelete={handleDeleteRequest}
          />

          {/* Media Grid / Partial Skeleton */}
          {isPending ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-4 animate-pulse">
                  <div className="aspect-square bg-muted rounded-none" />
                  <div className="space-y-2 px-1">
                    <div className="h-3 w-3/4 bg-muted rounded-none" />
                    <div className="flex justify-between">
                      <div className="h-2 w-1/4 bg-muted rounded-none opacity-50" />
                      <div className="h-2 w-1/4 bg-muted rounded-none opacity-50" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <MediaGrid
              media={mediaItems}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelection}
              onPreview={setPreviewAsset}
              onLoadMore={loadMore}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              linkedMediaIds={linkedMediaIds}
            />
          )}
        </div>

        {/* --- Upload Modal --- */}
        <UploadModal
          isOpen={isUploadOpen}
          queue={uploadQueue}
          isDragging={isDragging}
          onClose={resetUpload}
          onFileSelect={processFiles}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />

        {/* --- Delete Confirmation Modal --- */}
        <ConfirmationModal
          isOpen={!!deleteTarget}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="确认删除"
          message={`您确定要永久删除这 ${deleteTarget?.length} 个媒体资产吗？此操作无法撤销。`}
          confirmLabel="确认删除"
          isDanger={true}
          isLoading={isDeleting}
        />

        {/* --- Preview Modal --- */}
        <MediaPreviewModal
          asset={previewAsset}
          onClose={() => setPreviewAsset(null)}
          onUpdateName={async (key, name) => {
            await updateAsset.mutateAsync({ data: { key, name } });
          }}
        />
      </div>
    </div>
  );
}
