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
    <div className="group flex flex-col sm:flex-row py-10 gap-8 sm:gap-0 border-b border-border/30">
      <div className="w-56 shrink-0 flex flex-col gap-2.5">
        <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-muted-foreground">
          全站缓存
        </span>
      </div>
      <div className="flex-1 space-y-8">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="text-base font-medium text-foreground tracking-tight">
              全站缓存重置
            </h4>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          </div>
          <p className="text-[13px] text-muted-foreground leading-relaxed font-light">
            清除全站 CDN 缓存及 KV
            数据缓存。此操作属于硬重置，会导致所有页面首次加载变慢，请仅在数据严重不同步时使用。
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-12 px-10 text-[10px] uppercase tracking-[0.25em] font-bold shadow-xl shadow-red-500/10 rounded-sm gap-4 bg-red-600 hover:bg-red-700 text-white"
        >
          <Trash2 size={14} />
          重置全站缓存
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
