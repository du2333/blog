import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { invalidateCDNCacheFn } from "@/features/cache/cache.api";

export function CacheMaintenance() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInvalidate = () => {
    setIsModalOpen(false);
    toast.promise(invalidateCDNCacheFn, {
      loading: "正在清除CDN缓存...",
      success: "CDN缓存清除成功",
      error: "CDN缓存清除失败",
    });
  };
  return (
    <div className="group flex flex-col sm:flex-row py-10 gap-8 sm:gap-0 border-b border-border/30">
      <div className="w-56 shrink-0 flex flex-col gap-2.5">
        <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-muted-foreground">
          CDN缓存
        </span>
      </div>
      <div className="flex-1 space-y-8">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="text-base font-medium text-foreground tracking-tight">
              全局缓存清理
            </h4>
            <div className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" />
          </div>
          <p className="text-[13px] text-muted-foreground leading-relaxed font-light">
            清除全站CDN缓存。此操作将导致短时间内的页面加载速度下降，仅建议在系统架构调整后使用。
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-12 px-10 text-[10px] uppercase tracking-[0.25em] font-bold shadow-xl shadow-black/10 rounded-sm gap-4"
        >
          <Trash2 size={14} />  
          清除CDN缓存
        </Button>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleInvalidate}
        title="确认清除CDN缓存"
        message="该操作将清除全站CDN缓存。是否确认执行？"
        confirmLabel="执行清除"
      />
    </div>
  );
}
