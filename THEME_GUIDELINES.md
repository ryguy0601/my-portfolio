# Theme and Styling Guidelines for Antigravity

This document outlines the strict guidelines for maintaining visual and thematic consistency across this portfolio and admin codebase.

## 1. Never Hardcode Generic Bootstrap Alert or Component Colors
- Do NOT use standard bootstrap classes like `.alert-info` with generic bright blue backgrounds (`#cfe2ff` / `rgb(13, 202, 240)`).
- When creating UI cards, banners, or notification logs, ALWAYS pull colors and borders from the active CSS variables.

## 2. Active Theme Variables
The portfolio uses dynamic theme variables defined in `src/utils/theme.ts` and injected into the document root:

| CSS Variable | Purpose |
|---|---|
| `var(--color-primary)` | Primary accent color (e.g. pink `#e83e9f`) |
| `var(--color-secondary)` | Secondary accent color (e.g. purple `#9b5de5`) |
| `var(--color-info)` | Info accent (maps to `var(--color-primary)`) |
| `var(--color-success)` | Success green (e.g. `#34d399`) |
| `var(--color-warning)` | Warning amber (e.g. `#ffc107`) |
| `var(--color-danger)` | Error / Cutoff red (e.g. `#ff5252`) |
| `var(--card-bg)` | Dark card background |
| `var(--card-border-color)` | Border color matching the palette |
| `var(--body-bg)` | Page background |
| `var(--body-color)` | Light body text |
| `var(--color-text-muted-light)` | High-contrast muted text on dark bg |
| `var(--color-text-muted-mid)` | Mid muted text |
| `var(--gradient-text)` | Gradient text accent |

## 3. Gemini Log & Feedback Banner Styling
For Gemini AI output logs and feedback panels:
- Use a dark backdrop with theme tint: `background-color: rgba(var(--card-bg-rgb, 26, 13, 36), 0.95);` or `background: color-mix(in srgb, var(--color-primary) 10%, var(--card-bg));`
- Border: `border: 1px solid color-mix(in srgb, var(--color-primary) 40%, transparent);`
- Header: Text with `.text-accent` or `color: var(--color-primary-light);`
- Body: `color: var(--body-color);`
- Bullet points: `color: var(--color-text-muted-light);`

## 4. White Paper Previews (Resume & Cover Letter)
- Both the simulated 8.5" × 11" Resume Sheet and the Cover Letter Sheet represent physical white paper documents.
- They MUST have `background-color: #ffffff !important;` and high-contrast dark text (`#0f172a` for headings/bold, `#1f2937` for body, `#4b5563` for contact info).
- They must NEVER inherit dark mode `text-light` or light pastel theme colors.
- The 1-page resume detector viewport height is calibrated to 11 inches (`1056px` unscaled). If content overflows 11 inches, vertical scrolling allows the user to inspect the overflow past the red 1-page cutoff line.
