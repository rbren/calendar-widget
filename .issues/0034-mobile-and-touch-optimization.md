---
tag: pm
state: open
---

# 0034 — Mobile & Touch Optimization

## Problem

Calendar widgets are heavily used on mobile devices (date pickers in booking flows, scheduling apps, forms). The current design targets desktop interactions — mouse clicks and keyboard navigation. Without touch optimization, mobile users will experience:

- Tap targets that are too small (WCAG recommends minimum 44×44 CSS pixels for touch).
- No swipe-to-navigate gesture (a universal mobile calendar convention).
- Hover preview states (issue 0012 range preview) that don't work on touch.
- Possible layout overflow on narrow mobile screens.

## Requirements

### Touch-friendly sizing

- The default `--cw-cell-size` (36px from issue 0007) is below the recommended 44px touch target. When the device supports touch (or at narrow viewport widths), the cell size should increase.
- Use a CSS media query approach:

```css
@media (pointer: coarse) {
  .root {
    --cw-cell-size: 44px;
  }
}
```

- The widget should also work correctly when the consumer sets `--cw-cell-size: 44px` (or higher) manually for all viewports.

### Swipe gesture for month navigation

Implement horizontal swipe detection on the calendar grid:

1. Swipe left → navigate to next month.
2. Swipe right → navigate to previous month.
3. In RTL mode (issue 0024), directions reverse.
4. Swipe should feel natural: require a minimum horizontal distance (≥50px) and a primarily horizontal angle (horizontal distance > 2× vertical distance) to distinguish from scrolling.

### Props

```ts
interface CalendarWidgetProps {
  /** Enable swipe gestures for month navigation on touch devices (default: true). */
  enableSwipe?: boolean;
}
```

### Implementation guidance

- Use `touchstart`, `touchmove`, and `touchend` events on the grid container. Do NOT add a dependency on a gesture library — keep the implementation lightweight.
- Track touch start position and touch end position. Calculate horizontal delta.
- Prevent accidental swipe during day cell taps: only trigger swipe if the touch moved a minimum distance.
- Do not call `preventDefault()` on touch events (this would break page scrolling). The swipe detection should be passive.

### Touch interactions for range mode

- On touch devices, range preview (issue 0012 hover preview) is not possible since there's no hover. Instead:
  - After selecting the range start, show a brief "tap end date" instruction label or visual cue.
  - As the user taps the end date, immediately complete the range without preview.
  - Consider a "long-press to preview" interaction: long-pressing a date after selecting the range start shows the range preview, lifting the finger confirms the end date.

### Responsive layout

- At container widths below 300px, ensure the calendar doesn't overflow. Day-of-week headers should use the narrowest format.
- Navigation buttons should have a minimum tap target of 44×44px, with adequate spacing to prevent mis-taps.
- The "Today" button (issue 0014) and month/year heading (issue 0013) should have touch-appropriate sizes.

### Accessibility

- Swipe gestures must not be the only way to navigate — the prev/next buttons remain available. This satisfies WCAG 2.5.1 (Pointer Gestures): all functionality achievable with gestures must also be available via simple pointer actions.
- Add `touch-action: pan-y` to the grid container so vertical scrolling is not blocked.

## Verification

- On a touch device (or using Chrome DevTools device emulation with touch mode), swipe left on the calendar → next month. Swipe right → previous month.
- `enableSwipe={false}` → swiping does nothing.
- Tap on a day cell → normal selection, no accidental swipe trigger.
- Cell size is at least 44px on touch devices (verify with `pointer: coarse` media query active).
- Page scrolling still works normally when touching the calendar and swiping vertically.
- Navigation buttons are at least 44×44px tap targets.
- In RTL mode, swipe directions are reversed.
- Range mode on touch: first tap sets start, second tap sets end, range completes correctly.
- Calendar does not horizontally overflow at 280px container width on mobile.
- Unit tests cover: swipe event handling (mock touch events), `enableSwipe` prop, minimum distance threshold, swipe angle filtering, RTL direction reversal.
