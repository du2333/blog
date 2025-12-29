import type { MediaAsset } from "@/components/admin/media-library/types";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
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
import { MediaLibrarySkeleton } from "@/components/skeletons/media-skeleton";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { formatBytes } from "@/lib/utils";

export const Route = createFileRoute("/admin/media/")({
	component: MediaLibrary,
	head: () => ({
		meta: [
			{
				title: "媒体库",
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
		}
		catch (error) {
			// Error is already handled in requestDelete via toast
			console.error("Delete request failed:", error);
		}
	};

	if (isInitialPending && !searchQuery) {
		return <MediaLibrarySkeleton />;
	}

	return (
		<div className="space-y-12 pb-20">
			<header className="flex justify-between items-end animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
				<div className="space-y-1">
					<h1 className="text-4xl font-serif font-medium tracking-tight">
						媒体库
					</h1>
				</div>
				<Button
					onClick={() => setIsUploadOpen(true)}
					className="h-12 px-8 text-[11px] uppercase tracking-[0.2em] font-medium rounded-sm gap-2"
				>
					<Plus size={14} />
					上传文件
				</Button>
			</header>

			{/* Stats Bar */}
			<div className="flex flex-wrap gap-x-12 gap-y-4 pt-6 border-t border-border animate-in fade-in duration-1000 delay-100 fill-mode-both">
				<div className="space-y-1">
					<div className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold">
						总容量
					</div>
					<div className="text-xl font-serif">
						{formatBytes(totalMediaSize ?? 0)}
					</div>
				</div>
				<div className="space-y-1">
					<div className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold">
						已选
					</div>
					<div
						className={`text-xl font-serif transition-colors ${selectedIds.size > 0 ? "text-foreground" : "text-muted-foreground"}`}
					>
						{selectedIds.size}
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
				{isPending
					? (
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
								{Array.from({ length: 12 }).map((_, i) => (
									<div key={i} className="flex flex-col space-y-4 animate-pulse">
										<div className="aspect-square bg-muted rounded-sm" />
										<div className="space-y-2 px-1">
											<div className="h-3 w-3/4 bg-muted rounded" />
											<div className="flex justify-between">
												<div className="h-2 w-1/4 bg-muted rounded opacity-50" />
												<div className="h-2 w-1/4 bg-muted rounded opacity-50" />
											</div>
										</div>
									</div>
								))}
							</div>
						)
					: (
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
	);
}
