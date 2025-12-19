import { useActiveTOC } from "@/hooks/use-active-toc";
import type { TableOfContentsItem } from "@/lib/editor/toc";
import { useNavigate } from "@tanstack/react-router";
import { AlignLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function TableOfContents({
  headers,
}: {
  headers: TableOfContentsItem[];
}) {
  const activeId = useActiveTOC(headers);
  const [indicatorTop, setIndicatorTop] = useState<number>(0);
  const navRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  // Update visual indicator position
  useEffect(() => {
    if (activeId && navRef.current) {
      const activeLink = navRef.current.querySelector(`a[href="#${activeId}"]`);
      if (activeLink instanceof HTMLElement) {
        const listRect = navRef.current
          .querySelector(".toc-root")
          ?.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        if (listRect) {
          setIndicatorTop(linkRect.top - listRect.top);
        }
      }
    }
  }, [activeId]);

  if (headers.length === 0) return null;

  return (
    <nav
      ref={navRef}
      className="sticky top-32 self-start hidden lg:block w-[250px] p-4 animate-in fade-in slide-in-from-right-4 duration-700 delay-500 max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden custom-scrollbar pr-6 fill-mode-backwards"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 text-zzz-lime font-mono text-xs font-bold uppercase tracking-widest border-b border-zzz-gray pb-2 sticky top-0 bg-zzz-black/95 backdrop-blur z-20">
        <AlignLeft size={14} />
        <span>Navigation_Index</span>
      </div>

      {/* Root List Container */}
      <div className="relative toc-root">
        {/* Main Sliding Indicator (Global) */}
        <div
          className="absolute left-[15px] w-0.5 h-4 bg-zzz-lime transition-all duration-300 ease-out z-10 opacity-50"
          style={{ top: indicatorTop + 4, opacity: activeId ? 1 : 0 }}
        />

        <ul className="space-y-1">
          {headers.map((node) => (
            <li key={node.id}>
              <a
                href={`#${node.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(node.id);
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                    });
                    navigate({
                      hash: node.id,
                      replace: true,
                      hashScrollIntoView: false,
                    });
                  }
                }}
                style={{ paddingLeft: `${1.5 + (node.level - 1) * 0.8}rem` }}
                className={`
                            block text-xs font-mono transition-all duration-200 leading-tight py-1 relative
                            ${
                              activeId === node.id
                                ? "text-zzz-lime font-bold"
                                : "text-gray-500 hover:text-white"
                            }
                            ${
                              node.level === 2
                                ? "uppercase tracking-wider mt-4 mb-2 font-bold text-zzz-white"
                                : ""
                            }
                        `}
              >
                {/* H1 Decorator */}
                {node.level === 2 && (
                  <span className="absolute left-0 text-zzz-gray/50 font-bold">
                    #
                  </span>
                )}

                {node.text}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Decorative Footer */}
      <div className="mt-8 pt-4 border-t border-zzz-gray/30">
        <div className="flex justify-between items-center text-[10px] font-mono text-gray-600">
          <span>SECTOR_MAP // V.2</span>
          <div className="w-1.5 h-1.5 bg-zzz-gray animate-pulse rounded-full"></div>
        </div>
      </div>
    </nav>
  );
}
