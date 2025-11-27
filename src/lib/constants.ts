import { BlogPost } from "./types";

export const MOCK_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "样式指南：空洞协议",
    summary: "新渲染引擎的综合测试。重点展示语法、排版层级和数据可视化。",
    date: "2024-05-12",
    category: "DEV",
    readTime: "5 MIN",
    content: `
      ## 01. 排版系统
      欢迎来到档案库。本系统采用高对比度的粗野主义叠加层，针对低光环境（空洞）下的可读性进行了优化。
      
      ### 子协议 (H3)
      标题用于分解复杂的日志。层级在视觉上截然不同。
      
      #### 次要细节 (H4)
      即使是较小的标题也保持大写美学，但使用次级调色板。

      ## 02. 代码注入 (SHIKI)
      系统现已升级 **Shiki** 以实现高保真语法高亮。

      \`\`\`typescript
      interface Bangboo {
        name: string;
        energy: number;
        skill: () => void;
      }

      function deployBangboo(target: Bangboo) {
        if (target.energy < 20) {
          console.warn("⚠️ 能量不足：需要充电");
          return;
        }
        
        console.log(\`正在将 \${target.name} 部署到空洞中...\`);
        target.skill();
      }
      \`\`\`

      ## 03. 列表与数据结构
      标准要点已被替换为几何指示器，以匹配 HUD 界面。

      - **高优先级：** 确保渲染性能 < 16ms。
      - **中优先级：** 更新邦布固件至 v2.5。
      - **低优先级：** 清理硬盘风扇。

      有序列表允许按顺序说明：

      1. 初始化渲染循环。
      2. 注入本地化 CSS 变量。
      3. 将组件挂载到 DOM。

      ## 04. 引用
      有时我们需要引用外部代理或以太低语。

      > "空洞不是弱者的去处。你的代码必须像你的思想一样坚韧。如果一个组件崩溃，整个系统就会崩溃。"
      >
      > — 传奇代理人

      ## 05. 文本强调
      你可以使用 *斜体表示微妙强调* 或 **粗体文本表示强烈警告**。行内代码如 \`const a = 1\` 高亮显示以便快速扫描。
    `,
  },
  {
    id: "2",
    title: "代理日志：服务端组件",
    summary:
      "为什么将逻辑移至服务端感觉就像升级你的邦布。更快、更智能、更轻便。",
    date: "2024-05-10",
    category: "TECH",
    readTime: "8 MIN",
    content: `
      想象一下，如果你的邦布能在数据到达你的视觉皮层之前就处理好它。这就是 RSC（React服务端组件）。
      
      ## 架构
      我们要摆脱庞大的客户端包。关键在于只发送你需要的 HTML，在你需要的时候。 
      
      \`\`\`javascript
      // 服务端组件
      async function DataCore() {
        const data = await db.query('SELECT * FROM hollows');
        return <Visualize data={data} />;
      }
      \`\`\`

      架构正在转变。准备好了吗，代理人？
    `,
  },
  {
    id: "3",
    title: "构建韧性：UI模式",
    summary: "关于工业美学以及高对比度界面如何减少高压操作期间认知负荷的研究。",
    date: "2024-04-28",
    category: "GAMING",
    readTime: "4 MIN",
    content: `
      "绝区零"的美学不仅很酷，而且很实用。高对比度、清晰的排版和即时反馈循环。
      
      ## 核心原则
      在构建 Web 应用程序时，我们可以从游戏 UI 中学习。
      
      - 让交互元素显而易见。
      - 使用动效引导注意力，而不是分散注意力。
      - 音效设计（或触觉反馈）很重要。

      > "没有功能，风格毫无意义。"
    `,
  },
  {
    id: "4",
    title: "以太侵蚀：调试",
    summary: "追踪 JavaScript 堆中看不见的敌人。工具、技巧和健全性检查。",
    date: "2024-04-15",
    category: "DEV",
    readTime: "12 MIN",
    content: `
      内存泄漏是 Web 性能的隐形杀手。直到你的浏览器像超载的机甲一样崩溃，你才会看到它们。
      
      ## 行业工具
      Chrome DevTools 是你的扫描仪。学会获取堆快照。比较它们。找到分离的 DOM 节点。
      
      \`\`\`bash
      npm install --save-dev heap-profiler
      \`\`\`
    `,
  },
  {
    id: "5",
    title: "磁盘驱动器优化",
    summary: "重构遗留代码库以提高驱动器性能评分。战术指南。",
    date: "2024-03-30",
    category: "TECH",
    readTime: "6 分钟",
    content: "遗留代码就像损坏的扇区...",
  },
  {
    id: "6",
    title: "邦布维护日志 104",
    summary: "你的数字助理的每周维护程序。换油、清理缓存和传感器校准。",
    date: "2024-03-22",
    category: "LIFE",
    readTime: "3 分钟",
    content: "让他们开心，让他们运行...",
  },
  {
    id: "7",
    title: "零号空洞：速通",
    summary: "优化你的日常工作流程，实现帧级完美的生产力。",
    date: "2024-03-15",
    category: "GAMING",
    readTime: "7 分钟",
    content: "当侵蚀指数上升时，每一秒都很重要...",
  },
  {
    id: "8",
    title: "音频反应可视化",
    summary: "创建与节拍同步的 Web 音频可视化工具。Canvas API vs WebGL。",
    date: "2024-02-28",
    category: "DEV",
    readTime: "9 分钟",
    content: "看见音乐。感受代码...",
  },
  {
    id: "9",
    title: "霓虹调色板与深色模式",
    summary: "为什么青色和酸橙色是新的黑白。赛博朋克界面的色彩理论。",
    date: "2024-02-10",
    category: "DEV",
    readTime: "5 分钟",
    content: "对比度为王...",
  },
  {
    id: "10",
    title: "复古硬件修复",
    summary: "让 1998 年的终端起死回生，用作家庭仪表板。",
    date: "2024-01-25",
    category: "TECH",
    readTime: "15 分钟",
    content: "旧技术有灵魂...",
  },
  {
    id: "11",
    title: "六分街咖啡馆点评",
    summary: "外环最佳的编码时段咖啡点。",
    date: "2024-01-05",
    category: "LIFE",
    readTime: "4 分钟",
    content: "咖啡因是燃料...",
  },
];

export const CATEGORY_COLORS = {
  DEV: "text-zzz-lime border-zzz-lime",
  LIFE: "text-zzz-white border-zzz-white",
  GAMING: "text-zzz-orange border-zzz-orange",
  TECH: "text-zzz-cyan border-zzz-cyan",
};
