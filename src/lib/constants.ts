export const ADMIN_ITEMS_PER_PAGE = 12;

export const CATEGORY_COLORS = {
  DEV: "text-muted-foreground border-border",
  LIFE: "text-muted-foreground border-border",
  GAMING: "text-muted-foreground border-border",
  TECH: "text-muted-foreground border-border",
};

export const CACHE_CONTROL = {
  public: {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "CDN-Cache-Control": "public, s-maxage=31536000",
  },
  swr: {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "CDN-Cache-Control": "public, s-maxage=1, stale-while-revalidate=604800",
  },
  immutable: {
    "Cache-Control": "public, max-age=31536000, immutable",
    "CDN-Cache-Control": "public, max-age=31536000, immutable",
  },
  notFound: {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "CDN-Cache-Control": "public, s-maxage=10, stale-while-revalidate=300",
  },
  serverError: {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "CDN-Cache-Control": "public, s-maxage=10",
  },
  private: {
    "Cache-Control": "private, no-store, no-cache, must-revalidate",
    "CDN-Cache-Control": "private, no-store",
  },
} as const;

export const ADMIN_STATS = {
  totalViews: 45231,
  etherStability: 89.4,
  systemHealth: "STABLE",
  pendingComments: 12,
  databaseSize: "1.2 GB",
};
