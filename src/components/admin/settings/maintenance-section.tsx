import ConfirmationModal from "@/components/ui/confirmation-modal";
import {
  AlertTriangle,
  Database,
  RefreshCw,
  Search,
  Server,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
    <div className="space-y-8">
      <h2 className="text-xl font-serif font-medium tracking-tight flex items-center gap-3">
        <Server size={20} strokeWidth={1.5} className="text-zinc-400" />
        系统维护
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Index Module */}
        <div className="bg-white dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 p-8 rounded-sm space-y-6 flex flex-col group hover:border-zinc-200 dark:hover:border-white/10 transition-all duration-500">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-zinc-50 dark:bg-white/5 text-zinc-400 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-all duration-500">
                <Search size={18} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-medium tracking-tight uppercase">搜索索引重建</h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
              同步全站数据库记录至搜索映射表。建议在手动修改数据库或执行大批量数据录入后运行此操作。
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/5 px-3 py-1 rounded-full w-fit">
              <AlertTriangle size={10} strokeWidth={2.5} />
              仅限管理员操作
            </div>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isIndexing}
            className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] uppercase tracking-[0.2em] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isIndexing ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Database size={16} strokeWidth={1.5} />
            )}
            {isIndexing ? "同步中..." : "启动索引重建"}
          </button>
        </div>

        {/* Cache Module (Locked/Disabled State) */}
        <div className="bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-white/5 p-8 rounded-sm space-y-6 flex flex-col opacity-40 grayscale pointer-events-none">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-current">
                <RefreshCw size={18} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-medium tracking-tight uppercase">系统缓存清理</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              清除全站分布式缓存及边缘节点镜像。此操作将导致短时间内的访问速度下降。
            </p>
          </div>
          
          <button
            disabled
            className="w-full py-4 border border-zinc-200 dark:border-zinc-800 text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-300 dark:text-zinc-700"
          >
            暂时不可用
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRebuild}
        title="确认索引重建"
        message="该操作将全量扫描所有数据库日志并重新建立搜索映射。在执行过程中，前端搜索功能可能出现短暂不可用或延迟。是否确认执行？"
        confirmLabel="启动同步协议"
      />
    </div>
  );
}
