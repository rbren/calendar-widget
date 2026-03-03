---
tag: pm
state: open
---

# 0053 — Size Presets

## Problem

While the widget exposes individual CSS custom properties for sizing (`--cw-cell-size`, `--cw-font-size`, `--cw-border-radius`), there is no convenient way to switch the entire widget between common size configurations. Consumers who want a compact calendar for a sidebar or a large calendar for a full-page view must manually override 3–5 CSS properties each time. This leads to:

- Repeated boilerplate CSS across projects.
- Inconsistent sizing when consumers forget to adjust one of the related properties.
- No standard compact mode for mobile or embedded use cases.

Most design systems provide T-shirt size variants (small, medium, large) for their components. A `size` prop that adjusts all dimensions proportionally provides a much better developer experience.

## Requirements

### New prop

```ts
interface CalendarWidgetProps {
  /** Size preset that adjusts cell size, font size, and spacing.
   *  - 'sm': compact (28px cells, 12px font) — ideal for sidebars, inline widgets
   *  - 'md': default (36px cells, 14px font) — current behavior
   *  - 'lg': large (48px cells, 16px font) — ideal for full-page, touch-heavy UIs
   *  Default: 'md' */
  size?: 'sm' | 'md' | 'lg';
}
```

### CSS token overrides per size

The `size` prop should apply a CSS class on the root element that overrides the relevant design tokens:

**Small (`sm`):**
```css
.sizeSm {
  --cw-cell-size: 28px;
  --cw-font-size: 12px;
  --cw-border-radius: 4px;
  --cw-marker-size: 4px;
}
```

**Medium (`md`):** No extra class needed—uses the base design token defaults.

**Large (`lg`):**
```css
.sizeLg {
  --cw-cell-size: 48px;
  --cw-font-size: 16px;
  --cw-border-radius: 8px;
  --cw-marker-size: 6px;
}
```

### Implementation guidance

In `CalendarWidget.tsx`, add the size class to the root element:

```tsx
const sizeClass = props.size === 'sm' ? styles.sizeSm
                : props.size === 'lg' ? styles.sizeLg
                : undefined;

const rootClassName = [styles.root, sizeClass, className].filter(Boolean).join(' ');
```

Add the `.sizeSm` and `.sizeLg` classes to `CalendarWidget.module.css`.

### Interaction with manual CSS overrides

The `size` prop sets design tokens via CSS specificity. A consumer can still override individual tokens after applying a size:

```css
.my-compact-calendar {
  --cw-cell-size: 32px; /* override just cell size within sm preset */
}
```

```tsx
<CalendarWidget size="sm" className="my-compact-calendar" />
```

Document this layering: `size` sets reasonable defaults → consumer `className` can override individual tokens.

### Interaction with mobile optimization (issue 0034)

Issue 0034 proposes increasing cell size to 44px on touch devices via `@media (pointer: coarse)`. The `size="lg"` preset (48px) already satisfies the touch target requirement. Document that consumers targeting mobile can use `size="lg"` as an alternative to the media-query approach, or combine both.

## Verification

- Default (no `size` prop): cell size is 36px, font size is 14px. Identical to current behavior.
- `size="sm"`: cell size is 28px, font size is 12px. Calendar is visibly more compact.
- `size="lg"`: cell size is 48px, font size is 16px. Calendar is visibly larger.
- `size="sm"` with `className` that overrides `--cw-cell-size: 32px`: cell size is 32px (consumer override wins).
- Switching `size` prop dynamically (e.g., responsive breakpoint logic): calendar resizes correctly without remount.
- All three sizes render correctly without overflow at reasonable container widths (280px for sm, 320px for md, 400px for lg).
- Keyboard navigation and accessibility features work identically across all sizes.
- Unit tests cover: correct CSS class applied for each size value, default when prop omitted, className merging, snapshot comparison of rendered output per size.
