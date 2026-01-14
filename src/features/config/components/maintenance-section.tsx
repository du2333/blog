import { CacheMaintenance } from "@/features/cache/components/cache-maintenance";
import { SearchMaintenance } from "@/features/search/components/search-maintenance";

export function MaintenanceSection() {
  return (
    <div className="space-y-16">
      <div className="space-y-px">
        {/* Property Row: Search Index */}
        <SearchMaintenance />

        {/* Property Row: Cache Management */}
        <CacheMaintenance />
      </div>
    </div>
  );
}
