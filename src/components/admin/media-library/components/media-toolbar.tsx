import { CheckSquare, Search, Square, Trash2 } from "lucide-react";

interface MediaToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDelete: () => void;
}

export function MediaToolbar({ searchQuery, onSearchChange, selectedCount, totalCount, onSelectAll, onDelete }: MediaToolbarProps) {
  return (
    <div className="bg-zzz-dark border border-zzz-gray p-2 flex flex-col md:flex-row gap-4 items-center mb-6">
      <div className="relative flex-1 w-full">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          size={14}
        />
        <input
          type="text"
          placeholder="SEARCH_ASSETS..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-black border border-zzz-gray text-white text-xs font-mono pl-9 pr-3 py-2 focus:border-zzz-cyan focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <button
          onClick={onSelectAll}
          className="h-8 px-3 bg-black border border-zzz-gray hover:border-white text-gray-400 hover:text-white flex items-center gap-2 text-[10px] font-bold uppercase transition-colors"
        >
          {selectedCount > 0 && selectedCount === totalCount ? (
            <CheckSquare size={14} className="text-zzz-cyan" />
          ) : (
            <Square size={14} />
          )}
          {selectedCount > 0 && selectedCount === totalCount
            ? "Deselect All"
            : "Select All"}
        </button>

        {selectedCount > 0 && (
          <button
            onClick={onDelete}
            className="h-8 px-3 bg-zzz-orange/10 border border-zzz-orange text-zzz-orange hover:bg-zzz-orange hover:text-black flex items-center gap-2 text-[10px] font-bold uppercase transition-colors animate-in fade-in slide-in-from-right-4"
          >
            <Trash2 size={14} />
            Delete ({selectedCount})
          </button>
        )}
      </div>
    </div>
  );
}
