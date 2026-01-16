import { useCallback, useEffect, useRef, useState } from "react";
import type { TableOfContentsItem } from "@/features/posts/utils/toc";

interface UseActiveTOCOptions {
  containerId?: string;
  topOffset?: number;
  bottomOffsetFactor?: number;
}

export function useActiveTOC(
  headers: Array<TableOfContentsItem>,
  options: UseActiveTOCOptions = {},
) {
  const {
    containerId,
    topOffset = 0.1, // 10% of height
    bottomOffsetFactor = 0.65, // 65% of height
  } = options;

  const [activeId, setActiveId] = useState<string>("");
  const headersRef = useRef(headers);
  headersRef.current = headers;

  const detectActiveHeader = useCallback(() => {
    const scrollContainer = containerId
      ? document.getElementById(containerId)
      : null;

    const viewportHeight = scrollContainer
      ? scrollContainer.clientHeight
      : window.innerHeight;

    const topBound = viewportHeight * topOffset;
    const bottomBound = viewportHeight * bottomOffsetFactor;

    for (const header of headersRef.current) {
      const element = document.getElementById(header.id);
      if (element) {
        const rect = element.getBoundingClientRect();

        // If using a custom container, we need to adjust rect.top/bottom
        // relative to the container's top if the container is not the window.
        let top = rect.top;
        let bottom = rect.bottom;

        if (scrollContainer) {
          const containerRect = scrollContainer.getBoundingClientRect();
          top = rect.top - containerRect.top;
          bottom = rect.bottom - containerRect.top;
        }

        if (bottom >= topBound && top <= bottomBound) {
          return header.id;
        }
      }
    }
    return null;
  }, [containerId, topOffset, bottomOffsetFactor]);

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

    const scrollTarget = containerId
      ? document.getElementById(containerId)
      : window;

    if (!scrollTarget && containerId) return;

    scrollTarget?.addEventListener("scroll", handleScroll, { passive: true });
    // Also listen to resize
    window.addEventListener("resize", handleScroll);

    // Initial check
    handleScroll();

    return () => {
      scrollTarget?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [detectActiveHeader, containerId, headers]); // Re-bind if headers change for initial detect

  return activeId;
}
