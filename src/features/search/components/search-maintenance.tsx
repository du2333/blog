import { Database, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildSearchIndexFn } from "@/features/search/search.api";
import ConfirmationModal from "@/components/ui/confirmation-modal";

export function SearchMaintenance() {
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
    <div className="group flex flex-col sm:flex-row py-10 gap-8 sm:gap-0 border-b border-border/30">
      <div className="w-56 shrink-0 flex flex-col gap-2.5">
        <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-muted-foreground">
          搜索索引
        </span>
      </div>
      <div className="flex-1 space-y-8">
        <div className="max-w-xl">
          <h4 className="text-base font-medium text-foreground mb-3 tracking-tight">
            重建搜索映射
          </h4>
          <p className="text-[13px] text-muted-foreground leading-relaxed font-light">
            全量同步数据库记录至搜索映射表。建议在手动修改数据库或执行大批量数据录入后运行此操作，以确保全局检索的准确性。
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={isIndexing}
          className="h-12 px-10 text-[10px] uppercase tracking-[0.25em] font-bold shadow-xl shadow-black/10 rounded-sm gap-4"
        >
          {isIndexing ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Database size={14} />
          )}
          启动索引重建
        </Button>
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
