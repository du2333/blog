import { Database, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { buildSearchIndexFn } from "@/features/search/search.api";

export function MaintenanceSection() {
	const [isIndexing, setIsIndexing] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleRebuild = () => {
		setIsModalOpen(false);
		setIsIndexing(true);
		toast.promise(buildSearchIndexFn, {
			loading: "正在重新映射索引...",
			success: ({ duration, indexed }) => {
				setIsIndexing(false);
				return `索引重建完成 (耗时 ${duration}ms, 共 ${indexed} 条数据)`;
			},
			error: "索引重建失败",
		});
	};

	return (
		<div className="space-y-16">
			{/* Section Header */}
			<div className="flex items-end justify-between border-b border-zinc-100 dark:border-white/5 pb-10">
				<div className="space-y-1">
					<h3 className="text-4xl font-serif font-medium text-zinc-950 dark:text-zinc-50">
						数据维护
					</h3>
					<p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold opacity-70">
						System Maintenance & Data Synchronization
					</p>
				</div>
			</div>

			<div className="space-y-px">
				{/* Property Row: Search Index */}
				<div className="group flex flex-col sm:flex-row py-10 gap-8 sm:gap-0 border-b border-zinc-100/60 dark:border-white/[0.02]">
					<div className="w-56 shrink-0 flex flex-col gap-2.5">
						<span className="text-[11px] uppercase tracking-[0.25em] font-bold text-zinc-500 dark:text-zinc-400">
							搜索索引
						</span>
						<div className="w-fit text-[8px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-500/10">
							ADMIN_ONLY
						</div>
					</div>
					<div className="flex-1 space-y-8">
						<div className="max-w-xl">
							<h4 className="text-base font-medium text-zinc-950 dark:text-zinc-50 mb-3 tracking-tight">
								重建搜索映射
							</h4>
							<p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
								全量同步数据库记录至搜索映射表。建议在手动修改数据库或执行大批量数据录入后运行此操作，以确保全局检索的准确性。
							</p>
						</div>
						<button
							onClick={() => setIsModalOpen(true)}
							disabled={isIndexing}
							className="flex items-center gap-4 py-3.5 px-10 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[10px] uppercase tracking-[0.25em] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-black/10 rounded-sm"
						>
							{isIndexing ? (
								<RefreshCw size={14} className="animate-spin" />
							) : (
								<Database size={14} />
							)}
							启动索引重建
						</button>
					</div>
				</div>

				{/* Property Row: Cache Management */}
				<div className="group flex flex-col sm:flex-row py-10 gap-8 sm:gap-0 border-b border-zinc-100/60 dark:border-white/[0.02] opacity-40 grayscale">
					<div className="w-56 shrink-0 flex flex-col gap-2.5">
						<span className="text-[11px] uppercase tracking-[0.25em] font-bold text-zinc-500 dark:text-zinc-400">
							边缘缓存
						</span>
					</div>
					<div className="flex-1 space-y-8">
						<div className="max-w-xl">
							<div className="flex items-center gap-3 mb-3">
								<h4 className="text-base font-medium text-zinc-950 dark:text-zinc-50 tracking-tight">
									全局缓存清理
								</h4>
								<div className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-pulse" />
							</div>
							<p className="text-[13px] text-zinc-500 leading-relaxed font-light">
								清除全站分布式缓存及边缘节点镜像。此操作将导致短时间内的页面加载速度下降，仅建议在系统架构调整后使用。
							</p>
						</div>
						<button
							disabled
							className="py-3.5 px-10 border border-zinc-200 dark:border-white/10 text-[10px] uppercase tracking-[0.25em] font-bold text-zinc-400 rounded-sm"
						>
							服务暂不可用
						</button>
					</div>
				</div>
			</div>

			<ConfirmationModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onConfirm={handleRebuild}
				title="确认索引重建"
				message="该操作将全量扫描所有数据库日志并重新建立搜索映射。在执行过程中，前端搜索功能可能出现短暂不可用或延迟。是否确认执行？"
				confirmLabel="执行重建"
			/>
		</div>
	);
}
