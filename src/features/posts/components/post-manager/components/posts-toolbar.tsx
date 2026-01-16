import { ArrowUpDown, ChevronDown, Filter, Search, X } from "lucide-react";
import { useState } from "react";
import { STATUS_FILTERS } from "../types";
import type { SortDirection, StatusFilter } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DropdownType = "STATUS" | "SORT" | null;

interface PostsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  sortDir: SortDirection;
  onSortChange: (dir: SortDirection) => void;
  onResetFilters: () => void;
}

export function PostsToolbar({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
  sortDir,
  onSortChange,
  onResetFilters,
}: PostsToolbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

  const hasActiveFilters =
    status !== "ALL" || sortDir !== "DESC" || searchTerm !== "";

  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center">
      {/* Search */}
      <div className="relative w-full lg:max-w-md">
        <Search
          className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
          size={16}
          strokeWidth={1.5}
        />
        <Input
          type="text"
          placeholder="检索文章标题..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-10 py-3 bg-transparent border-b border-border rounded-none font-serif text-sm placeholder:text-muted-foreground/50 focus-visible:border-foreground transition-all h-12 shadow-none"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSearchChange("")}
            className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground rounded-sm"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {/* Filters Container */}
      <div className="flex flex-wrap gap-4 w-full lg:w-auto">
        {/* 1. Status Filter */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setActiveDropdown(activeDropdown === "STATUS" ? null : "STATUS")
            }
            className={`
                h-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-medium transition-all px-4 rounded-sm
                ${
                  status !== "ALL"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
            `}
          >
            <Filter size={12} strokeWidth={1.5} />
            {
              {
                ALL: "所有状态",
                PUBLISHED: "已发布",
                DRAFT: "草稿",
              }[status]
            }
            <ChevronDown
              size={12}
              className={`transition-transform duration-500 opacity-40 ${
                activeDropdown === "STATUS" ? "rotate-180" : ""
              }`}
            />
          </Button>
          {activeDropdown === "STATUS" && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border shadow-2xl z-30 animate-in fade-in slide-in-from-top-2 duration-300 rounded-sm overflow-hidden">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onStatusChange(s);
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-5 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-accent transition-colors ${
                    status === s
                      ? "font-bold bg-accent"
                      : "text-muted-foreground"
                  }`}
                >
                  {
                    {
                      ALL: "所有状态",
                      PUBLISHED: "已发布",
                      DRAFT: "草稿",
                    }[s]
                  }
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Sort Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setActiveDropdown(activeDropdown === "SORT" ? null : "SORT")
            }
            className={`
                h-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-medium transition-all px-4 rounded-sm
                ${
                  sortDir !== "DESC"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
            `}
          >
            <ArrowUpDown size={12} strokeWidth={1.5} />
            {sortDir === "DESC" ? "最新发布" : "最早发布"}
            <ChevronDown
              size={12}
              className={`transition-transform duration-500 opacity-40 ${
                activeDropdown === "SORT" ? "rotate-180" : ""
              }`}
            />
          </Button>
          {activeDropdown === "SORT" && (
            <div className="absolute top-full right-0 lg:left-0 mt-2 w-48 bg-popover border border-border shadow-2xl z-30 animate-in fade-in slide-in-from-top-2 duration-300 rounded-sm overflow-hidden">
              {[
                { label: "最新发布", dir: "DESC" as SortDirection },
                { label: "最早发布", dir: "ASC" as SortDirection },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    onSortChange(opt.dir);
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-5 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-accent transition-colors ${
                    sortDir === opt.dir
                      ? "font-bold bg-accent"
                      : "text-muted-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-10 flex items-center gap-2 px-4 text-[10px] uppercase tracking-[0.2em] text-red-500 hover:text-red-600 hover:bg-red-500/5 transition-colors animate-in fade-in slide-in-from-left-2 duration-500 rounded-sm"
            title="重置所有筛选"
          >
            <X size={14} />
            <span>重置</span>
          </Button>
        )}
      </div>
    </div>
  );
}
