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
export const MOCK_MEDIA: MediaAsset[] = [
  {
    id: "m1",
    name: "hollow_zero_map.png",
    url: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5",
    type: "IMAGE",
    size: "2.4 MB",
    uploadDate: "2024-05-14",
  },
  {
    id: "m2",
    name: "bangboo_blueprints.jpg",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    type: "IMAGE",
    size: "1.8 MB",
    uploadDate: "2024-05-12",
  },
  {
    id: "m3",
    name: "corruption_logs.txt",
    url: "#",
    type: "VIDEO",
    size: "14 KB",
    uploadDate: "2024-05-10",
  },
  {
    id: "m4",
    name: "new_eridu_skyline.png",
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    type: "IMAGE",
    size: "5.2 MB",
    uploadDate: "2024-04-28",
  },
];

export const ADMIN_STATS = {
  totalViews: 45231,
  etherStability: 89.4,
  systemHealth: "STABLE",
  pendingComments: 12,
  databaseSize: "1.2 GB",
};