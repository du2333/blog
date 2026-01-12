---
trigger: model_decision
description: 当你需要修改 CSS、创建新 UI 组件、调整页面布局、处理暗色模式适配或优化排版设计时，参考此 Rule。
---

# 样式与设计规范

本项目追求 **极简主义 (Minimalist)** 与 **高度排版驱动 (Typography-driven)** 的 Awwwards 风格设计。

---

## 核心审美原则

1.  **极简留白**: 保持充足的间距，避免视觉拥挤。
2.  **排版优先**: 使用高质量变体字体 (Variable Fonts)，标题与正文形成鲜明的衬线/无衬线对比。
3.  **全平台响应式**: **强制要求所有设计必须完美适配移动端、平板与桌面端。** 优先考虑移动端体验 (Mobile First)，使用 Tailwind 的响应式断点控制布局。
4.  **高对比度**: 灰阶配色为主，背景纯净（纯白/深黑），强调文字的可读性。
5.  **微交互**: 细腻的过度效果（过渡时间通常为 0.3s 或 0.5s），如主题切换时的平滑过渡。
6.  **硬边缘布局**: 倾向于使用 `rounded-sm` 或 `rounded-none`，配合细边框 (`border-border`)，营造严谨、现代的设计感。

---

## 技术方案

### Tailwind CSS v4

项目采用 Tailwind CSS v4 预览版（CSS-first 架构）：

- **配置**: 所有的主题定义均在 `src/styles.css` 的 `@theme` 块中完成，而非独立的 `tailwind.config.ts`。
- **变体**: 使用 `@custom-variant` 自定义暗色模式、系统模式等。
- **层级**: 利用 `@layer base`, `@layer utilities` 组织 CSS。

### 颜色系统 (CSS Variables)

使用语义化的 CSS 变量定义颜色，支持暗色模式平滑切换。

- `--background` / `--foreground`: 基础底色与文本。
- `--primary` / `--primary-foreground`: 品牌/强调色。
- `--muted` / `--muted-foreground`: 次要文本与背景，用于形成层次。
- `--border`: 统一的边框颜色。
- `--selection`: 自定义文字选中颜色。

### 字体配置

集成 `@fontsource-variable` 提升加载性能与灵活性：

- **标题 (Serif)**: `Playfair Display`, `Noto Serif SC` (中文衬线)。用于 H1-H4。
- **正文 (Sans)**: `Inter`, `Noto Sans SC` (中文无衬线)。用于阅读主体。
- **等宽 (Mono)**: `JetBrains Mono`。用于代码与元数据（日期、阅读时间等）。

---

## 最佳实践

### 中文UI

- 优先使用中文作为UI的语言

### 响应式布局规范

- **断点使用**: 统一使用 Tailwind 标准断点 (`sm`, `md`, `lg`, `xl`)。
- **容器限制**: 页面主体通常使用 `max-w-7xl` 或 `max-w-4xl` (长文阅读) 并配合 `mx-auto` 居中。
- **内边距**: 移动端两侧通常保持 `px-6` 或 `px-10` 的安全边距。
- **弹性布局**: 优先使用 `flex` 和 `grid` 处理复杂排版，确保在不同屏幕宽度下的流式扩展。

### 组件开发规范

- **ClassName 合并**: 使用 `@/lib/utils` 中的 `cn(...)` 函数合并 Tailwind 类。
- **变体管理**: 复杂的 UI 组件使用 `class-variance-authority` (cva) 管理状态。
- **单位比例**: 严格遵循系统默认间距比例（4px 倍数）。
- **暗色模式适配**:
  - 优先使用语义化颜色类（如 `bg-background`, `text-muted-foreground`）。
  - 特殊情况使用 `dark:text-white` 进行手动覆盖。

### 主题管理 (ThemeProvider)

- **无闪烁机制**: 使用 `ScriptOnce` 在 `__root.tsx` 中嵌入阻塞式脚本，确保 HTML 渲染前完成 class 注入。
- **三态支持**: 支持 `light`, `dark`, `system` 模式。
- **持久化**: 通过 `localStorage` 记录用户偏好。

### 常用样式模式

- **滚动条**: 使用 `custom-scrollbar` 实用类实现极简滚动条。
- **文字渲染**: 正文使用 `leading-relaxed` (1.6) 提升长文阅读体验；标题使用 `tracking-tight` 增加张力。
- **代码高亮**: 集成 `Shiki` 并通过 CSS 变量确保高亮主题与博客整体配色一致。