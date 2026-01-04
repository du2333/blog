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
    <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center">
      {/* Search */}
      <div className="relative w-full lg:max-w-md">
        <Search
          className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
          size={16}
          strokeWidth={1.5}
        />
        <Input
          type="text"
          placeholder="检索媒体文件..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-10 py-3 bg-transparent border-b border-border rounded-none font-serif text-sm placeholder:text-muted-foreground/50 focus-visible:border-foreground transition-all h-12 shadow-none"
        />
        {searchQuery && (
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

      <div className="flex items-center gap-6 w-full lg:w-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelectAll}
          className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors h-auto py-2 px-3 rounded-sm ${
            selectedCount > 0
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground"
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
        </Button>

        {selectedCount > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold py-2 px-4 rounded-sm transition-all animate-in fade-in slide-in-from-left-2 duration-500"
          >
            <Trash2 size={14} strokeWidth={1.5} />
            删除选中 ({selectedCount})
          </Button>
        )}
      </div>
    </div>
  );
}
