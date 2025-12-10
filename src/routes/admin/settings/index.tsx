import { createFileRoute } from "@tanstack/react-router";
import {
  Globe,
  Cpu,
  Server,
  Search,
  AlertTriangle,
  RefreshCw,
  Database,
} from "lucide-react";
import TechButton from "@/components/ui/tech-button";
import { buildSearchIndexFn } from "@/features/search/search.api";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isIndexing, setIsIndexing] = useState(false);

  const handleRebuildIndex = () => {
    setIsIndexing(true);

    toast.promise(buildSearchIndexFn, {
      loading: "SCANNING_SECTOR_DATA...",
      success: ({ duration, indexed }) => {
        setIsIndexing(false);
        return `SEARCH INDEX RECONSTRUCTED IN ${duration}ms FOR ${indexed} ENTRIES`;
      },
      error: "INDEXING_FAILED",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-4xl">
      <div className="flex justify-between items-end border-b border-zzz-gray pb-4">
        <div>
          <h1 className="text-3xl font-black font-sans uppercase text-white italic">
            System <span className="text-zzz-cyan">Config</span>
          </h1>
          <p className="text-xs font-mono text-gray-500 mt-1">
            GLOBAL_SETTINGS // MAINTENANCE_PROTOCOLS
          </p>
        </div>
      </div>

      {/* --- General Settings (Mock) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zzz-dark border border-zzz-gray p-6 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4 text-zzz-lime">
            <Globe size={18} />
            <h3 className="font-bold font-sans uppercase text-sm tracking-wider">
              Site Metadata
            </h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-500 uppercase">
                Proxy Name
              </label>
              <input
                disabled
                value="Proxy's Archive"
                className="w-full bg-black border border-zzz-gray text-xs font-mono px-3 py-2 text-gray-400 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-500 uppercase">
                Environment
              </label>
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <div className="w-2 h-2 bg-zzz-lime rounded-full animate-pulse"></div>
                PRODUCTION
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zzz-dark border border-zzz-gray p-6 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4 text-zzz-cyan">
            <Cpu size={18} />
            <h3 className="font-bold font-sans uppercase text-sm tracking-wider">
              Render Engine
            </h3>
          </div>
          <div className="space-y-2 font-mono text-xs text-gray-400">
            <div className="flex justify-between border-b border-zzz-gray/30 pb-2">
              <span>React Version</span>
              <span className="text-white">18.3.1</span>
            </div>
            <div className="flex justify-between border-b border-zzz-gray/30 pb-2">
              <span>Tailwind CSS</span>
              <span className="text-white">Enabled</span>
            </div>
            <div className="flex justify-between pb-2">
              <span>Tiptap Editor</span>
              <span className="text-white">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- DATA MAINTENANCE ZONE --- */}
      <div className="mt-12">
        <h2 className="text-xl font-bold font-sans uppercase text-white mb-6 flex items-center gap-2">
          <Server size={20} className="text-zzz-orange" />
          Data Maintenance
        </h2>

        <div className="bg-black border border-zzz-gray p-1">
          {/* Search Index Module */}
          <div className="bg-zzz-dark/30 p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-zzz-gray border-dashed last:border-0 relative overflow-hidden">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-zzz-gray/20 p-2 rounded text-white">
                  <Search size={20} />
                </div>
                <h3 className="font-bold text-white uppercase tracking-wider">
                  Search Index
                </h3>
              </div>
              <p className="text-xs font-mono text-gray-500 leading-relaxed max-w-lg">
                Re-scan all database entries (posts & media) to rebuild the
                search index map.
                <span className="text-zzz-orange block mt-1">
                  <AlertTriangle size={10} className="inline mr-1" />
                  ONLY USE DURING DEVELOPMENT OR AFTER BULK IMPORTS.
                </span>
              </p>
            </div>

            <div className="relative z-10">
              <TechButton
                variant="secondary"
                onClick={handleRebuildIndex}
                disabled={isIndexing}
                className="border-zzz-orange text-zzz-orange hover:bg-zzz-orange hover:text-black w-48"
                icon={
                  isIndexing ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Database size={16} />
                  )
                }
              >
                {isIndexing ? "BUILDING..." : "REBUILD INDEX"}
              </TechButton>
            </div>

            {/* Background Deco */}
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-stripe-pattern opacity-5 pointer-events-none"></div>
          </div>

          {/* Cache Clear Module (Mock) */}
          <div className="bg-zzz-dark/30 p-6 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-zzz-gray/20 p-2 rounded text-white">
                  <RefreshCw size={20} />
                </div>
                <h3 className="font-bold text-white uppercase tracking-wider">
                  System Cache
                </h3>
              </div>
              <p className="text-xs font-mono text-gray-500">
                Purge local storage and session data. Will force a re-login.
              </p>
            </div>
            <div>
              <button
                disabled
                className="px-6 py-2 border border-zzz-gray text-gray-600 font-mono text-xs font-bold uppercase cursor-not-allowed"
              >
                PURGE_CACHE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
