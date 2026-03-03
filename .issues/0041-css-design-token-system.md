---
tag: pm
state: open
---

# 0041 — CSS Design Token System

## Problem

Multiple issues reference individual CSS custom properties (`--cw-color-primary`, `--cw-color-range-bg`, `--cw-transition-duration`, etc.), but there is no comprehensive, documented theming system that defines the full set of tokens, their defaults, and how consumers override them. Without a single source of truth for the design token API:

- Consumers don't know which properties they can safely override.
- Internal development adds tokens ad-hoc without consistency.
- Theming requires reading source code instead of documentation.
- Third-party theme packages cannot be built reliably.

A complete design token system is the foundation for all customizability — it's what enables dark mode (issue 0033), brand theming, and seamless integration with existing design systems.

## Requirements

### Token categories

Define CSS custom properties in the following categories, all prefixed with `--cw-`:

#### Colors

| Token | Default | Description |
|---|---|---|
| `--cw-color-primary` | `#2563eb` | Accent color for selected dates, buttons |
| `--cw-color-primary-hover` | `#1d4ed8` | Accent hover state |
| `--cw-color-primary-text` | `#ffffff` | Text color on primary background |
| `--cw-color-bg` | `#ffffff` | Widget background |
| `--cw-color-text` | `#1f2937` | Primary text color |
| `--cw-color-text-muted` | `#6b7280` | Secondary text (week numbers, outside days) |
| `--cw-color-border` | `#e5e7eb` | Borders and separators |
| `--cw-color-disabled` | `#d1d5db` | Disabled element color |
| `--cw-color-disabled-text` | `#9ca3af` | Disabled text color |
| `--cw-color-hover-bg` | `#f3f4f6` | Day cell hover background |
| `--cw-color-today-ring` | `#2563eb` | Today indicator ring/border color |
| `--cw-color-range-bg` | `#dbeafe` | In-range background (range mode) |
| `--cw-color-range-preview-bg` | `rgba(219, 234, 254, 0.5)` | Range preview on hover |

#### Sizing

| Token | Default | Description |
|---|---|---|
| `--cw-cell-size` | `40px` | Width and height of each day cell |
| `--cw-cell-font-size` | `14px` | Day number font size |
| `--cw-header-font-size` | `16px` | Month/year label font size |
| `--cw-weekday-font-size` | `12px` | Day-of-week header font size |
| `--cw-nav-button-size` | `32px` | Navigation button dimensions |
| `--cw-border-radius` | `8px` | Widget container border radius |
| `--cw-cell-border-radius` | `50%` | Day cell border radius (50% = circle) |

#### Spacing

| Token | Default | Description |
|---|---|---|
| `--cw-padding` | `16px` | Widget internal padding |
| `--cw-header-gap` | `8px` | Gap between header elements |
| `--cw-grid-gap` | `2px` | Gap between grid cells |
| `--cw-month-gap` | `16px` | Gap between months in multi-month view |

#### Typography

| Token | Default | Description |
|---|---|---|
| `--cw-font-family` | `inherit` | Font family (inherits from page) |
| `--cw-font-weight-normal` | `400` | Normal text weight |
| `--cw-font-weight-bold` | `600` | Bold text weight (selected day, header) |

#### Animation

| Token | Default | Description |
|---|---|---|
| `--cw-transition-duration` | `200ms` | Month transition duration |
| `--cw-transition-easing` | `ease-out` | Transition easing curve |

#### Markers

| Token | Default | Description |
|---|---|---|
| `--cw-marker-size` | `5px` | Event marker dot size |
| `--cw-marker-gap` | `2px` | Gap between multiple markers |

### Implementation

1. Define all tokens with their defaults in a `:root` or `.cw-root` scope in the component's base CSS file (e.g., `src/styles/tokens.css`).
2. All internal styles must reference tokens — no hardcoded color values, font sizes, or spacing in component CSS.
3. Consumers override tokens by setting them on a parent element or the widget's `style` prop:

```css
/* Consumer's CSS */
.my-calendar {
  --cw-color-primary: #e11d48;
  --cw-color-bg: #fafafa;
  --cw-cell-size: 48px;
}
```

```tsx
<CalendarWidget className="my-calendar" />
```

### Theme presets (optional, recommended)

Provide a few built-in theme presets as importable CSS files:

```tsx
import '@calendar-widget/core/themes/compact.css';   // smaller cells, tighter spacing
import '@calendar-widget/core/themes/rounded.css';    // pill-shaped cells
```

These are pure CSS files that only set `--cw-*` tokens. They don't add any JavaScript.

### Documentation

The full token table must be included in the README (issue 0009) and available as a TypeScript type for IDE autocomplete when used with the `style` prop:

```ts
interface CalendarCSSProperties extends React.CSSProperties {
  '--cw-color-primary'?: string;
  '--cw-color-bg'?: string;
  // ... all tokens
}
```

## Verification

- Every visual property in the widget is controlled by a CSS custom property — inspect elements in DevTools, no hardcoded values.
- Override `--cw-color-primary` on the root → selected dates, nav buttons, today ring all update.
- Override `--cw-cell-size` → all cells resize, grid adjusts.
- Override `--cw-font-family` → all text uses the new font.
- Default values produce a clean, usable calendar without any consumer overrides.
- Theme preset CSS files override tokens correctly when imported.
- TypeScript: `style={{ '--cw-color-primary': 'red' } as CalendarCSSProperties}` compiles without error.
- Unit tests: verify token CSS file is included in the build output, verify no hardcoded color/size values in component CSS (lint rule or grep check).
- Visual regression: screenshot test with default tokens vs custom theme to ensure all elements respond to token changes.
