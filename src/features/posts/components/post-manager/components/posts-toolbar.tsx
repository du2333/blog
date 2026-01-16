import { ArrowUpDown, Filter, Search, X } from "lucide-react";
import { STATUS_FILTERS } from "../types";
import type { SortDirection, SortField, StatusFilter } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/ui/dropdown";

interface PostsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  sortDir: SortDirection;
  sortBy: SortField;
  onSortUpdate: (update: { dir?: SortDirection; sortBy?: SortField }) => void;
  onResetFilters: () => void;
}

export function PostsToolbar({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
  sortDir,
  sortBy,
  onSortUpdate,
  onResetFilters,
}: PostsToolbarProps) {
  const hasActiveFilters =
    status !== "ALL" ||
    sortDir !== "DESC" ||
    sortBy !== "updatedAt" ||
    searchTerm !== "";

  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-8 items-stretch lg:items-center w-full">
      {/* Search Input Group */}
      <div className="relative flex-1 group">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors"
          size={16}
          strokeWidth={2}
        />
        <Input
          type="text"
          placeholder="检索文章标题..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 h-10 bg-secondary/40 border-transparent hover:bg-secondary/60 focus:bg-background focus:border-border transition-all rounded-md font-sans text-sm shadow-sm"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSearchChange("")}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground rounded-sm"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {/* Filters Group */}
      <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
        <div className="h-6 w-px bg-border mx-2 hidden lg:block" />

        {/* 1. Status Filter */}
        <Dropdown
          align="left"
          trigger={
            <Button
              variant="outline"
              size="sm"
              className={`
                    h-10 border-dashed border-border hover:border-foreground/30
                    flex items-center gap-2 text-[11px] font-medium transition-all px-3 rounded-md shadow-sm
                    ${
                      status !== "ALL"
                        ? "bg-secondary text-foreground border-solid border-secondary-foreground/20"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    }
                `}
            >
              <Filter size={14} strokeWidth={1.5} />
              <span className="uppercase tracking-wider">
                {
                  {
                    ALL: "状态",
                    PUBLISHED: "已发布",
                    DRAFT: "草稿",
                  }[status]
                }
              </span>
              {status !== "ALL" && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary ml-1" />
              )}
            </Button>
          }
          items={STATUS_FILTERS.map((s) => ({
            label: {
              ALL: "显示所有",
              PUBLISHED: "已发布",
              DRAFT: "草稿",
            }[s],
            onClick: () => onStatusChange(s),
            className: status === s ? "bg-accent text-accent-foreground" : "",
            icon:
              status === s ? (
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              ) : undefined,
          }))}
        />

        {/* 2. Sort Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <Button
              variant="outline"
              size="sm"
              className={`
                    h-10 border-dashed border-border hover:border-foreground/30
                    flex items-center gap-2 text-[11px] font-medium transition-all px-3 rounded-md shadow-sm
                    ${
                      sortDir !== "DESC" || sortBy !== "updatedAt"
                        ? "bg-secondary text-foreground border-solid border-secondary-foreground/20"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    }
                `}
            >
              <ArrowUpDown size={14} strokeWidth={1.5} />
              <span className="uppercase tracking-wider">
                {sortBy === "publishedAt" ? "最近发布" : "最近修改"}
              </span>
            </Button>
          }
          items={[
            {
              label: "最近发布",
              onClick: () =>
                onSortUpdate({ sortBy: "publishedAt", dir: "DESC" }),
              isActive: sortBy === "publishedAt" && sortDir === "DESC",
            },
            {
              label: "最近修改",
              onClick: () => onSortUpdate({ sortBy: "updatedAt", dir: "DESC" }),
              isActive: sortBy === "updatedAt" && sortDir === "DESC",
            },
          ].map((opt) => ({
            label: opt.label,
            onClick: opt.onClick,
            className: opt.isActive ? "bg-accent text-accent-foreground" : "",
            icon: opt.isActive ? (
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            ) : undefined,
          }))}
        />

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onResetFilters}
            className="h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="重置所有筛选"
          >
            <X size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
