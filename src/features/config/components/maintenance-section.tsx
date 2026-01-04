import { CacheMaintenance } from "@/features/cache/components/cache-maintenance";
import { SearchMaintenance } from "@/features/search/components/search-maintenance";

export function MaintenanceSection() {
  return (
    <div className="space-y-16">
      {/* Section Header */}
      <div className="flex items-end justify-between border-b border-border/50 pb-10">
        <div className="space-y-1">
          <h3 className="text-4xl font-serif font-medium text-foreground">
            数据维护
          </h3>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold opacity-70">
            System Maintenance & Data Synchronization
          </p>
        </div>
      </div>

      <div className="space-y-px">
        {/* Property Row: Search Index */}
        <SearchMaintenance />

        {/* Property Row: Cache Management */}
        <CacheMaintenance />
      </div>
    </div>
  );
}
