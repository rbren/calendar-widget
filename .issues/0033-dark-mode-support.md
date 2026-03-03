---
tag: pm
state: open
---

# 0033 — Dark Mode Support

## Problem

Most modern applications support dark mode, and users increasingly expect it. The styling strategy (issue 0007) establishes CSS custom properties for theming, but there is no built-in dark color scheme. Consumers would need to manually override every CSS variable to implement dark mode, which is tedious and leads to inconsistent implementations. A first-class dark theme that respects OS preferences is a baseline expectation for a modern component library.

## Requirements

### Built-in dark theme

Define a dark color palette alongside the existing light defaults. The dark palette should be applied automatically when the user's system prefers dark mode, or when explicitly requested.

### Props

```ts
interface CalendarWidgetProps {
  /** Color scheme preference.
   *  'light' — always use light theme.
   *  'dark' — always use dark theme.
   *  'auto' — follow prefers-color-scheme media query (default). */
  colorScheme?: 'light' | 'dark' | 'auto';
}
```

### CSS implementation

Define dark-mode variable overrides using the `prefers-color-scheme` media query and a data attribute for explicit control:

```css
/* Light theme (default values already in .root from issue 0007) */

/* Auto dark mode via media query */
@media (prefers-color-scheme: dark) {
  .root:not([data-color-scheme='light']) {
    --cw-color-primary: #60a5fa;
    --cw-color-bg: #1f2937;
    --cw-color-text: #f3f4f6;
    --cw-color-text-muted: #6b7280;
    --cw-color-hover: #374151;
    --cw-color-selected: var(--cw-color-primary);
    --cw-color-selected-text: #1f2937;
    --cw-color-today-ring: var(--cw-color-primary);
    --cw-color-disabled: #374151;
    --cw-color-border: #4b5563;
  }
}

/* Explicit dark mode via prop */
.root[data-color-scheme='dark'] {
  --cw-color-primary: #60a5fa;
  --cw-color-bg: #1f2937;
  /* ... same dark values ... */
}
```

### Data attribute

The component should set `data-color-scheme` on the root element based on the `colorScheme` prop:

- `colorScheme="light"` → `data-color-scheme="light"`
- `colorScheme="dark"` → `data-color-scheme="dark"`
- `colorScheme="auto"` (default) → no `data-color-scheme` attribute (let the media query decide)

### Dark theme color guidelines

The dark theme colors should follow established dark mode best practices:

- Background: dark gray (not pure black) — e.g., `#1f2937`
- Text: light gray (not pure white) — e.g., `#f3f4f6`
- Primary/accent: slightly lighter/more saturated version of the light theme primary
- Hover states: lighter surface color rather than darker
- Disabled states: subtle contrast difference, still readable
- Selected state: accent color with dark text for contrast
- Today ring: visible against dark background

### Interaction with consumer overrides

Consumers who override CSS custom properties on a parent element should still be able to override dark mode defaults. The specificity of the dark mode rules should not prevent consumer overrides via CSS custom properties on wrapper elements.

Document the override pattern:

```css
/* Consumer override that works in both light and dark mode */
.my-wrapper {
  --cw-color-primary: #e11d48;
}
```

## Verification

- `<CalendarWidget />` in a system with dark mode preference → dark background, light text, all elements readable.
- `<CalendarWidget />` in a system with light mode preference → light background, dark text (existing behavior).
- `<CalendarWidget colorScheme="dark" />` → always dark, regardless of system preference.
- `<CalendarWidget colorScheme="light" />` → always light, regardless of system preference.
- `<CalendarWidget colorScheme="auto" />` → follows system preference (same as default).
- Dark mode contrast ratios meet WCAG AA (4.5:1 for normal text, 3:1 for large text) — verify with a contrast checker.
- Consumer CSS variable override on parent element works in both light and dark mode.
- All interactive states (hover, focus, selected, disabled, today) are visually distinct in dark mode.
- Unit tests cover: `data-color-scheme` attribute set correctly for each prop value, dark mode CSS variables exist in stylesheet, no attribute set for `auto` mode.
