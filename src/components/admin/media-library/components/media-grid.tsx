import { Check, Film, Image as ImageIcon, Link2, Loader2 } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { getOptimizedImageUrl } from "@/lib/images/utils";
import { formatBytes } from "@/lib/utils";
import { useLongPress } from "../hooks";
import type { MediaAsset } from "../types";

interface MediaGridProps {
	media: MediaAsset[];
	selectedIds: Set<string>;
	onToggleSelect: (key: string) => void;
	onPreview: (asset: MediaAsset) => void;
	onLoadMore?: () => void;
	hasMore?: boolean;
	isLoadingMore?: boolean;
	linkedMediaIds: Set<string>;
}

const MediaCard = memo(
	({
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
	}) => {
		const [isLoaded, setIsLoaded] = useState(false);
		const thumbnailUrl = getOptimizedImageUrl(asset.key);

		const handleStandardClick = () => {
			if (selectionModeActive) {
				onToggleSelect(asset.key);
			} else {
				onPreview(asset);
			}
		};

		const handleLongPress = () => {
			onToggleSelect(asset.key);
		};

		const longPressHandlers = useLongPress(
			handleLongPress,
			handleStandardClick,
			{
				delay: 500,
			},
		);

		return (
			<div
				{...longPressHandlers}
				className={`
        group relative flex flex-col cursor-pointer transition-all duration-500 touch-manipulation select-none overflow-hidden rounded-sm border
        ${
					isSelected
						? "border-foreground ring-4 ring-foreground/5 scale-[0.98]"
						: isLinked
							? "border-border"
							: "border-border hover:border-border"
				}
      `}
			>
				{/* Selection Overlay */}
				<div
					className={`absolute top-3 left-3 z-30 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-500 ${
						isSelected
							? "bg-primary border-transparent scale-110"
							: "bg-background/40 border-border/20 opacity-0 group-hover:opacity-100"
					}`}
					onMouseDown={(e) => e.stopPropagation()}
					onMouseUp={(e) => e.stopPropagation()}
					onClick={(e) => {
						e.stopPropagation();
						onToggleSelect(asset.key);
					}}
				>
					{isSelected && (
						<Check
							size={12}
							className="text-primary-foreground"
							strokeWidth={3}
						/>
					)}
				</div>

				{/* Linked Indicator */}
				{isLinked && !isSelected && (
					<div className="absolute top-3 right-3 z-20 text-muted-foreground">
						<Link2 size={12} strokeWidth={1.5} />
					</div>
				)}

				{/* Preview */}
				<div className="aspect-square relative overflow-hidden bg-muted">
					{isImage ? (
						<>
							{!isLoaded && (
								<div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
									<ImageIcon size={24} className="text-muted-foreground" />
								</div>
							)}
							<img
								src={thumbnailUrl}
								alt={asset.fileName}
								className={`w-full h-full object-cover transition-all duration-1000 ${
									isLoaded ? "opacity-100" : "opacity-0"
								} ${
									isSelected
										? "scale-110 blur-[2px] opacity-40"
										: "group-hover:scale-105"
								}`}
								onLoad={() => setIsLoaded(true)}
							/>
						</>
					) : (
						<div className="w-full h-full flex items-center justify-center text-muted-foreground">
							<Film size={32} strokeWidth={1} />
						</div>
					)}
				</div>

				{/* Info */}
				<div className="p-4 space-y-1 bg-popover">
					<div className="text-[11px] font-medium truncate">
						{asset.fileName}
					</div>
					<div className="flex justify-between text-[9px] text-muted-foreground font-mono tracking-wider uppercase">
						<span>{formatBytes(asset.sizeInBytes)}</span>
						<span>{asset.mimeType.split("/")[1]}</span>
					</div>
				</div>
			</div>
		);
	},
);

MediaCard.displayName = "MediaCard";

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
			{ threshold: 0.1 },
		);

		observer.observe(target);

		return () => {
			observer.disconnect();
		};
	}, [hasMore, isLoadingMore, onLoadMore]);

	if (media.length === 0) {
		return (
			<div className="py-32 text-center font-serif italic text-muted-foreground border border-dashed border-border rounded-sm">
				媒体库中暂无资产
			</div>
		);
	}

	const selectionModeActive = selectedIds.size > 0;

	return (
		<div className="space-y-12">
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
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
				className="py-12 flex flex-col items-center justify-center gap-4"
			>
				{isLoadingMore ? (
					<div className="flex flex-col items-center gap-4">
						<div className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
							<Loader2
								size={16}
								className="text-muted-foreground animate-spin"
							/>
						</div>
						<span className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground animate-pulse">
							Syncing
						</span>
					</div>
				) : !hasMore && media.length > 0 ? (
					<div className="h-px w-24 bg-border" />
				) : null}
			</div>
		</div>
	);
}
