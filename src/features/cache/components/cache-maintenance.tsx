import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { invalidateSiteCacheFn } from "@/features/cache/cache.api";

export function CacheMaintenance() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInvalidate = () => {
    setIsModalOpen(false);
    toast.promise(invalidateSiteCacheFn, {
      loading: "正在重置全站缓存...",
      success: "全站缓存重置成功",
      error: "缓存重置失败",
    });
  };
  return (
    <div className="group flex flex-col sm:flex-row py-6 gap-6 sm:gap-8 border-b border-border/30">
      <div className="w-40 shrink-0 flex flex-col gap-1.5">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
          全站缓存
        </span>
      </div>
      <div className="flex-1 space-y-8">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-serif font-medium text-foreground tracking-tight">
              全站缓存重置
            </h4>
            <div className="w-1.5 h-1.5 bg-red-500 animate-pulse" />
          </div>
          <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
            清除全站 CDN 缓存及 KV
            数据缓存。硬重置操作，请仅在数据严重不同步时使用。
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-8 px-4 text-[10px] font-mono uppercase tracking-widest rounded-none gap-2 bg-red-600 hover:bg-red-700 text-white"
        >
          <Trash2 size={12} />[ 重置缓存 ]
        </Button>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleInvalidate}
        title="确认重置全站缓存"
        message="该操作将清除 CDN 及 KV 中的所有缓存数据。是否确认执行？"
        confirmLabel="立即重置"
      />
    </div>
  );
}
