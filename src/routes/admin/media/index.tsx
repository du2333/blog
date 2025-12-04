import { LoadingFallback } from "@/components/loading-fallback";
import {
  MediaGrid,
  MediaPreviewModal,
  MediaToolbar,
  UploadModal,
} from "@/components/media/components";
import { useMediaLibrary, useMediaUpload } from "@/components/media/hooks";
import { MediaAsset } from "@/components/media/types";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import TechButton from "@/components/ui/tech-button";
import { createFileRoute } from "@tanstack/react-router";
import { Upload } from "lucide-react";
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black font-sans uppercase text-white italic">
          Memory <span className="text-zzz-cyan">Bank</span>
        </h1>
        <TechButton
          size="sm"
          icon={<Upload size={14} />}
          onClick={() => setIsUploadOpen(true)}
        >
          Upload Asset
        </TechButton>
      </div>

      {/* Stats */}
      <div className="flex gap-8 text-xs font-mono text-gray-500 border-b border-zzz-gray pb-4 mb-4">
        <div>
          STORAGE: <span className="text-white">1.2 GB / 5.0 GB</span>
        </div>
        <div>
          ITEMS: <span className="text-white">{totalCount}</span>
        </div>
        <div>
          SELECTED:{" "}
          <span className={selectedIds.size > 0 ? "text-zzz-cyan" : ""}>
            {selectedIds.size}
          </span>
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
        <LoadingFallback />
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
        title="PURGE ASSETS"
        message={`Are you sure you want to permanently delete ${deleteTarget?.length} items? This action cannot be reversed.`}
        confirmLabel="DELETE FOREVER"
        isDanger={true}
        isLoading={isDeleting}
      />

      {/* --- Preview Modal --- */}
      <MediaPreviewModal
        asset={previewAsset}
        onClose={() => setPreviewAsset(null)}
      />
    </div>
  );
}
