import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  trend,
  className,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-border/30 bg-background p-6 flex flex-col justify-between h-32 transition-all hover:border-border/60",
        className,
      )}
    >
      <div className="flex justify-between items-start">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
          {icon}
          {label}
        </div>
        {trend && (
          <div className="text-[10px] font-mono text-muted-foreground">
            {trend}
          </div>
        )}
      </div>
      <div className="text-4xl font-serif font-medium tracking-tight text-foreground mt-auto">
        {value}
      </div>
    </div>
  );
}
