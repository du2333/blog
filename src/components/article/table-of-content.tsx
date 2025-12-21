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
      className="sticky top-32 self-start hidden lg:block w-[200px] animate-in fade-in duration-700 delay-500 max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden custom-scrollbar fill-mode-backwards"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-8 text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">
        <AlignLeft size={12} />
        <span>目录索引</span>
      </div>

      {/* Root List Container */}
      <div className="relative toc-root">
        <ul className="space-y-4">
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
                className={`
                            block text-xs transition-all duration-300 leading-relaxed relative border-l-2
                            ${
                              activeId === node.id
                                ? "text-zinc-900 dark:text-zinc-100 border-zinc-900 dark:border-zinc-100 pl-4 font-medium"
                                : "text-zinc-400 dark:text-zinc-500 border-transparent pl-4 hover:text-zinc-900 dark:hover:text-zinc-100"
                            }
                        `}
                style={{ marginLeft: `${(node.level - 2) * 1}rem` }}
              >
                {node.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
