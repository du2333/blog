---
name: styling-guide
description: Official styling and design guidelines for the Flare Stack Blog.
---

# Design & Styling Guidelines

## 1. Design Philosophy: "Programmer Minimalist"

The project aims for an **Industrial, Text-Forward** aesthetic, similar to a high-quality CLI tool or technical manual.

-   **Content First**: The interface should recede. Rely on typography and spacing rather than decoration (shadows, borders, rounds) to define structure.
-   **Monochrome Palette**: Use a strict Black & White system. Depth is created through **Opacity** (e.g., `text-muted-foreground`), not color.
-   **Precision**: Alignments should be exact. Spacing should be generous (`space-y-12`+) but consistent.

## 2. Typography System

We use a curated font stack to enforce hierarchy.

| Role | Font Family | Usage |
| :--- | :--- | :--- |
| **Headings** | `Noto Serif SC Variable` | Primary structural elements. Use **Medium** weight and **Tight** tracking. |
| **Body** | `Noto Sans SC Variable` | Long-form reading and general UI. Use **Relaxed** leading. |
| **Data / Meta** | `JetBrains Mono Variable` | Timestamps, IDs, Tags, Stats. |

> **Rule**: Avoid mixing sans-serif bold for headings. If it's a heading, it's likely Serif. If it's technical data, it's Mono.

## 3. CSS Architecture

Global styles are centralized in `src/styles.css` (Tailwind v4).

-   **Base Styles**: We use `@apply` in the `base` layer to set defaults for `h1`-`h6`, `p`, and `ul`/`ol`.
-   **Markdown First**: Default HTML elements are styled for Markdown content (e.g., lists have bullets).
-   **UI Reset**: When building UI components (Navs, Sidebars), you must explicitly **reset** standard elements (e.g., `list-none m-0 p-0` for lists).

## 4. General Patterns

-   **Buttons**: Prefer text-based buttons or icon-only actions. Avoid heavy backgrounds.
-   **Navigation**: Keep it subtle. Sticky elements should not obstruct content.
-   **Layout**:
    -   **Mobile First**: Always ensure horizontal lists (like Tags) wrap.
    -   **Spacing**: Err on the side of too much whitespace rather than too little.
-   **Interaction**: Hover effects should be subtle changes in opacity or color (Black -> Grey), avoiding layout shifts.
