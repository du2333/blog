import { useNavigate } from "@tanstack/react-router";
import { AlignLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TableOfContentsItem } from "@/features/posts/utils/toc";
import { useActiveTOC } from "@/hooks/use-active-toc";

export default function TableOfContents({
  headers,
}: {
  headers: Array<TableOfContentsItem>;
}) {
  const activeId = useActiveTOC(headers);
  const [, setIndicatorTop] = useState<number>(0);
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
      <div className="flex items-center gap-2 mb-8 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
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
                                ? "text-foreground border-foreground pl-4 font-medium"
                                : "text-muted-foreground border-transparent pl-4 hover:text-foreground"
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
