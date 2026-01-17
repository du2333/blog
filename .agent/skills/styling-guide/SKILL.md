---
name: styling-guide
description: Styling and design guidelines for the Flare Stack Blog. Use when modifying CSS, creating UI components, adjusting layouts, handling dark mode, or optimizing typography.
---

# Styling & Design Guide

The project pursues a **Strict Minimalist** and **Typography-driven** design aesthetic, inspired by high-end technical blogs.

## Core Aesthetic Principles

1.  **Typography is UI**: The interface relies almost entirely on font choices, sizes, and spacing.
2.  **Monochrome Palette**: Strict use of black and white (Foreground/Background). No brand colors unless absolutely necessary for interactivity (hover states).
3.  **Generous Whitespace**: 
    - Use larger vertical gaps (e.g., `space-y-20`, `py-32`) to create a calm reading experience.
    - Avoid dense packing of information.
4.  **Micro-Interactions**: Subtle, staggered animations (`animate-in`, `slide-in-from-bottom`) that respect the user's focus.

## Technical Stack

### Tailwind CSS v4

- **Configuration**: All theme definitions in `src/styles.css` `@theme` block.
- **Colors**:
    - `foreground`: #000 (Light) / #fff (Dark)
    - `background`: #fff (Light) / #000 (Dark)
    - `muted-foreground`: #666 (Light) / #888 (Dark)
    - `border`: Very subtle (#e5e5e5 / #333)

### Font Configuration

| Category | Fonts | Usage |
| :--- | :--- | :--- |
| **Serif (Display)** | `Noto Serif SC` | **Primary Headings** (H1, H2), Introductions |
| **Sans (Body)** | `Inter`, `Noto Sans SC` | Long-form reading, UI text |
| **Mono (Meta)** | `JetBrains Mono` | Dates, Tags, Code blocks, Reading time |

## Component Patterns

### Post List (Minimalist)
- **Layout**: Simple vertical stack.
- **Elements**: 
    - Title (Serif, Large)
    - Metadata (Mono, Small, Muted)
    - Summary (Sans, Light)
- **Visuals**: No borders between items (or very subtle), rely on vertical spacing `py-12`.

### Animations
Use `tailwindcss-animate` utilities:
- **Page Load**: `animate-in fade-in slide-in-from-bottom-4 duration-700`
- **Hover**: Simple color shifts or small translations (`translate-x-2`).

## Best Practices

### Chinese UI
- Priorities `Noto Serif SC` for headings to give a "printed" feel.
- Ensure `Intl.DateTimeFormat` is used for all dates (e.g., "2024年1月1日").

### Layout
- **Max Width**: Keep reading columns narrow (`max-w-3xl`) for optimal line length.
- **Mobile First**: Design for the vertically stacked mobile view first, then expand margins for desktop.

