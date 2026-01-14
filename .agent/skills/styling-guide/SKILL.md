---
name: styling-guide
description: Styling and design guidelines for the Flare Stack Blog. Use when modifying CSS, creating UI components, adjusting layouts, handling dark mode, or optimizing typography.
---

# Styling & Design Guide

The project pursues a **Minimalist** and **Typography-driven** Awwwards-style design aesthetic.

## Core Aesthetic Principles

1. **Generous Whitespace**: Maintain ample spacing to avoid visual clutter
2. **Typography First**: High-quality variable fonts with clear serif/sans-serif contrast
3. **Fully Responsive**: **All designs must work perfectly on mobile, tablet, and desktop** (Mobile First)
4. **High Contrast**: Grayscale palette, pure backgrounds (white/black), emphasize text readability
5. **Micro-interactions**: Subtle transitions (0.3s-0.5s), smooth theme switching
6. **Hard Edges**: Prefer `rounded-sm` or `rounded-none` with thin borders (`border-border`)

## Technical Stack

### Tailwind CSS v4

The project uses Tailwind CSS v4 preview (CSS-first architecture):

- **Configuration**: All theme definitions in `src/styles.css` `@theme` block (not `tailwind.config.ts`)
- **Variants**: Use `@custom-variant` for dark mode, system mode, etc.
- **Layers**: Organize CSS with `@layer base`, `@layer utilities`

### Color System (CSS Variables)

Semantic CSS variables for smooth dark mode transitions:

| Variable                             | Purpose                        |
| :----------------------------------- | :----------------------------- |
| `--background` / `--foreground`      | Base background and text       |
| `--primary` / `--primary-foreground` | Brand/accent color             |
| `--muted` / `--muted-foreground`     | Secondary text and backgrounds |
| `--border`                           | Unified border color           |
| `--selection`                        | Custom text selection color    |

### Font Configuration

Integrated via `@fontsource-variable` for performance:

| Category             | Fonts                           | Usage                             |
| :------------------- | :------------------------------ | :-------------------------------- |
| **Serif (Headings)** | Playfair Display, Noto Serif SC | H1-H4                             |
| **Sans (Body)**      | Inter, Noto Sans SC             | Main content                      |
| **Mono (Code)**      | JetBrains Mono                  | Code, metadata (dates, read time) |

## Best Practices

### Chinese UI

- Prefer Chinese as the primary UI language

### Responsive Layout

| Aspect      | Guideline                                             |
| :---------- | :---------------------------------------------------- |
| Breakpoints | Use Tailwind standard: `sm`, `md`, `lg`, `xl`         |
| Container   | `max-w-7xl` or `max-w-4xl` (long-form) with `mx-auto` |
| Padding     | Mobile sides: `px-6` or `px-10`                       |
| Layout      | Prefer `flex` and `grid` for complex layouts          |

### Component Development

```typescript
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

// Use cn() for className merging
<div className={cn("base-class", conditional && "conditional-class")} />

// Use cva for variants
const buttonVariants = cva("base-button-styles", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      outline: "border border-border",
    },
    size: {
      sm: "h-8 px-3",
      md: "h-10 px-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});
```

### Spacing & Units

- Strictly follow 4px multiples (Tailwind's spacing scale)
- Consistent use of spacing utilities

### Dark Mode Adaptation

1. **Prefer semantic colors**: `bg-background`, `text-muted-foreground`
2. **Manual override when needed**: `dark:text-white`

## Theme Management (ThemeProvider)

### Flash-Free Implementation

Use `ScriptOnce` in `__root.tsx` to inject a blocking script that sets the theme class before render.

### Three-State Support

- `light`: Force light mode
- `dark`: Force dark mode
- `system`: Follow OS preference

### Persistence

User preference stored in `localStorage`.

## Common Style Patterns

### Custom Scrollbar

```html
<div className="custom-scrollbar overflow-y-auto"></div>
```

### Text Rendering

| Element   | Class             | Purpose                           |
| :-------- | :---------------- | :-------------------------------- |
| Body text | `leading-relaxed` | 1.6 line height for readability   |
| Headings  | `tracking-tight`  | Tighter letter spacing for impact |

### Code Highlighting

- **Engine**: Shiki
- **Theme**: CSS variables ensure highlight theme matches blog colors

## Decision Tree

When styling a component:

1. **Is it a new atomic component?** → Create in `components/ui/` with `cva`
2. **Does it need variants?** → Use `cva` to define variant classes
3. **Does it need conditional styles?** → Use `cn()` helper
4. **Does it work on mobile?** → Test breakpoints, adjust spacing
5. **Does it work in dark mode?** → Check semantic colors, add `dark:` if needed
