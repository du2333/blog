import { BlogPost } from "./types";

export const MOCK_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "STYLE GUIDE: THE HOLLOW PROTOCOL",
    summary:
      "A comprehensive test of the new rendering engine. Highlighting syntax, typography hierarchy, and data visualization.",
    date: "2024-05-12",
    category: "DEV",
    readTime: "5 MIN",
    content: `
      ## 01. TYPOGRAPHY SYSTEM
      Welcome to the archive. This system utilizes a high-contrast brutalist overlay optimized for readability in low-light environments (Hollows).
      
      ### Sub-Protocol (H3)
      Headers are used to break down complex logs. The hierarchy is visually distinct.
      
      #### Minor Detail (H4)
      Even smaller headers maintain the uppercase aesthetic but use the secondary color palette.

      ## 02. CODE INJECTION (SHIKI)
      The system is now upgraded with **Shiki** for high-fidelity syntax highlighting.

      \`\`\`typescript
      interface Bangboo {
        name: string;
        energy: number;
        skill: () => void;
      }

      function deployBangboo(target: Bangboo) {
        if (target.energy < 20) {
          console.warn("⚠️ LOW ENERGY: Recharge required");
          return;
        }
        
        console.log(\`Deploying \${target.name} into the Hollow...\`);
        target.skill();
      }
      \`\`\`

      ## 03. LISTS & DATA STRUCTURES
      Standard bullet points are replaced with geometric indicators to match the HUD interface.

      - **High Priority:** Ensure rendering performance is < 16ms.
      - **Medium Priority:** Update Bangboo firmware to v2.5.
      - **Low Priority:** Clean the HDD fans.

      Ordered lists allow for sequential instruction:

      1. Initialize the render loop.
      2. Inject the localized CSS variables.
      3. Mount the component to the DOM.

      ## 04. QUOTATIONS
      Sometimes we need to reference external Proxies or Ethereal whispers.

      > "The Hollow is not a place for the weak. Your code must be as resilient as your mind. If a component crashes, the whole system falls."
      >
      > — Legendary Proxy

      ## 05. TEXT EMPHASIS
      You can use *italics for subtle emphasis* or **bold text for strong warnings**. Inline code like \`const a = 1\` is highlighted for quick scanning.
    `,
    image: "https://picsum.photos/800/400?random=1",
  },
  {
    id: "2",
    title: "PROXY LOG: SERVER COMPONENTS",
    summary:
      "Why shifting logic to the server feels like upgrading your Bangboo. Faster, smarter, and lighter.",
    date: "2024-05-10",
    category: "TECH",
    readTime: "8 MIN",
    content: `
      Imagine if your Bangboo could process data before it even reached your visual cortex. That's RSC (React Server Components).
      
      ## THE ARCHITECTURE
      We are moving away from massive client bundles. It's about sending only the HTML you need, when you need it. 
      
      \`\`\`javascript
      // Server Component
      async function DataCore() {
        const data = await db.query('SELECT * FROM hollows');
        return <Visualize data={data} />;
      }
      \`\`\`

      The architecture is shifting. Are you ready, Proxy?
    `,
    image: "https://picsum.photos/800/400?random=2",
  },
  {
    id: "3",
    title: "BUILDING RESILIENCE: UI PATTERNS",
    summary:
      "A study on industrial aesthetic and why high contrast interfaces reduce cognitive load during high-stress operations.",
    date: "2024-04-28",
    category: "GAMING",
    readTime: "4 MIN",
    content: `
      The "Zenless" aesthetic isn't just cool; it's functional. High contrast, clear typography, and instant feedback loops.
      
      ## CORE PRINCIPLES
      When building web apps, we can learn from game UIs.
      
      - Make interactive elements obvious.
      - Use motion to guide attention, not distract.
      - Sound design (or haptics) matters.

      > "Style is nothing without function."
    `,
    image: "https://picsum.photos/800/400?random=3",
  },
  {
    id: "4",
    title: "ETHER CORRUPTION: DEBUGGING",
    summary:
      "Tracking down invisible enemies in your JavaScript heap. Tools, tips, and sanity checks.",
    date: "2024-04-15",
    category: "DEV",
    readTime: "12 MIN",
    content: `
      Memory leaks are the silent killers of web performance. You don't see them until your browser crashes like a overloaded mech.
      
      ## TOOLS OF THE TRADE
      Chrome DevTools is your scanner. Learn to take heap snapshots. Compare them. Find the detached DOM nodes.
      
      \`\`\`bash
      npm install --save-dev heap-profiler
      \`\`\`
    `,
    image: "https://picsum.photos/800/400?random=4",
  },
  {
    id: "5",
    title: "THE DISK DRIVE OPTIMIZATION",
    summary:
      "Refactoring legacy codebases to improve drive performance scores. A tactical guide.",
    date: "2024-03-30",
    category: "TECH",
    readTime: "6 MIN",
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
    content: "Old tech has a soul...",
  },
  {
    id: "11",
    title: "THE SIXTH STREET CAFE REVIEW",
    summary: "Best coffee spots for coding sessions in the outer rim.",
    date: "2024-01-05",
    category: "LIFE",
    readTime: "4 MIN",
    content: "Caffeine is the fuel...",
  },
];

export const CATEGORY_COLORS = {
  DEV: "text-zzz-lime border-zzz-lime",
  LIFE: "text-zzz-white border-zzz-white",
  GAMING: "text-zzz-orange border-zzz-orange",
  TECH: "text-zzz-cyan border-zzz-cyan",
};
