export const ITEMS_PER_PAGE = 6;
export const ADMIN_ITEMS_PER_PAGE = 12;

export const CATEGORY_COLORS = {
  DEV: "text-zzz-lime border-zzz-lime",
  LIFE: "text-zzz-white border-zzz-white",
  GAMING: "text-zzz-orange border-zzz-orange",
  TECH: "text-zzz-cyan border-zzz-cyan",
};

export interface MediaAsset {
  id: string;
  url: string;
  name: string;
  type: "IMAGE" | "VIDEO" | "AUDIO";
  size: string;
  uploadDate: string;
}

type BlogPost = {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  readTime: string;
  status: string;
  content: string;
  image?: string;
};

export const ADMIN_STATS = {
  totalViews: 45231,
  etherStability: 89.4,
  systemHealth: "STABLE",
  pendingComments: 12,
  databaseSize: "1.2 GB",
};