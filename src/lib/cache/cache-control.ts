export const CACHE_CONTROL = {
  /**
   * 公共页面 (首页、列表、文章详情)
   * 策略：
   * 1. 浏览器: 0缓存，每次必须验证 (保证回退/刷新也是新的)
   * 2. CDN: 强缓存 60秒，SWR 1天 (兼顾秒开和更新速度)
   */
  public: {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=86400",
  },

  /**
   * 静态资源 (图片、上传文件)
   * 策略：
   * 永久缓存 (1年)。因为你会改文件名/删除，所以不用担心更新问题。
   */
  immutable: {
    "Cache-Control": "public, max-age=31536000, immutable",
    "CDN-Cache-Control": "public, max-age=31536000",
  },

  /**
   * 404 Not Found
   * 策略：
   * 浏览器不存。
   * CDN 存 10秒，但允许 SWR (5分钟)。
   * 理由：404 没那么紧急，允许稍微陈旧一点的 404 也没事。
   */
  notFound: {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "CDN-Cache-Control": "public, s-maxage=10, stale-while-revalidate=300",
  },

  /**
   * 500 Server Error (包括 502, 503)
   * 策略：
   * 浏览器绝对不存 (no-store)。
   * CDN 只挡 10秒，禁止 SWR。
   * 理由：防灾专用。灾难过去后，必须立刻让用户看到恢复的页面。
   */
  serverError: {
    "Cache-Control": "no-store, private",
    "CDN-Cache-Control": "public, s-maxage=10",
  },
} as const;
