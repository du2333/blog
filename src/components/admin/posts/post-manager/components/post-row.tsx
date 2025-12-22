import { ClientOnly, useNavigate } from "@tanstack/react-router";
import { Calendar, Edit3, Eye, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/utils";

import { isPostPubliclyViewable, type PostListItem } from "../types";

interface PostRowProps {
	post: PostListItem;
	onDelete: (post: PostListItem) => void;
}

export function PostRow({ post, onDelete }: PostRowProps) {
	const navigate = useNavigate();
	const [showMobileActions, setShowMobileActions] = useState(false);

	const viewTitle = !isPostPubliclyViewable(post)
		? post.status === "draft"
			? "草稿无法直接预览"
			: "计划发布 - 尚未公开"
		: "查看文章";

	const handleEdit = () => {
		navigate({
			to: "/admin/posts/edit/$id",
			params: { id: String(post.id) },
		});
	};

	const handleView = () => {
		if (isPostPubliclyViewable(post)) {
			navigate({ to: "/post/$slug", params: { slug: post.slug } });
		}
	};

	return (
		<div className="group bg-white dark:bg-transparent px-4 sm:px-6 py-6 sm:py-8 flex flex-col md:grid md:grid-cols-12 gap-4 sm:gap-6 items-start md:items-center hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all duration-500 relative">
			{/* ID & Status (Combined for mobile) */}
			<div className="md:col-span-1 flex items-center justify-between w-full md:block">
				<span className="font-mono text-zinc-300 dark:text-zinc-700 text-[10px] tracking-widest">
					#{post.id}
				</span>
				<div className="md:hidden flex items-center gap-3">
					<StatusBadge status={post.status} />
					<button
						onClick={() => setShowMobileActions(!showMobileActions)}
						className="p-2 text-zinc-400"
					>
						<MoreVertical size={18} />
					</button>
				</div>
			</div>

			{/* Title & Summary */}
			<div
				className="md:col-span-6 min-w-0 cursor-pointer group/title w-full"
				onClick={handleEdit}
			>
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
					<h3 className="text-zinc-900 dark:text-zinc-100 font-serif text-xl sm:text-2xl leading-tight group-hover/title:translate-x-1 transition-transform duration-500 truncate min-w-0 flex-1">
						{post.title}
					</h3>
					<div className="hidden md:block shrink-0">
						<StatusBadge status={post.status} />
					</div>
				</div>
				<div className="text-xs text-zinc-400 dark:text-zinc-600 font-normal truncate max-w-2xl">
					{post.summary}
				</div>
			</div>

			{/* Category & Date (Responsive stacking) */}
			<div className="md:col-span-4 flex md:grid md:grid-cols-2 items-center gap-6 w-full text-zinc-400">
				<div className="flex items-center gap-2">
					<div className="w-1 h-1 rounded-full bg-current opacity-40 md:hidden" />
					<span className="text-[10px] uppercase tracking-[0.3em] font-medium">
						{post.category}
					</span>
				</div>
				<div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
					<Calendar size={10} strokeWidth={1.5} className="opacity-40" />
					<ClientOnly fallback={<span>-</span>}>
						{formatDate(post.createdAt)}
					</ClientOnly>
				</div>
			</div>

			{/* Actions (Desktop: Hover, Mobile: Expandable) */}
			<div
				className={`
        md:col-span-1 flex items-center justify-end gap-1 w-full md:w-auto
        ${showMobileActions ? "flex mt-4 pt-4 border-t border-zinc-100 dark:border-white/5" : "hidden md:flex"}
        md:opacity-0 md:group-hover:opacity-100 md:translate-x-4 md:group-hover:translate-x-0 transition-all duration-500
      `}
			>
				<button
					disabled={!isPostPubliclyViewable(post)}
					onClick={handleView}
					className="p-3 md:p-2 text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors disabled:opacity-10"
					title={viewTitle}
				>
					<Eye size={18} strokeWidth={1.5} />
				</button>
				<button
					onClick={handleEdit}
					className="p-3 md:p-2 text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
					title="编辑"
				>
					<Edit3 size={18} strokeWidth={1.5} />
				</button>
				<button
					className="p-3 md:p-2 text-zinc-400 hover:text-red-500 transition-colors"
					title="删除"
					onClick={() => onDelete(post)}
				>
					<Trash2 size={18} strokeWidth={1.5} />
				</button>
			</div>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	return (
		<span
			className={`text-[9px] px-2 py-0.5 uppercase tracking-[0.2em] font-bold rounded-full border ${
				status === "published"
					? "border-green-500/20 text-green-500 bg-green-500/5"
					: status === "draft"
						? "border-zinc-400/20 text-zinc-400 bg-zinc-400/5"
						: "border-amber-500/20 text-amber-500 bg-amber-500/5"
			}`}
		>
			{status === "published"
				? "已发布"
				: status === "draft"
					? "草稿"
					: "计划中"}
		</span>
	);
}
