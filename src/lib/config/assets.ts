/**
 * 统一管理所有外部资源和预加载配置
 * 包括：Google Fonts、视频、图片等
 */

export const PRELOAD_LINKS = [
  // 1. Preconnect to Google Fonts (建立连接，不阻塞)
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous" as const,
  },
];

/**
 * Google Fonts URLs - 这些将通过异步方式加载，不阻塞渲染
 */
export const FONT_URLS = [
  "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap",
];
