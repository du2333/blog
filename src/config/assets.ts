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

export const HERO_ASSETS = [
  // Preload hero video poster (首页立即显示)
  {
    rel: "preload",
    href: "/assets/hollow.webp",
    as: "image" as const,
    type: "image/webp",
  },
];

/**
 * Google Fonts URLs - 这些将通过异步方式加载，不阻塞渲染
 */
export const FONT_URLS = [
  "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap",
  "https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Roboto+Mono:wght@400;500&family=Inter:wght@400;600;800&display=swap",
];
