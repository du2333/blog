import { CheckSquare, Search, Square, Trash2, X } from "lucide-react";

interface MediaToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDelete: () => void;
}

export function MediaToolbar({
  searchQuery,
  onSearchChange,
  selectedCount,
  totalCount,
  onSelectAll,
  onDelete,
}: MediaToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center">
      {/* Search */}
      <div className="relative w-full lg:max-w-md">
        <Search
          className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700"
          size={16}
          strokeWidth={1.5}
        />
        <input
          type="text"
          placeholder="检索媒体文件..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent border-b border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 text-sm font-serif italic pl-8 pr-8 py-3 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-6 w-full lg:w-auto">
        <button
          onClick={onSelectAll}
          className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${
            selectedCount > 0
              ? "text-zinc-950 dark:text-zinc-50"
              : "text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
          }`}
        >
          {selectedCount > 0 && selectedCount === totalCount ? (
            <CheckSquare size={14} strokeWidth={1.5} />
          ) : (
            <Square size={14} strokeWidth={1.5} />
          )}
          {selectedCount > 0 && selectedCount === totalCount
            ? "取消全选"
            : "全选"}
        </button>

        {selectedCount > 0 && (
          <button
            onClick={onDelete}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-red-500 hover:text-red-600 transition-colors animate-in fade-in slide-in-from-left-2 duration-500"
          >
            <Trash2 size={14} strokeWidth={1.5} />
            删除选中 ({selectedCount})
          </button>
        )}
      </div>
    </div>
  );
}
