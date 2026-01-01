import { useCallback, useEffect, useRef, useState } from "react";
import type { TableOfContentsItem } from "@/lib/editor/toc";

export function useActiveTOC(headers: Array<TableOfContentsItem>) {
  const [activeId, setActiveId] = useState<string>("");
  const headersRef = useRef(headers);
  headersRef.current = headers;

  // 检测当前视口中的第一个可见标题
  const detectActiveHeader = useCallback(() => {
    const viewportHeight = window.innerHeight;
    const topBound = viewportHeight * 0.1;
    const bottomBound = viewportHeight * 0.65;

    for (const header of headersRef.current) {
      const element = document.getElementById(header.id);
      if (element) {
        const rect = element.getBoundingClientRect();
        // 元素底部在 topBound 以下，且元素顶部在 bottomBound 以上
        if (rect.bottom >= topBound && rect.top <= bottomBound) {
          return header.id;
        }
      }
    }
    return null;
  }, []);

  useEffect(() => {
    let rafId: number | null = null;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const activeHeader = detectActiveHeader();
          if (activeHeader) {
            setActiveId(activeHeader);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // 初始检测（延迟执行确保 DOM 渲染完成）
    const initialRafId = requestAnimationFrame(() => {
      const activeHeader = detectActiveHeader();
      if (activeHeader) {
        setActiveId(activeHeader);
      }
    });

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
      cancelAnimationFrame(initialRafId);
    };
  }, [detectActiveHeader]);

  return activeId;
}
