import {
  MediaGrid,
  MediaPreviewModal,
  MediaToolbar,
  UploadModal,
} from "@/components/admin/media-library/components";
import {
  useMediaLibrary,
  useMediaUpload,
} from "@/components/admin/media-library/hooks";
import { MediaAsset } from "@/components/admin/media-library/types";
import { MediaLibrarySkeleton } from "@/components/skeletons/media-skeleton";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { formatBytes } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Upload, Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/media/")({
  component: MediaLibrary,
});

function MediaLibrary() {
  // Logic Hooks
  const {
    mediaItems,
    totalCount,
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
    linkedMediaIds,
    totalMediaSize,
    updateAsset,
  } = useMediaLibrary();

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

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif font-medium tracking-tight">媒体库</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-mono">
            Asset Repository // {totalCount} Items
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] uppercase tracking-[0.2em] font-medium hover:scale-105 transition-all active:scale-95"
        >
          <Plus size={14} />
          上传文件
        </button>
      </header>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-x-12 gap-y-4 pt-6 border-t border-zinc-100 dark:border-white/5">
        <div className="space-y-1">
          <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold">总容量</div>
          <div className="text-xl font-serif">{formatBytes(totalMediaSize ?? 0)}</div>
        </div>
        <div className="space-y-1">
          <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold">已选</div>
          <div className={`text-xl font-serif transition-colors ${selectedIds.size > 0 ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-300 dark:text-zinc-700"}`}>
            {selectedIds.size}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <MediaToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCount={selectedIds.size}
        totalCount={mediaItems.length}
        onSelectAll={selectAll}
        onDelete={handleDeleteRequest}
      />

      {/* Media Grid */}
      {isPending ? (
        <MediaLibrarySkeleton />
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
  );
}
