---
tag: pm
state: review
---

# 0016 — Custom Day Cell Rendering

## Problem

Consumers often need to customize what appears inside each day cell — showing price tags for travel booking, dots for events, availability indicators, holiday labels, or badges. Without a render customization escape hatch, consumers are forced to fork the component or wrap it with fragile DOM manipulation.

## Requirements

### `renderDay` prop

Add a render prop that lets consumers inject custom content into each day cell:

```ts
interface DayRenderInfo {
  /** The date this cell represents */
  date: Date;
  /** Whether this date is in the currently displayed month */
  isCurrentMonth: boolean;
  /** Whether this date is today */
  isToday: boolean;
  /** Whether this date is selected */
  isSelected: boolean;
  /** Whether this date is disabled */
  isDisabled: boolean;
  /** Whether this date is within a selected range (if mode="range") */
  isInRange?: boolean;
}

interface CalendarWidgetProps {
  /** Custom render function for day cell content.
   *  Receives the day number as default content and context info.
   *  Return a ReactNode to replace the default content. */
  renderDay?: (dayNumber: React.ReactNode, info: DayRenderInfo) => React.ReactNode;
}
```

### Behavior

- The default rendering (just the day number) is used when `renderDay` is not provided.
- When provided, `renderDay` receives the default day number element and a context object. The consumer can wrap, augment, or completely replace the content.
- The outer cell element (with click handler, ARIA attributes, focus management) is **not** affected by `renderDay` — only the inner content changes. This ensures accessibility and keyboard behavior remain intact regardless of what the consumer renders.

### Example usage

```tsx
<CalendarWidget
  renderDay={(dayNumber, { date, isToday }) => (
    <div>
      {dayNumber}
      {isToday && <span className="badge">🔴</span>}
      {hasEvent(date) && <span className="dot" />}
    </div>
  )}
/>
```

### Constraints

- `renderDay` must not break keyboard navigation or ARIA attributes.
- The cell's click handler, `tabIndex`, `aria-selected`, `aria-disabled`, and `aria-current` must always be managed by the component, not overridable by `renderDay`.
- If `renderDay` returns excessively tall content, the cell should clip via `overflow: hidden` rather than blowing out the grid layout. Document this behavior.

## Verification

- Provide a `renderDay` that adds a dot to certain dates → dots appear only on those dates.
- Provide a `renderDay` that wraps the day number in a `<strong>` tag → day numbers are bold.
- Without `renderDay` → default rendering, no regressions.
- With `renderDay`, verify keyboard navigation still works (arrow keys, Enter to select).
- With `renderDay`, verify ARIA attributes are still correct.
- Excessively tall content in `renderDay` does not break grid layout.
- Unit tests cover: custom render output, context object values (isToday, isSelected, etc.), accessibility preservation with custom render.
