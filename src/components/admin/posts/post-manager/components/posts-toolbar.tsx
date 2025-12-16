import {
  ArrowUpDown,
  Calendar,
  ChevronRight,
  Filter,
  Search,
  Tag,
  X,
} from "lucide-react";
import { useState } from "react";

import {
  CATEGORY_FILTERS,
  STATUS_FILTERS,
  type CategoryFilter,
  type SortDirection,
  type StatusFilter,
} from "../types";

type DropdownType = "CATEGORY" | "STATUS" | "SORT" | null;

interface PostsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  category: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  sortDir: SortDirection;
  onSortChange: (dir: SortDirection) => void;
  onResetFilters: () => void;
}

export function PostsToolbar({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  sortDir,
  onSortChange,
  onResetFilters,
}: PostsToolbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

  const hasActiveFilters =
    category !== "ALL" ||
    status !== "ALL" ||
    sortDir !== "DESC" ||
    searchTerm !== "";

  return (
    <div className="flex flex-col xl:flex-row gap-4 mb-6 relative z-20 bg-zzz-dark/30 border border-zzz-gray p-2 items-start xl:items-center">
      {/* Search */}
      <div className="relative flex-1 w-full xl:w-auto">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          size={14}
        />
        <input
          type="text"
          placeholder="SEARCH_LOGS (TITLE)..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-black border border-zzz-gray text-white text-xs font-mono pl-9 pr-3 py-2.5 focus:border-zzz-lime focus:outline-none transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filters Container */}
      <div className="flex flex-wrap gap-2 w-full xl:w-auto">
        {/* 1. Category Filter */}
        <div className="relative filter-dropdown-container">
          <button
            onClick={() =>
              setActiveDropdown(
                activeDropdown === "CATEGORY" ? null : "CATEGORY"
              )
            }
            className={`
                            h-10 px-4 border flex items-center gap-2 text-[10px] font-bold uppercase transition-all min-w-[140px] justify-between
                            ${
                              category !== "ALL"
                                ? "bg-zzz-cyan/10 border-zzz-cyan text-zzz-cyan"
                                : "bg-black border-zzz-gray text-gray-400 hover:text-white hover:border-white"
                            }
                        `}
          >
            <span className="flex items-center gap-2">
              <Tag size={14} /> {category === "ALL" ? "Category" : category}
            </span>
            <ChevronRight
              size={12}
              className={`transition-transform ${
                activeDropdown === "CATEGORY" ? "rotate-90" : ""
              }`}
            />
          </button>
          {activeDropdown === "CATEGORY" && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-zzz-black border border-zzz-gray shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onCategoryChange(cat);
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-[10px] font-mono font-bold hover:bg-zzz-gray/20 flex items-center justify-between group ${
                    category === cat
                      ? "text-zzz-cyan bg-zzz-cyan/5"
                      : "text-gray-400"
                  }`}
                >
                  {cat}
                  {category === cat && (
                    <div className="w-1.5 h-1.5 bg-zzz-cyan rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Status Filter */}
        <div className="relative filter-dropdown-container">
          <button
            onClick={() =>
              setActiveDropdown(activeDropdown === "STATUS" ? null : "STATUS")
            }
            className={`
                            h-10 px-4 border flex items-center gap-2 text-[10px] font-bold uppercase transition-all min-w-[130px] justify-between
                            ${
                              status !== "ALL"
                                ? "bg-zzz-lime/10 border-zzz-lime text-zzz-lime"
                                : "bg-black border-zzz-gray text-gray-400 hover:text-white hover:border-white"
                            }
                        `}
          >
            <span className="flex items-center gap-2">
              <Filter size={14} /> {status === "ALL" ? "Status" : status}
            </span>
            <ChevronRight
              size={12}
              className={`transition-transform ${
                activeDropdown === "STATUS" ? "rotate-90" : ""
              }`}
            />
          </button>
          {activeDropdown === "STATUS" && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-zzz-black border border-zzz-gray shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onStatusChange(s);
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-[10px] font-mono font-bold hover:bg-zzz-gray/20 flex items-center justify-between group ${
                    status === s
                      ? "text-zzz-lime bg-zzz-lime/5"
                      : "text-gray-400"
                  }`}
                >
                  {s}
                  {status === s && (
                    <div className="w-1.5 h-1.5 bg-zzz-lime rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Sort Dropdown */}
        <div className="relative filter-dropdown-container">
          <button
            onClick={() =>
              setActiveDropdown(activeDropdown === "SORT" ? null : "SORT")
            }
            className={`
                            h-10 px-4 border flex items-center gap-2 text-[10px] font-bold uppercase transition-all min-w-[140px] justify-between
                            ${
                              sortDir !== "DESC"
                                ? "bg-zzz-orange/10 border-zzz-orange text-zzz-orange"
                                : "bg-black border-zzz-gray text-gray-400 hover:text-white hover:border-white"
                            }
                        `}
          >
            <span className="flex items-center gap-2">
              <ArrowUpDown size={14} />
              {sortDir === "DESC" ? "Newest" : "Oldest"}
            </span>
            <ChevronRight
              size={12}
              className={`transition-transform ${
                activeDropdown === "SORT" ? "rotate-90" : ""
              }`}
            />
          </button>
          {activeDropdown === "SORT" && (
            <div className="absolute top-full right-0 mt-1 w-40 bg-zzz-black border border-zzz-gray shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150">
              {[
                { label: "Newest First", dir: "DESC" as SortDirection },
                { label: "Oldest First", dir: "ASC" as SortDirection },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    onSortChange(opt.dir);
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-[10px] font-mono font-bold hover:bg-zzz-gray/20 flex items-center gap-3 ${
                    sortDir === opt.dir
                      ? "text-zzz-orange bg-zzz-orange/5"
                      : "text-gray-400"
                  }`}
                >
                  <Calendar size={14} />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="h-10 w-10 flex items-center justify-center border border-dashed border-red-500/50 text-red-500 hover:bg-red-500 hover:text-black hover:border-red-500 transition-all animate-in fade-in zoom-in-50"
            title="Reset Filters"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
