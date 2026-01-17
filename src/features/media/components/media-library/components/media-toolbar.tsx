import { CheckSquare, Search, Square, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-end justify-between border-b border-border/30 pb-6">
      {/* Search */}
      <div className="relative group w-full md:w-64">
        <Search
          className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors"
          size={14}
        />
        <Input
          type="text"
          placeholder="检索媒体文件..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-8 h-9 bg-transparent border-b border-border/50 rounded-none font-mono text-xs placeholder:text-muted-foreground/50 focus:border-foreground transition-all shadow-none"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSearchChange("")}
            className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground rounded-none"
          >
            <X size={12} />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelectAll}
          className={`h-9 px-3 text-[10px] uppercase tracking-[0.2em] font-medium rounded-none gap-2 ${
            selectedCount > 0
              ? "text-foreground bg-accent/10"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {selectedCount > 0 && selectedCount === totalCount ? (
            <CheckSquare size={12} />
          ) : (
            <Square size={12} />
          )}
          {selectedCount > 0 && selectedCount === totalCount
            ? "[ 取消全选 ]"
            : "[ 全选 ]"}
        </Button>

        {selectedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-9 px-3 text-[10px] uppercase tracking-[0.2em] font-medium rounded-none gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 animate-in fade-in slide-in-from-left-2 duration-300"
          >
            <Trash2 size={12} />[ 删除选中 ({selectedCount}) ]
          </Button>
        )}
      </div>
    </div>
  );
}
