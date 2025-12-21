import { useState, useEffect, useRef, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { searchDocsFn } from "@/features/search/search.api";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, CornerDownLeft } from "lucide-react";

interface SearchCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchCommandCenter({
  isOpen,
  onClose,
}: SearchCommandCenterProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  const { data: results, isLoading: isSearching } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchDocsFn({ data: { q: debouncedQuery } }),
    enabled: isOpen && debouncedQuery.length > 0,
  });

  const searchResults = useMemo(() => results ?? [], [results]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSelect = (slug: string) => {
    navigate({ to: "/post/$slug", params: { slug } });
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const len = searchResults.length;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (len === 0) return;
        setSelectedIndex((prev) => (prev + 1) % len);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (len === 0) return;
        setSelectedIndex((prev) => (prev - 1 + len) % len);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (len > 0) {
          handleSelect(searchResults[selectedIndex]?.post.slug);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, searchResults]);

  useEffect(() => {
    if (listRef.current && searchResults.length > 0) {
      const activeItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, searchResults]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <div
      className={`fixed inset-0 z-100 flex items-start justify-center pt-[15vh] px-4 md:px-6 transition-all duration-500 ease-in-out ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-white/90 dark:bg-[#050505]/95 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Main Container */}
      <div
        className={`
        relative w-full max-w-3xl flex flex-col max-h-[70vh]
        transition-all duration-500 ease-in-out transform
        ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-99 -translate-y-4"
        }
      `}
      >
        {/* Header / Input */}
        <div className="relative flex items-center gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-900">
          <Search
            className={`transition-colors duration-500 ${
              isSearching
                ? "text-zinc-400 animate-pulse"
                : "text-zinc-300 dark:text-zinc-700"
            }`}
            size={28}
            strokeWidth={1.5}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章或想法..."
            className="flex-1 bg-transparent text-3xl md:text-5xl font-serif italic text-zinc-900 dark:text-zinc-100 placeholder-zinc-200 dark:placeholder-zinc-800 focus:outline-none min-w-0"
          />
          {isSearching && (
            <div className="absolute -bottom-px left-0 w-full h-px overflow-hidden">
              <div className="w-full h-full bg-zinc-900 dark:bg-zinc-100 animate-[scan_2s_infinite]"></div>
            </div>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto custom-scrollbar pt-8 pb-4 space-y-2 scroll-smooth"
        >
          {query.trim() === "" ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.4em] opacity-30">
                Waiting for input
              </span>
            </div>
          ) : !isSearching && searchResults.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <span className="text-lg font-light text-zinc-400 italic">
                未找到相关结果
              </span>
            </div>
          ) : (
            searchResults.map((result, index) => (
              <div
                key={result.post.id}
                onClick={() => handleSelect(result.post.slug)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`
                  group p-6 transition-all duration-500 rounded-sm relative
                  ${
                    index === selectedIndex
                      ? "bg-zinc-50 dark:bg-zinc-900/50"
                      : "hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                  }
                `}
              >
                <div className="flex justify-between items-start gap-8">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest opacity-40">
                      <span>{result.post.category}</span>
                      {index === selectedIndex && (
                        <span className="animate-in fade-in slide-in-from-left-2 duration-500 text-zinc-900 dark:text-zinc-100">
                          Selected
                        </span>
                      )}
                    </div>

                    <h4
                      className="text-xl md:text-2xl font-serif text-zinc-900 dark:text-zinc-100 leading-tight"
                      dangerouslySetInnerHTML={{
                        __html: result.matches.title || result.post.title,
                      }}
                    />

                    <div
                      className="text-sm font-light text-zinc-500 dark:text-zinc-400 line-clamp-1 italic"
                      dangerouslySetInnerHTML={{
                        __html: result.matches.summary || result.post.summary,
                      }}
                    />
                  </div>

                  <div className="shrink-0 pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <CornerDownLeft size={16} className="text-zinc-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center text-[10px] font-mono uppercase tracking-[0.2em] opacity-30">
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <kbd className="px-1 border border-current rounded">↑↓</kbd> 导航
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1 border border-current rounded">Enter</kbd>{" "}
              选择
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1 border border-current rounded">Esc</kbd> 关闭
            </div>
          </div>
          <div>{searchResults.length} Results</div>
        </div>
      </div>
    </div>
  );
}
