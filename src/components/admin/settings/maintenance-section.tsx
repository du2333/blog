import ConfirmationModal from "@/components/ui/confirmation-modal";
import {
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
    <div className="space-y-12">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-white/[0.03] flex items-center justify-center text-zinc-400">
          <Server size={22} strokeWidth={1.2} />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-serif font-medium text-zinc-950 dark:text-zinc-50">系统维护</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 font-light">管理全局数据状态与底层服务维护</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Index Module */}
        <div className="bg-white dark:bg-[#0c0c0c] border border-zinc-100 dark:border-white/5 p-10 rounded-sm space-y-8 flex flex-col group transition-all duration-500">
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-400 transition-all duration-500">
                <Search size={20} strokeWidth={1.2} />
              </div>
              <div className="text-[9px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/5 px-3 py-1 rounded-full">
                ADMIN_ONLY
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-serif font-medium">搜索索引重建</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
                全量同步数据库记录至搜索映射表。建议在手动修改数据库或执行大批量数据录入后运行此操作。
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isIndexing}
            className="w-full flex items-center justify-center gap-3 py-5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[10px] uppercase tracking-[0.3em] font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-black/10"
          >
            {isIndexing ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Database size={16} strokeWidth={1.5} />
            )}
            {isIndexing ? "同步中" : "启动索引重建"}
          </button>
        </div>

        {/* Cache Module (Locked/Disabled State) */}
        <div className="bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-white/5 p-10 rounded-sm space-y-8 flex flex-col opacity-40 grayscale">
          <div className="flex-1 space-y-6">
            <div className="p-3 rounded-full bg-white dark:bg-zinc-900 text-zinc-400 w-fit">
              <RefreshCw size={20} strokeWidth={1.2} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-serif font-medium">全局缓存清理</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                清除全站分布式缓存及边缘节点镜像。此操作将导致短时间内的页面加载速度下降。
              </p>
            </div>
          </div>
          
          <button
            disabled
            className="w-full py-5 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 dark:text-zinc-700"
          >
            服务暂不可用
          </button>
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
