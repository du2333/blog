import { useBlocker, useRouter } from "@tanstack/react-router";
import type { JSONContent } from "@tiptap/react";
import {
	Calendar,
	Check,
	ChevronLeft,
	Clock,
	Cpu,
	Eye,
	FileText,
	Globe,
	Link as LinkIcon,
	Loader2,
	RefreshCw,
	Sparkles,
	Tag,
	X,
} from "lucide-react";
import { useCallback, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { PostEditorSkeleton } from "@/components/skeletons/post-editor-skeleton";
import { Editor } from "@/components/tiptap-editor";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import DatePicker from "@/components/ui/date-picker";
import DropdownMenu from "@/components/ui/dropdown-menu";
import {
	POST_CATEGORIES,
	POST_STATUSES,
	type PostCategory,
} from "@/lib/db/schema";

import { useAutoSave, usePostActions } from "./hooks";
import type { PostEditorData, PostEditorProps } from "./types";

export function PostEditor({ initialData, onSave }: PostEditorProps) {
	if (!initialData) return <PostEditorSkeleton />;
	const router = useRouter();

	// Initialize post state from initialData (always provided)
	const [post, setPost] = useState<PostEditorData>(() => ({
		title: initialData.title,
		summary: initialData.summary ?? "",
		slug: initialData.slug,
		category: initialData.category,
		status: initialData.status,
		readTimeInMinutes: initialData.readTimeInMinutes,
		contentJson: initialData.contentJson ?? null,
		publishedAt: initialData.publishedAt,
	}));

	// Auto-save hook
	const { saveStatus, lastSaved, setError } = useAutoSave({
		post,
		onSave,
	});

	const { proceed, reset, status } = useBlocker({
		shouldBlockFn: () => saveStatus === "SAVING",
		withResolver: true,
	});

	// Post actions hook
	const {
		isGeneratingSlug,
		isCalculatingReadTime,
		isGeneratingSummary,
		handleGenerateSlug,
		handleCalculateReadTime,
		handleGenerateSummary,
		handleProcessData,
		processState,
	} = usePostActions({
		postId: initialData.id,
		post,
		setPost,
		setError,
	});

	const handleContentChange = useCallback((json: JSONContent) => {
		setPost((prev) => ({ ...prev, contentJson: json }));
	}, []);

	const handlePostChange = useCallback((updates: Partial<PostEditorData>) => {
		setPost((prev) => ({ ...prev, ...updates }));
	}, []);

	return (
		<div className="fixed inset-0 z-80 flex flex-col bg-background selection:bg-accent overflow-hidden">
			<ConfirmationModal
				isOpen={status === "blocked"}
				onClose={() => reset?.()}
				onConfirm={() => proceed?.()}
				title="离开页面？"
				message="您有正在保存的更改。离开可能会导致部分数据丢失。"
				confirmLabel="确认离开"
			/>

			{/* Control Header */}
			<header className="h-20 flex items-center justify-between px-8 shrink-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
				<button
					onClick={() => router.history.back()}
					className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all"
				>
					<div className="p-2 bg-accent border border-border/50 rounded-full group-hover:scale-105 active:scale-95 transition-all shadow-sm">
						<ChevronLeft size={18} />
					</div>
					<span className="text-[10px] uppercase tracking-[0.2em] font-bold">
						返回
					</span>
				</button>

				<div className="flex items-center gap-3">
					<button
						onClick={() => {
							if (post.slug) window.open(`/post/${post.slug}`, "_blank");
						}}
						className="px-6 py-2.5 bg-accent border border-border/50 rounded-full text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 group"
					>
						<Eye
							size={14}
							className="group-hover:scale-110 transition-transform"
						/>
						<span>预览</span>
					</button>

					<button
						onClick={handleProcessData}
						disabled={processState !== "IDLE"}
						className={`
              px-6 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 shadow-lg shadow-black/5
              ${
								processState === "SUCCESS"
									? "bg-green-500/10 border border-green-500/20 text-green-600"
									: "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-20"
							}
            `}
					>
						{processState === "PROCESSING" ? (
							<Loader2 size={14} className="animate-spin" />
						) : processState === "SUCCESS" ? (
							<Check size={14} strokeWidth={3} />
						) : (
							<Cpu size={14} />
						)}
						<span>
							{processState === "PROCESSING"
								? "发布中"
								: processState === "SUCCESS"
									? "已发布"
									: "发布"}
						</span>
					</button>
				</div>
			</header>

			{/* Main Content Area (Only this scrolls) */}
			<div className="flex-1 overflow-y-auto custom-scrollbar relative scroll-smooth animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both delay-100">
				<div className="w-full max-w-3xl mx-auto py-20 px-6 md:px-0">
					{/* Title Area */}
					<div className="mb-12">
						<TextareaAutosize
							value={post.title}
							onChange={(e) =>
								setPost((prev) => ({ ...prev, title: e.target.value }))
							}
							minRows={1}
							placeholder="文章标题..."
							className="w-full bg-transparent text-5xl md:text-7xl font-serif font-medium tracking-tight text-foreground placeholder:text-muted/50 focus:outline-none transition-all overflow-hidden leading-[1.1] resize-none border-none p-0"
						/>
					</div>

					{/* Notion-style Properties Section */}
					<div className="mb-20 space-y-1 py-8 border-y border-border/50">
						{/* Property Row: Status */}
						<div className="group flex items-center min-h-10 px-2 hover:bg-accent rounded-sm transition-colors">
							<div className="w-32 flex items-center gap-2 text-muted-foreground">
								<Globe size={14} strokeWidth={1.5} />
								<span className="text-[11px] uppercase tracking-wider font-medium">
									状态
								</span>
							</div>
							<div className="flex-1 flex gap-2">
								{POST_STATUSES.map((s) => (
									<button
										key={s}
										onClick={() => handlePostChange({ status: s })}
										className={`
                      px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-sm transition-all
                      ${
												post.status === s
													? "bg-primary text-primary-foreground"
													: "text-muted-foreground hover:text-foreground"
											}
                    `}
									>
										{s === "published"
											? "公开"
											: s === "draft"
												? "草稿"
												: "归档"}
									</button>
								))}
							</div>
						</div>

						{/* Property Row: Slug */}
						<div className="group flex items-center min-h-10 px-2 hover:bg-accent rounded-sm transition-colors">
							<div className="w-32 flex items-center gap-2 text-muted-foreground">
								<LinkIcon size={14} strokeWidth={1.5} />
								<span className="text-[11px] uppercase tracking-wider font-medium">
									永久链接
								</span>
							</div>
							<div className="flex-1 flex items-center gap-2">
								<input
									type="text"
									value={post.slug || ""}
									onChange={(e) => handlePostChange({ slug: e.target.value })}
									placeholder="文章链接..."
									className="flex-1 bg-transparent text-xs font-mono text-foreground focus:outline-none placeholder:text-muted-foreground/30"
								/>
								<button
									onClick={handleGenerateSlug}
									disabled={isGeneratingSlug}
									className="p-1.5 text-muted-foreground/50 hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
									title="自动生成"
								>
									{isGeneratingSlug ? (
										<Loader2 size={12} className="animate-spin" />
									) : (
										<Sparkles size={12} />
									)}
								</button>
							</div>
						</div>

						{/* Property Row: Category */}
						<div className="group flex items-center min-h-10 px-2 hover:bg-accent rounded-sm transition-colors">
							<div className="w-32 flex items-center gap-2 text-muted-foreground">
								<Tag size={14} strokeWidth={1.5} />
								<span className="text-[11px] uppercase tracking-wider font-medium">
									类别
								</span>
							</div>
							<div className="flex-1">
								<DropdownMenu
									value={post.category}
									onChange={(val) =>
										handlePostChange({ category: val as PostCategory })
									}
									options={POST_CATEGORIES.map((c) => ({
										label: c,
										value: c,
									}))}
								/>
							</div>
						</div>

						{/* Property Row: Date */}
						<div className="group flex items-center min-h-10 px-2 hover:bg-accent rounded-sm transition-colors">
							<div className="w-32 flex items-center gap-2 text-muted-foreground">
								<Calendar size={14} strokeWidth={1.5} />
								<span className="text-[11px] uppercase tracking-wider font-medium">
									发布时间
								</span>
							</div>
							<div className="flex-1">
								<DatePicker
									value={
										post.publishedAt
											? post.publishedAt.toISOString().split("T")[0]
											: ""
									}
									onChange={(dateStr) =>
										handlePostChange({
											publishedAt: dateStr ? new Date(dateStr) : null,
										})
									}
									className="p-0! border-none! bg-transparent! text-xs text-foreground"
								/>
							</div>
						</div>

						{/* Property Row: Read Time */}
						<div className="group flex items-center min-h-10 px-2 hover:bg-accent rounded-sm transition-colors">
							<div className="w-32 flex items-center gap-2 text-muted-foreground">
								<Clock size={14} strokeWidth={1.5} />
								<span className="text-[11px] uppercase tracking-wider font-medium">
									阅读时间
								</span>
							</div>
							<div className="flex-1 flex items-center gap-2">
								<input
									type="number"
									value={post.readTimeInMinutes}
									onChange={(e) =>
										handlePostChange({
											readTimeInMinutes: parseInt(e.target.value) || 0,
										})
									}
									className="w-12 bg-transparent text-xs text-foreground focus:outline-none"
								/>
								<span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold">
									分钟
								</span>
								<button
									onClick={handleCalculateReadTime}
									disabled={isCalculatingReadTime}
									className="p-1.5 text-muted-foreground/50 hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
									title="自动计算"
								>
									{isCalculatingReadTime ? (
										<Loader2 size={12} className="animate-spin" />
									) : (
										<Sparkles size={12} />
									)}
								</button>
							</div>
						</div>

						{/* Property Row: Summary */}
						<div className="group flex items-start py-3 px-2 hover:bg-accent rounded-sm transition-colors">
							<div className="w-32 flex items-center gap-2 text-muted-foreground pt-1">
								<FileText size={14} strokeWidth={1.5} />
								<span className="text-[11px] uppercase tracking-wider font-medium">
									摘要
								</span>
							</div>
							<div className="flex-1 flex flex-col gap-2">
								<TextareaAutosize
									value={post.summary || ""}
									onChange={(e) =>
										handlePostChange({ summary: e.target.value })
									}
									placeholder="简单介绍一下内容..."
									className="w-full bg-transparent text-xs leading-relaxed text-foreground focus:outline-none resize-none placeholder:text-muted-foreground/30"
								/>
								<button
									onClick={handleGenerateSummary}
									disabled={isGeneratingSummary}
									className="w-fit flex items-center gap-2 px-2 py-1 bg-accent text-[9px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground rounded-sm transition-all"
								>
									{isGeneratingSummary ? (
										<Loader2 size={10} className="animate-spin" />
									) : (
										<Sparkles size={10} />
									)}
									<span>
										{isGeneratingSummary ? "生成中..." : "AI 生成摘要"}
									</span>
								</button>
							</div>
						</div>
					</div>

					{/* Editor Area */}
					<div className="min-h-[60vh] pb-32">
						<Editor
							content={post.contentJson ?? ""}
							onChange={handleContentChange}
						/>
					</div>
				</div>
			</div>

			{/* Floating Status Bar (Bottom Right) */}
			<div className="fixed bottom-8 right-8 z-40 flex items-center gap-4 px-6 py-3 bg-background/80 backdrop-blur-md border border-border/50 rounded-full shadow-2xl">
				<div className="flex items-center gap-4 border-r border-border/50 pr-4 text-[10px] font-medium text-muted-foreground">
					<div className="flex items-center gap-1">
						<span className="text-foreground">
							{JSON.stringify(post.contentJson || "").length}
						</span>
						<span className="opacity-40">字符</span>
					</div>
					<div className="flex items-center gap-1">
						<span className="text-foreground">
							{Math.ceil(JSON.stringify(post.contentJson || "").length / 5)}
						</span>
						<span className="opacity-40">单词</span>
					</div>
				</div>

				<div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
					{saveStatus === "ERROR" ? (
						<div className="flex items-center gap-2 text-red-500">
							<X size={14} />
							<span>错误</span>
						</div>
					) : saveStatus === "SAVING" ? (
						<div className="flex items-center gap-2 text-muted-foreground">
							<RefreshCw size={14} className="animate-spin" />
							<span>正在保存</span>
						</div>
					) : saveStatus === "PENDING" ? (
						<div className="flex items-center gap-2 text-amber-500">
							<div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
							<span>已修改</span>
						</div>
					) : (
						<div className="flex items-center gap-2 text-muted-foreground/30">
							<Check size={14} strokeWidth={3} />
							<span className="opacity-50">
								{lastSaved
									? lastSaved.toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})
									: "已同步"}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
