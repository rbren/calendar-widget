---
tag: pm
state: open
---

# 0022 — Animations & Transitions

## Problem

Navigating between months is currently an instant swap. Without transition animations, users lose spatial context — they can't tell whether they went forward or backward. Subtle slide or fade animations are a standard UX polish that makes the widget feel responsive and oriented.

## Requirements

### Default transition

When the user navigates to the next or previous month, the day grid should animate:

- **Next month**: the current grid slides out to the left; the new grid slides in from the right.
- **Previous month**: the current grid slides out to the right; the new grid slides in from the left.
- Duration: ~200ms, with an ease-out curve.
- The animation should be CSS-only (no JavaScript animation libraries) for performance and bundle size.

### Disable animations

```ts
interface CalendarWidgetProps {
  /** Disable transition animations (default: false).
   *  Automatically disabled if the user has prefers-reduced-motion enabled. */
  disableAnimations?: boolean;
}
```

### `prefers-reduced-motion` respect

The widget must check `prefers-reduced-motion: reduce` and disable all animations automatically. This is a WCAG 2.1 AA requirement (Success Criterion 2.3.3). Implementation:

```css
@media (prefers-reduced-motion: reduce) {
  .grid-transition {
    animation: none !important;
    transition: none !important;
  }
}
```

### CSS custom properties

- `--cw-transition-duration` (default: `200ms`)
- `--cw-transition-easing` (default: `ease-out`)

### Scope

Animations apply to:
- Month-to-month navigation (prev/next buttons, keyboard PageUp/PageDown).
- Quick navigation (issue 0013) — when jumping from the month picker back to the day grid.

Animations do **not** apply to:
- Date selection (instant visual feedback).
- Opening/closing the month/year picker (instant swap is fine here).

### Implementation guidance

Use CSS `@keyframes` with a container that has `overflow: hidden` to clip the sliding grids. Swap the animation class (`slide-left` vs `slide-right`) based on navigation direction. Use `onAnimationEnd` to clean up the old grid from the DOM.

Avoid layout thrash: the container height should be fixed during the animation to prevent page reflow.

## Verification

- Navigate forward → grid slides left. Navigate backward → grid slides right.
- Animation completes in ~200ms (visually smooth, not sluggish).
- `disableAnimations={true}` → instant swap, no animation.
- System has `prefers-reduced-motion: reduce` → no animation regardless of `disableAnimations` prop.
- Override `--cw-transition-duration: 500ms` → animation is slower.
- Rapid prev/next clicks do not cause visual glitches or stale grids.
- Unit tests cover: animation class applied on navigation, correct direction class, `disableAnimations` prevents animation class, `prefers-reduced-motion` media query exists in CSS output.
