import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	Calendar,
	Check,
	Download,
	ExternalLink,
	FileText,
	HardDrive,
	Layout,
	Link2,
	Loader2,
	Pencil,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { MediaAsset } from "@/components/admin/media-library/types";
import { getLinkedPostsFn } from "@/features/media/images.api";
import { useDelayUnmount } from "@/hooks/use-delay-unmount";
import { formatBytes } from "@/lib/utils";

interface MediaPreviewModalProps {
	asset: MediaAsset | null;
	onClose: () => void;
	onUpdateName: (key: string, name: string) => Promise<void>;
}

export function MediaPreviewModal({
	asset,
	onClose,
	onUpdateName,
}: MediaPreviewModalProps) {
	const isMounted = !!asset;
	const shouldRender = useDelayUnmount(isMounted, 200);

	// Persist asset during exit animation
	const [activeAsset, setActiveAsset] = useState<MediaAsset | null>(asset);

	// Editing state
	const [isEditing, setIsEditing] = useState(false);
	const [editName, setEditName] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (asset) {
			setActiveAsset(asset);
			setEditName(asset.fileName);
			setIsEditing(false);
		}
	}, [asset]);

	const handleSaveName = async () => {
		if (!activeAsset || !editName.trim()) return;

		setIsSaving(true);
		try {
			await onUpdateName(activeAsset.key, editName);
			setActiveAsset((prev) => (prev ? { ...prev, fileName: editName } : null));
			setIsEditing(false);
		} catch (error) {
			console.error("Failed to update name:", error);
		} finally {
			setIsSaving(false);
		}
	};

	// Query linked posts via server function
	const { data: linkedPosts = [] } = useQuery({
		queryKey: ["linkedPosts", activeAsset?.key],
		queryFn: async () => {
			if (!activeAsset?.key) return [];
			return getLinkedPostsFn({ data: { key: activeAsset.key } });
		},
		enabled: !!activeAsset?.key,
	});

	if (!shouldRender || !activeAsset) return null;

	return (
		<div
			className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 ${
				isMounted ? "pointer-events-auto" : "pointer-events-none"
			}`}
		>
			{/* Backdrop */}
			<div
				className={`absolute inset-0 bg-background/90 backdrop-blur-xl transition-all duration-500 ${
					isMounted ? "opacity-100" : "opacity-0"
				}`}
				onClick={onClose}
			/>

			{/* Close Button */}
			<button
				onClick={onClose}
				className={`absolute top-8 right-8 z-[110] text-muted-foreground hover:text-foreground transition-all duration-500 ${
					isMounted ? "opacity-100 scale-100" : "opacity-0 scale-90"
				}`}
			>
				<X size={32} strokeWidth={1} />
			</button>

			<div
				className={`
        w-full max-w-7xl h-full flex flex-col md:flex-row bg-popover border border-border shadow-2xl relative overflow-hidden z-10 rounded-sm
        ${
					isMounted
						? "animate-in fade-in zoom-in-95"
						: "animate-out fade-out zoom-out-95"
				} duration-500
      `}
			>
				{/* --- Image Viewport (Left/Top) --- */}
				<div className="h-[45vh] md:h-auto md:flex-1 bg-muted relative flex items-center justify-center overflow-hidden p-8 md:p-12 border-b md:border-b-0 md:border-r border-border">
					<img
						src={activeAsset.url}
						alt={activeAsset.fileName}
						className="max-w-full max-h-full object-contain relative z-10 transition-transform duration-1000 group-hover:scale-[1.02]"
					/>
				</div>

				{/* --- Metadata Sidebar (Right/Bottom) --- */}
				<div className="flex-1 md:w-[400px] md:flex-none flex flex-col min-h-0 bg-popover">
					{/* Header */}
					<div className="p-8 md:p-10 border-b border-border">
						<div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">
							Asset Details
						</div>

						{isEditing ? (
							<div className="flex items-center gap-3">
								<input
									type="text"
									value={editName}
									onChange={(e) => setEditName(e.target.value)}
									className="flex-1 bg-muted border-none text-sm font-medium p-3 focus:ring-1 focus:ring-foreground rounded-sm"
									autoFocus
								/>
								<button
									onClick={handleSaveName}
									disabled={isSaving}
									className="p-2 text-green-500 hover:bg-green-500/5 rounded-full"
								>
									{isSaving ? (
										<Loader2 size={18} className="animate-spin" />
									) : (
										<Check size={18} strokeWidth={2.5} />
									)}
								</button>
								<button
									onClick={() => setIsEditing(false)}
									disabled={isSaving}
									className="p-2 text-muted-foreground hover:text-red-500 rounded-full"
								>
									<X size={18} strokeWidth={2.5} />
								</button>
							</div>
						) : (
							<div className="flex justify-between items-start gap-4 group/edit">
								<h2 className="text-2xl font-serif font-medium tracking-tight break-all leading-[1.1]">
									{activeAsset.fileName}
								</h2>
								<button
									onClick={() => setIsEditing(true)}
									className="mt-1 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover/edit:opacity-100"
								>
									<Pencil size={16} strokeWidth={1.5} />
								</button>
							</div>
						)}
					</div>

					{/* Details List */}
					<div className="flex-1 p-8 md:p-10 space-y-10 overflow-y-auto custom-scrollbar">
						<div className="grid grid-cols-2 gap-8">
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
									<HardDrive size={12} strokeWidth={1.5} /> 大小
								</div>
								<div className="text-sm font-medium font-mono uppercase">
									{formatBytes(activeAsset.sizeInBytes)}
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
									<FileText size={12} strokeWidth={1.5} /> 格式
								</div>
								<div className="text-sm font-medium font-mono uppercase">
									{activeAsset.mimeType.split("/")[1]}
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
									<Layout size={12} strokeWidth={1.5} /> 尺寸
								</div>
								<div className="text-sm font-medium font-mono uppercase">
									{activeAsset.width && activeAsset.height
										? `${activeAsset.width} × ${activeAsset.height}`
										: "Unknown"}
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
									<Calendar size={12} strokeWidth={1.5} /> 日期
								</div>
								<div className="text-sm font-medium font-mono uppercase">
									{activeAsset.createdAt
										? new Date(activeAsset.createdAt).toLocaleDateString()
										: "Unknown"}
								</div>
							</div>
						</div>

						{/* Linked Posts Section */}
						<div className="pt-8 border-t border-border">
							<div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">
								<Link2 size={12} strokeWidth={1.5} /> 关联文章 (
								{linkedPosts.length})
							</div>
							{linkedPosts.length === 0 ? (
								<div className="text-[11px] font-serif italic text-muted-foreground">
									未关联任何文章
								</div>
							) : (
								<div className="space-y-3">
									{linkedPosts.map((post) => (
										<Link
											key={post.id}
											to={"/admin/posts/edit/$id"}
											params={{ id: String(post.id) }}
											className="block p-4 bg-muted hover:bg-accent transition-all rounded-sm group"
										>
											<div className="text-[11px] font-medium truncate mb-1 flex items-center justify-between">
												{post.title}
												<ExternalLink
													size={10}
													className="opacity-0 group-hover:opacity-100 transition-opacity"
												/>
											</div>
											<div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
												/{post.slug}
											</div>
										</Link>
									))}
								</div>
							)}
						</div>

						<div className="space-y-3 pt-8 border-t border-border">
							<div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
								资产 ID / KEY
							</div>
							<div className="p-4 bg-muted text-[10px] font-mono text-muted-foreground break-all rounded-sm leading-relaxed select-all">
								{activeAsset.key}
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="p-8 md:p-10 border-t border-border">
						<a
							href={`${activeAsset.url}?original=true`}
							download={activeAsset.fileName}
							target="_blank"
							rel="noreferrer"
							className="flex items-center justify-center gap-3 py-4 bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.2em] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
						>
							<Download size={16} strokeWidth={1.5} />
							下载原始文件
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
