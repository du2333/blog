import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  searchDocsQueryOptions,
  searchMetaQuery,
} from "@/features/search/queries";
import { useDebounce } from "@/hooks/use-debounce";

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

  const { data: meta } = useQuery({
    ...searchMetaQuery,
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const { data: results, isLoading: isSearching } = useQuery({
    ...searchDocsQueryOptions(debouncedQuery, meta?.version || "init"),
    enabled: isOpen && debouncedQuery.length > 0 && !!meta?.version,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
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
      activeItem.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, searchResults]);

  // Reset query when closed
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-start pt-[15vh] px-4 md:px-0 transition-opacity duration-300 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/98 backdrop-blur-xl transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Main Container */}
      <div
        className={`relative w-full max-w-2xl flex flex-col transition-all duration-500 ease-out ${
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
        }`}
      >
        {/* Input Area */}
        <div className="relative mb-16 group">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章..."
            className="w-full bg-transparent text-4xl md:text-6xl font-serif text-foreground placeholder:text-muted-foreground/10 focus:outline-none text-center selection:bg-foreground selection:text-background tracking-tight"
          />
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="w-full max-h-[60vh] overflow-y-auto custom-scrollbar px-4 pb-20 space-y-6"
        >
          {query.trim() !== "" &&
            !isSearching &&
            searchResults.length === 0 && (
              <div className="text-center py-12 opacity-50">
                <p className="font-serif text-xl text-muted-foreground">
                  没有找到 "{query}"
                </p>
              </div>
            )}

          {searchResults.map((result, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={result.post.id}
                onClick={() => handleSelect(result.post.slug)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`
                  group relative cursor-pointer transition-all duration-500 flex flex-col items-center text-center
                  ${isSelected ? "opacity-100 scale-100" : "opacity-30 scale-95 blur-[1px] hover:opacity-60 hover:blur-0"}
                `}
              >
                <h4
                  className={`
                    font-serif tracking-tight transition-all duration-500
                    ${isSelected ? "text-2xl md:text-4xl text-foreground font-medium" : "text-xl md:text-2xl text-muted-foreground"}
                  `}
                  dangerouslySetInnerHTML={{
                    __html: result.matches.title || result.post.title,
                  }}
                />

                {/* Summary & Metadata - Only visible when selected */}
                <div
                  className={`
                    overflow-hidden transition-all duration-500 ease-in-out
                    ${isSelected ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"}
                  `}
                >
                  <div className="flex flex-col items-center gap-3">
                    <p
                      className="text-sm text-muted-foreground font-sans max-w-lg line-clamp-2 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html:
                          result.matches.summary || result.post.summary || "",
                      }}
                    />

                    {result.post.tags.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {result.post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground/70 border border-border/50 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 text-[10px] font-mono text-muted-foreground/30 uppercase tracking-[0.2em] animate-pulse">
                      按 Enter 阅读
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
