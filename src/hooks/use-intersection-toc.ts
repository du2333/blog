import { useEffect, useState } from "react";
import type { TableOfContentsItem } from "@/lib/toc";

export function useIntersectionTOC(headers: TableOfContentsItem[]) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // 存储所有可见的标题 ID
    const visibleIds = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;

          if (entry.isIntersecting) {
            visibleIds.add(id);
          } else {
            visibleIds.delete(id);
          }
        });

        // 从可见的标题中选择最靠前的（按照文档顺序）
        if (visibleIds.size > 0) {
          const firstVisibleId = headers.find((h) => visibleIds.has(h.id))?.id;
          if (firstVisibleId) {
            setActiveId(firstVisibleId);
          }
        }
      },
      {
        // rootMargin 定义触发区域
        // 顶部 -10%：标题进入视口上方 10% 时触发
        // 底部 -35%：标题在视口下方 35% 前触发
        rootMargin: "-10% 0% -35% 0%",
        // threshold: 0 表示元素一进入/离开就触发
        threshold: 0,
      }
    );

    // 观察所有标题元素
    headers.forEach((header) => {
      const element = document.getElementById(header.id);
      if (element) {
        observer.observe(element);
      }
    });

    // 清理函数
    return () => {
      observer.disconnect();
    };
  }, [headers]);

  return activeId;
}
