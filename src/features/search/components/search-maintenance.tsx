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
    <div className="group flex flex-col sm:flex-row py-6 gap-6 sm:gap-8 border-b border-border/30">
      <div className="w-40 shrink-0 flex flex-col gap-1.5">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
          搜索索引
        </span>
      </div>
      <div className="flex-1 space-y-8">
        <div className="max-w-xl">
          <h4 className="text-sm font-serif font-medium text-foreground mb-2 tracking-tight">
            重建搜索映射
          </h4>
          <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
            全量同步数据库记录至搜索映射表。建议在手动修改数据库或批量录入后执行。
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={isIndexing}
          className="h-8 px-4 text-[10px] font-mono uppercase tracking-widest rounded-none gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          {isIndexing ? (
            <RefreshCw size={12} className="animate-spin" />
          ) : (
            <Database size={12} />
          )}
          [ 启动重建 ]
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
