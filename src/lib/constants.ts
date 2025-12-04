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

export const MOCK_POSTS: BlogPost[] = [
  {
    id: "0",
    title: "零号空洞：代理人战斗记录",
    summary:
      "深入探索旧都陷落区的危险地带。关于以太活性、侵蚀症状以及如何最大化邦布辅助效率的详细报告。",
    date: "2024-05-14",
    category: "GAMING",
    readTime: "10 MIN",
    status: "PUBLISHED",
    content: `
      > "只要能回到新艾利都，所有的风险都是值得的。" — 某位绳匠的留言

      ## 01. 战斗前的准备 (PREPARATION)
      进入空洞之前，必须确保你的 HDD 系统和音擎驱动盘处于最佳状态。以太活性浓度在近期达到了峰值，这意味着侵蚀症状会更快地累积。

      ### 核心装备检查
      - **音擎 (W-Engine):** 确保输出功率稳定在 95% 以上。
      - **驱动盘 (Disc Drives):** 推荐使用【摇摆爵士】套装以提高能量回复效率。
      - **邦布 (Bangboo):** 携带一只具有治疗或护盾功能的邦布是生存的关键。

      ![Hollow Visualization](https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=2000&auto=format&fit=crop)

      ## 02. 侵蚀症状分析 (CORRUPTION)
      在零号空洞深处，你将面临不同程度的以太侵蚀。了解这些症状可以帮助你规避致命风险。

      1. **轻度侵蚀:** 视觉信号出现噪点，移动速度略微下降。
      2. **中度侵蚀:** 持续掉血，且受到攻击时受到的伤害增加 20%。
      3. **重度侵蚀:** **视野极度受限**，出现幻觉实体。此时应立即寻找净化室。

      ## 03. 代理人协作代码 (TACTICS)
      高效的代理人切换（QTE）是造成高额失衡值的关键。以下是一段模拟代理人自动切换逻辑的脚本：

      \`\`\`typescript
      interface Agent {
        name: string;
        element: 'Fire' | 'Electric' | 'Ice' | 'Physical';
        impact: number;
      }

      function calculateChainAttack(agents: Agent[], enemyStun: number) {
        if (enemyStun >= 100) {
          console.log("⚠️ 敌人失衡！触发连携技！");
          
          // 优先选择克制属性的代理人
          const bestAgent = agents.find(a => a.element === 'Ice');
          return bestAgent ? bestAgent.name : agents[0].name;
        }
        return "Continue Attacking";
      }
      \`\`\`

      ## 04. 结语
      空洞不仅是灾难，也是机遇。保持冷静，相信你的邦布，我们六分街见。

      > <u>切记：不要在空洞里迷失自我。</u>
    `,
    image:
      "https://images.unsplash.com/photo-1535868463750-c78d9543614f?q=80&w=2076&auto=format&fit=crop",
  },
  {
    id: "1",
    title: "STYLE GUIDE: THE HOLLOW PROTOCOL",
    summary:
      "A comprehensive test of the new rendering engine. Highlighting syntax, typography hierarchy, and data visualization.",
    date: "2024-05-12",
    category: "DEV",
    readTime: "5 MIN",
    status: "PUBLISHED",
    content: `...`, // (Truncated for brevity, content same as before)
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "PROXY LOG: SERVER COMPONENTS",
    summary:
      "Why shifting logic to the server feels like upgrading your Bangboo. Faster, smarter, and lighter.",
    date: "2024-05-10",
    category: "TECH",
    readTime: "8 MIN",
    status: "PUBLISHED",
    content: "...",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "BUILDING RESILIENCE: UI PATTERNS",
    summary:
      "A study on industrial aesthetic and why high contrast interfaces reduce cognitive load during high-stress operations.",
    date: "2024-04-28",
    category: "GAMING",
    readTime: "4 MIN",
    status: "PUBLISHED",
    content: "...",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "4",
    title: "ETHER CORRUPTION: DEBUGGING",
    summary:
      "Tracking down invisible enemies in your JavaScript heap. Tools, tips, and sanity checks.",
    date: "2024-04-15",
    category: "DEV",
    readTime: "12 MIN",
    status: "DRAFT",
    content: "...",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2069&auto=format&fit=crop",
  },
  {
    id: "5",
    title: "THE DISK DRIVE OPTIMIZATION",
    summary:
      "Refactoring legacy codebases to improve drive performance scores. A tactical guide.",
    date: "2024-03-30",
    category: "TECH",
    readTime: "6 MIN",
    status: "PUBLISHED",
    content: "Legacy code is like a corrupted sector...",
  },
  {
    id: "6",
    title: "BANGBOO MAINTENANCE LOG 104",
    summary:
      "Weekly maintenance routine for your digital assistants. Oil changes, cache clearing, and sensor calibration.",
    date: "2024-03-22",
    category: "LIFE",
    readTime: "3 MIN",
    status: "PUBLISHED",
    content: "Keep them happy, keep them running...",
  },
  {
    id: "7",
    title: "ZERO CAVITY: SPEEDRUNNING",
    summary:
      "Optimizing your daily workflow to achieve frame-perfect productivity.",
    date: "2024-03-15",
    category: "GAMING",
    readTime: "7 MIN",
    status: "PUBLISHED",
    content: "Every second counts when the corruption meter is rising...",
  },
  {
    id: "8",
    title: "AUDIO REACTIVE VISUALIZATIONS",
    summary:
      "Creating web audio visualizers that sync with the beat. Canvas API vs WebGL.",
    date: "2024-02-28",
    category: "DEV",
    readTime: "9 MIN",
    status: "DRAFT",
    content: "See the music. Feel the code...",
  },
  {
    id: "9",
    title: "NEON PALETTES & DARK MODES",
    summary:
      "Why cyan and lime are the new black and white. Color theory for cyberpunk interfaces.",
    date: "2024-02-10",
    category: "DEV",
    readTime: "5 MIN",
    status: "PUBLISHED",
    content: "Contrast is king...",
  },
  {
    id: "10",
    title: "RETRO HARDWARE RESTORATION",
    summary:
      "Bringing a 1998 terminal back to life to serve as a home dashboard.",
    date: "2024-01-25",
    category: "TECH",
    readTime: "15 MIN",
    status: "PUBLISHED",
    content: "Old tech has a soul...",
  },
  {
    id: "11",
    title: "THE SIXTH STREET CAFE REVIEW",
    summary: "Best coffee spots for coding sessions in the outer rim.",
    date: "2024-01-05",
    category: "LIFE",
    readTime: "4 MIN",
    status: "PUBLISHED",
    content: "Caffeine is the fuel...",
  },
];

const INITIAL_MEDIA: MediaAsset[] = [
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

// Generate more mock media for pagination testing
const GENERATED_MEDIA: MediaAsset[] = Array.from({ length: 60 }).map(
  (_, i) => ({
    id: `gen_${i}`,
    name: `archive_fragment_${i + 100}.dat`,
    url: `https://images.unsplash.com/photo-${
      1550000000000 + i
    }?auto=format&fit=crop&w=300&q=80`, // Random unsplash-like URL pattern
    type: Math.random() > 0.8 ? "VIDEO" : "IMAGE",
    size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
    uploadDate: "2024-01-01",
  })
);

export const MOCK_MEDIA = [...INITIAL_MEDIA, ...GENERATED_MEDIA];

export const ADMIN_STATS = {
  totalViews: 45231,
  etherStability: 89.4,
  systemHealth: "STABLE",
  pendingComments: 12,
  databaseSize: "1.2 GB",
};