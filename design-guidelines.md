# Plynt.space Design Guidelines

This document serves as the source of truth for the aesthetic, thematic, and structural design choices of the Plynt publication platform. Refer to this when building new components or redesigning existing pages to ensure a consistent vibe.

## Theme: Neo-Brutalist Editorial / Structured Broadsheet
The design sits at the intersection of high-end digital journalism and Neo-Brutalism. It rejects the soft, highly-rounded, translucent trends of modern SaaS in favor of something raw, confident, and highly structured. It mimics the strict grid of a printed newspaper broadsheet.

### Core Vibe
- **Authoritative & Professional:** Looks like a serious journalistic outfit or command center.
- **Utilitarian & Raw:** Uses structural lines and high contrast rather than color-coding to build hierarchy.
- **High-Density:** Presents a lot of information (tags, authors, categories) without feeling cluttered, thanks to strict grid boundaries.

---

## Color Palette (Monochrome Utility)
The interface relies entirely on **low-saturation** colors and neutrals. By keeping the UI desaturated, we allow the actual content (article images, avatars) to be the only source of vibrant color, making them pop off the screen.

- **`#fff` (Pure White):** Primary background color.
- **`#111` (Near-Black):** Used for text, borders, and heavy accents. It has zero saturation but is slightly softer than pure `#000` to reduce eye strain while maintaining a heavy "ink-on-paper" look.
- **`#F4F4F5` (Zinc / Cool Gray):** A very low-saturation off-white used for hover states, active backgrounds, and secondary card headers. Provides depth without introducing competing color.
- **`#FDE68A` (Muted Amber / Pastel Yellow):** Used sparingly as an accent (e.g., the "Featured" badge). It is heavily desaturated so it acts like a subtle physical highlighter rather than an alarming neon alert.

---

## Typography
- **Primary Font:** `Inter` (sans-serif).
- **Headers & Labels:** Heavy reliance on uppercase formatting, wide letter-spacing (`letter-spacing: 0.1em` to `1px`), and extreme font-weights (`700`, `800`, `900`).
- **Body Text:** Clean, highly readable, standard weights.

---

## Structural Rules (The "Divided Grid")
Do not use soft, bubbly, or floating elements. Every element should feel anchored to the grid.

1. **Sharp Corners:** `border-radius: 0` everywhere. No rounded cards or pill buttons.
2. **Thick Borders:** Use `1px solid #111` or `2px solid #111` to separate columns, rows, and cards. Let the lines act as the structural skeleton of the page.
3. **Harsh Shadows:** Never use soft, blurred, or translucent drop-shadows. Use harsh, solid offset shadows (e.g., `box-shadow: 4px 4px 0 #111`) for hover effects or elevated cards.
4. **Dividers Over Spacing:** Where a normal site might use 40px of whitespace to separate two sections, we use strict border lines. 

---

## Layout Rules
- **Sticky Sidebars:** Use `position: sticky` for navigation and supplementary sidebars to create a "Command Center" feel. 
- **Body Scrolling:** Avoid inner-scrolling divs with visible scrollbars. Let the main `body` handle the scrolling while sidebars stay locked.
