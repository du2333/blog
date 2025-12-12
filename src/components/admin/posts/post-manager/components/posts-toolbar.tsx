import { Filter, Search } from "lucide-react";

import { POST_FILTERS, type PostFilter } from "../types";

interface PostsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filter: PostFilter;
  onFilterChange: (filter: PostFilter) => void;
  filterOpen: boolean;
  onFilterOpenChange: (open: boolean) => void;
}

export function PostsToolbar({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  filterOpen,
  onFilterOpenChange,
}: PostsToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 relative z-20">
      {/* Search Input */}
      <div className="flex-1 relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          size={16}
        />
        <input
          type="text"
          placeholder="SEARCH_LOGS..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-black border border-zzz-gray text-white text-xs font-mono px-10 py-3 focus:border-zzz-lime focus:outline-none transition-colors"
        />
      </div>

      {/* Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => onFilterOpenChange(!filterOpen)}
          className={`w-full md:w-auto h-full px-6 py-3 md:py-0 border bg-zzz-dark flex items-center justify-between md:justify-start gap-2 text-xs font-bold uppercase transition-colors ${
            filterOpen
              ? "border-zzz-lime text-white"
              : "border-zzz-gray text-gray-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <Filter size={14} />
            {filter === "ALL" ? "Filter" : filter}
          </div>
        </button>

        {filterOpen && (
          <div className="absolute right-0 top-full mt-2 w-full md:w-48 bg-zzz-black border border-zzz-gray shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95 duration-200 clip-corner-bl">
            <div className="p-1">
              {POST_FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onFilterChange(status);
                    onFilterOpenChange(false);
                  }}
                  className={`w-full text-left px-4 py-3 md:py-2 text-xs font-mono font-bold hover:bg-zzz-gray/30 ${
                    filter === status ? "text-zzz-lime" : "text-gray-400"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
