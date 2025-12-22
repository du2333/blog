import { createFileRoute } from "@tanstack/react-router";
import { Activity, Database, Shield, Users } from "lucide-react";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { ADMIN_STATS } from "@/lib/constants";

export const Route = createFileRoute("/admin/")({
	component: DashboardOverview,
	head: () => ({
		meta: [
			{
				title: "概览",
			},
		],
	}),
});

function DashboardOverview() {
	return (
		<div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
			<header className="flex justify-between items-end">
				<div className="space-y-1">
					<h1 className="text-4xl font-serif font-medium tracking-tight">
						概览
					</h1>
					<p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-mono">
						System Insight
					</p>
				</div>
				<div className="text-[9px] font-mono text-zinc-300 dark:text-zinc-700 uppercase tracking-widest hidden sm:block">
					Auto-Sync Active
				</div>
			</header>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard
					label="访客统计"
					value={ADMIN_STATS.totalViews.toLocaleString()}
					icon={<Users size={18} strokeWidth={1.5} />}
					trend="+12% Since last month"
					color="zinc"
				/>
				<StatCard
					label="系统稳定性"
					value={`${ADMIN_STATS.etherStability}%`}
					icon={<Shield size={18} strokeWidth={1.5} />}
					trend="Operational"
					color="zinc"
				/>
				<StatCard
					label="数据库容量"
					value={ADMIN_STATS.databaseSize}
					icon={<Database size={18} strokeWidth={1.5} />}
					trend="Growing stable"
					color="zinc"
				/>
				<StatCard
					label="性能指标"
					value="Good"
					icon={<Activity size={18} strokeWidth={1.5} />}
					trend="Clear of issues"
					color="zinc"
				/>
			</div>

			{/* Visuals Row */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
				{/* Main Graph */}
				<div className="lg:col-span-2 space-y-6">
					<div className="flex justify-between items-baseline border-b border-zinc-100 dark:border-white/5 pb-4">
						<h3 className="text-sm font-medium uppercase tracking-[0.2em]">
							流量趋势
						</h3>
						<span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
							Analysis // 24H
						</span>
					</div>

					<div className="h-72 w-full flex items-end gap-1.5 md:gap-3 group/chart relative">
						{Array.from({ length: 24 }).map((_, i) => (
							<div
								key={i}
								className="flex-1 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-all duration-500 relative group/bar rounded-t-[1px]"
								style={{ height: `${Math.random() * 70 + 10}%` }}
							>
								<div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] py-1 px-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 pointer-events-none rounded-sm">
									{Math.floor(Math.random() * 100)}
								</div>
							</div>
						))}

						{/* Minimal Background Grid */}
						<div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
							<div className="border-t border-zinc-100/50 dark:border-white/2 w-full"></div>
							<div className="border-t border-zinc-100/50 dark:border-white/2 w-full"></div>
							<div className="border-t border-zinc-100/50 dark:border-white/2 w-full"></div>
							<div className="h-0"></div>
						</div>
					</div>
					<div className="flex justify-between text-[9px] text-zinc-400 font-mono uppercase tracking-[0.3em]">
						<span>00:00</span>
						<span>12:00</span>
						<span>23:59</span>
					</div>
				</div>

				{/* Activity Log */}
				<div className="space-y-6">
					<div className="flex justify-between items-baseline border-b border-zinc-100 dark:border-white/5 pb-4">
						<h3 className="text-sm font-medium uppercase tracking-[0.2em]">
							系统日志
						</h3>
					</div>
					<div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
						{[
							{
								type: "success",
								text: "Auth success: User established",
								time: "Just now",
							},
							{
								type: "info",
								text: "Database backup completed",
								time: "12m ago",
							},
							{
								type: "info",
								text: "Cache synchronized (12ms)",
								time: "45m ago",
							},
							{
								type: "warning",
								text: "Low bandwidth on storage node",
								time: "1h ago",
							},
							{
								type: "success",
								text: "Article published: #2049",
								time: "3h ago",
							},
							{ type: "info", text: "New media asset indexed", time: "5h ago" },
						].map((log, i) => (
							<div key={i} className="flex gap-4 group cursor-default">
								<div
									className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
										log.type === "success"
											? "bg-green-500"
											: log.type === "warning"
												? "bg-amber-500"
												: "bg-zinc-300 dark:bg-zinc-700"
									}`}
								></div>
								<div className="space-y-1">
									<p className="text-xs font-light leading-snug group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
										{log.text}
									</p>
									<p className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
										{log.time}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
