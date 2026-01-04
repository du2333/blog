import { Button } from "@/components/ui/button";

export function CacheMaintenance() {
  return (
    <div className="group flex flex-col sm:flex-row py-10 gap-8 sm:gap-0 border-b border-border/30 opacity-40 grayscale">
      <div className="w-56 shrink-0 flex flex-col gap-2.5">
        <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-muted-foreground">
          边缘缓存
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
            清除全站分布式缓存及边缘节点镜像。此操作将导致短时间内的页面加载速度下降，仅建议在系统架构调整后使用。
          </p>
        </div>
        <Button
          disabled
          variant="outline"
          className="h-12 px-10 text-[10px] uppercase tracking-[0.25em] font-bold text-muted-foreground rounded-sm"
        >
          服务暂不可用
        </Button>
      </div>
    </div>
  );
}
