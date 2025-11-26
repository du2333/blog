export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: "DEV" | "LIFE" | "GAMING" | "TECH";
  readTime: string;
  image?: string;
}
