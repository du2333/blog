import { StatCard } from "@/components/admin/dashboard/stat-card";
import { ADMIN_STATS } from "@/lib/constants";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, AlertTriangle, Database, Users } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <h1 className="text-3xl font-black font-sans uppercase text-white italic">
          System <span className="text-zzz-orange">Overview</span>
        </h1>
        <div className="text-xs font-mono text-gray-500">LAST_UPDATE: NOW</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Views"
          value={ADMIN_STATS.totalViews.toLocaleString()}
          icon={<Users size={18} className="text-zzz-cyan" />}
          trend="+12%"
          color="cyan"
        />
        <StatCard
          label="Ether Stability"
          value={`${ADMIN_STATS.etherStability}%`}
          icon={<Activity size={18} className="text-zzz-lime" />}
          trend="STABLE"
          color="lime"
        />
        <StatCard
          label="Database Size"
          value={ADMIN_STATS.databaseSize}
          icon={<Database size={18} className="text-zzz-orange" />}
          trend="GROWING"
          color="orange"
        />
        <StatCard
          label="Issues"
          value="0"
          icon={<AlertTriangle size={18} className="text-red-500" />}
          trend="CLEAR"
          color="red"
        />
      </div>

      {/* Visuals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Graph */}
        <div className="lg:col-span-2 bg-zzz-dark border border-zzz-gray p-6 relative overflow-hidden">
          <div className="flex justify-between mb-6">
            <h3 className="font-bold text-sm uppercase text-white flex items-center gap-2">
              <Activity size={14} className="text-zzz-lime" />
              Traffic Analysis
            </h3>
          </div>

          {/* CSS Graph Placeholder */}
          <div className="h-64 w-full flex items-end gap-2 border-b border-zzz-gray/30 pb-2 relative">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-zzz-lime/20 hover:bg-zzz-lime transition-colors relative group"
                style={{ height: `${Math.random() * 80 + 10}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-zzz-lime text-[10px] px-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {Math.floor(Math.random() * 100)}
                </div>
              </div>
            ))}
            {/* Grid Lines */}
            <div className="absolute inset-0 border-t border-dashed border-zzz-gray/20 top-1/4"></div>
            <div className="absolute inset-0 border-t border-dashed border-zzz-gray/20 top-2/4"></div>
            <div className="absolute inset-0 border-t border-dashed border-zzz-gray/20 top-3/4"></div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono uppercase">
            <span>00:00</span>
            <span>12:00</span>
            <span>23:59</span>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-black border border-zzz-gray p-0 flex flex-col">
          <div className="p-4 border-b border-zzz-gray bg-zzz-dark/50">
            <h3 className="font-bold text-sm uppercase text-white">
              System Log
            </h3>
          </div>
          <div className="flex-1 p-4 font-mono text-[10px] space-y-2 text-gray-400 overflow-y-auto max-h-[300px] custom-scrollbar">
            <div className="text-zzz-lime">
              &gt;&gt; AUTH_SUCCESS: USER_PHAETHON
            </div>
            <div>&gt;&gt; DB_BACKUP_INIT... OK</div>
            <div>&gt;&gt; CACHE_CLEAR: 12ms</div>
            <div className="text-zzz-orange">
              &gt;&gt; WARN: HIGH_LATENCY [NODE_04]
            </div>
            <div>&gt;&gt; POST_PUBLISHED: ID_2049</div>
            <div>&gt;&gt; MEDIA_UPLOAD: img_hollow.png</div>
            <div>&gt;&gt; SYSTEM_CHECK... OK</div>
            <div className="animate-pulse">&gt;&gt; _</div>
          </div>
        </div>
      </div>
    </div>
  );
}
