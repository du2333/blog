import { createFileRoute } from "@tanstack/react-router";
import {
  Grid,
  Image as ImageIcon,
  List,
  Search,
  Upload,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/media/")({
  component: MediaLibrary,
});

function MediaLibrary() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zzz-gray pb-6">
        <div>
          <h1 className="text-2xl font-black font-sans uppercase text-white mb-1">
            Memory <span className="text-zzz-cyan">Bank</span>
          </h1>
          <p className="text-gray-500 font-mono text-xs">
            MEDIA_STORAGE // FILE_MANAGEMENT
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-zzz-cyan text-black font-bold text-xs uppercase tracking-wider hover:bg-zzz-cyan/80 transition-colors">
          <Upload size={16} />
          Upload Files
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 relative w-full md:max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="SEARCH_FILES..."
            className="w-full bg-zzz-black border border-zzz-gray pl-10 pr-4 py-2 text-sm font-mono text-white placeholder:text-gray-600 focus:border-zzz-cyan focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-zzz-black border border-zzz-gray px-4 py-2 text-sm font-mono text-gray-400 focus:border-zzz-cyan focus:outline-none">
            <option>ALL_TYPES</option>
            <option>IMAGES</option>
            <option>DOCUMENTS</option>
          </select>
          <div className="flex border border-zzz-gray">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-zzz-cyan text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 border-l border-zzz-gray transition-colors ${
                viewMode === "list"
                  ? "bg-zzz-cyan text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-zzz-gray hover:border-zzz-cyan p-8 text-center transition-colors cursor-pointer group">
        <div className="p-4 bg-zzz-gray/10 rounded-full inline-block mb-4 group-hover:bg-zzz-cyan/10 transition-colors">
          <Upload size={32} className="text-gray-600 group-hover:text-zzz-cyan transition-colors" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          DROP FILES HERE
        </h3>
        <p className="text-gray-500 text-sm font-mono">
          OR_CLICK_TO_BROWSE // MAX_SIZE: 10MB
        </p>
      </div>

      {/* Media Grid/List Placeholder */}
      <div className="bg-zzz-black border border-zzz-gray p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-zzz-gray/10 rounded-full mb-4">
            <ImageIcon size={32} className="text-gray-600" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            MEMORY BANK EMPTY
          </h3>
          <p className="text-gray-500 text-sm font-mono mb-6">
            No files stored. Upload your first file to initialize storage.
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-zzz-cyan text-zzz-cyan font-bold text-xs uppercase tracking-wider hover:bg-zzz-cyan hover:text-black transition-colors">
            <Upload size={16} />
            Upload First File
          </button>
        </div>
      </div>

      {/* Storage Info */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-gray-600 border-t border-zzz-gray pt-6">
        <div>STORAGE_USED: 0 MB / UNLIMITED</div>
        <div className="flex items-center gap-4">
          <span>TOTAL_FILES: 0</span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-zzz-lime rounded-full animate-pulse"></div>
            STORAGE: ONLINE
          </span>
        </div>
      </div>
    </div>
  );
}
