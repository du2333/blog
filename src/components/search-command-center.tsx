import { useState, useEffect, useRef, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { searchDocsFn } from "@/lib/functions/search";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  X,
  Hash,
  FileText,
  CornerDownLeft,
  Loader2,
} from "lucide-react";
import { useDelayUnmount } from "@/hooks/use-delay-unmount";

interface SearchCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchCommandCenter({
  isOpen,
  onClose,
}: SearchCommandCenterProps) {
  const shouldRender = useDelayUnmount(isOpen, 300);
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

  // Focus input on open and handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery(""); // Optional: clear query on close
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Clear state only after the component has finished animating out
  useEffect(() => {
    if (!shouldRender) {
      setQuery("");
    }
  }, [shouldRender]);

  const handleSelect = (slug: string) => {
    navigate({ to: "/post/$slug", params: { slug } });
    onClose();
  };

  // Handle Keyboard Navigation
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
  }, [isOpen, selectedIndex, searchResults]); // keep in sync with results

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && searchResults.length > 0) {
      const activeItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, searchResults]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex items-start justify-center pt-[10vh] px-2 md:px-4 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Main Container */}
      <div
        className={`
        relative w-full max-w-2xl bg-zzz-black border-2 border-zzz-lime shadow-[0_0_50px_rgba(204,255,0,0.15)] 
        flex flex-col max-h-[80vh] md:max-h-[70vh] clip-corner-tr
        transition-all duration-300 ease-out transform
        ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-4"
        }
      `}
      >
        {/* Header / Input */}
        <div className="p-4 md:p-6 border-b border-zzz-gray bg-zzz-dark/50 flex items-center gap-4 shrink-0">
          {isSearching ? (
            <Loader2
              className="text-zzz-orange animate-spin shrink-0"
              size={24}
            />
          ) : (
            <Search
              className="text-zzz-lime animate-pulse shrink-0"
              size={24}
            />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="QUERY_DATABASE..."
            className="flex-1 bg-transparent text-lg md:text-2xl font-bold font-sans uppercase text-white placeholder-gray-700 focus:outline-none min-w-0"
          />
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-2 scroll-smooth"
        >
          {isSearching ? (
            <div className="h-40 flex flex-col items-center justify-center text-zzz-orange font-mono text-xs gap-2 animate-pulse">
              <Hash size={32} className="opacity-50" />
              <span>SCANNING_DATABASE...</span>
            </div>
          ) : query.trim() === "" ? (
            <div className="h-40 flex flex-col items-center justify-center text-gray-600 font-mono text-xs gap-2">
              <Hash size={32} className="opacity-20" />
              <span>AWAITING INPUT...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-zzz-orange font-mono text-xs gap-2">
              <div className="border border-zzz-orange p-2 rounded-sm">
                NO MATCHES FOUND
              </div>
            </div>
          ) : (
            searchResults.map((result, index) => (
              <div
                key={result.post.id}
                onClick={() => handleSelect(result.post.slug)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`
                  group p-4 mb-1 cursor-pointer transition-all border-l-4 relative overflow-hidden wrap-break-word
                  ${
                    index === selectedIndex
                      ? "bg-zzz-gray/30 border-zzz-lime"
                      : "border-transparent hover:bg-white/5 hover:border-gray-600"
                  }
                `}
              >
                <div className="flex justify-between items-start relative z-10 gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Title Match */}
                    <h4
                      className="text-lg font-bold font-sans uppercase text-white mb-1 leading-tight whitespace-normal"
                      dangerouslySetInnerHTML={{
                        __html: result.matches.title || result.post.title,
                      }}
                    />

                    {/* Summary Match */}
                    <div
                      className="text-xs font-mono text-gray-400 mb-2 line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: result.matches.summary || result.post.summary,
                      }}
                    />

                    {/* Content Snippet Match */}
                    {result.matches.contentSnippet && (
                      <div className="bg-black/50 border border-zzz-gray/30 p-2 rounded-sm mt-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase mb-1">
                          <FileText size={10} /> Content Match
                        </div>
                        <div
                          className="text-[11px] font-mono text-gray-300 leading-relaxed italic whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: result.matches.contentSnippet,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Meta/Action */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 border font-bold ${
                        index === selectedIndex
                          ? "text-zzz-lime border-zzz-lime"
                          : "text-gray-600 border-gray-700"
                      }`}
                    >
                      {result.post.category}
                    </span>
                    {index === selectedIndex && (
                      <CornerDownLeft
                        size={16}
                        className="text-zzz-lime mt-2 hidden md:block"
                      />
                    )}
                  </div>
                </div>

                {/* Decoration */}
                <div
                  className={`absolute inset-0 bg-stripe-pattern opacity-[0.03] pointer-events-none ${
                    index === selectedIndex ? "block" : "hidden"
                  }`}
                ></div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zzz-black border-t border-zzz-gray flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-wider shrink-0">
          <div className="flex gap-4">
            <span className="hidden md:flex items-center gap-1">
              <span className="bg-gray-800 px-1 rounded text-white">↑↓</span>{" "}
              NAVIGATE
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-gray-800 px-1 rounded text-white">ENTER</span>{" "}
              SELECT
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-gray-800 px-1 rounded text-white">ESC</span>{" "}
              CLOSE
            </span>
          </div>
          <div>{searchResults.length} RESULT(S)</div>
        </div>
      </div>
    </div>
  );
}
