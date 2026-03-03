---
tag: pm
state: open
---

# 0066 — onFocus / onBlur Widget Callbacks

## Problem

There is no way to detect when the calendar widget gains or loses keyboard/mouse focus. This is critical for:

- **Popover/dropdown calendars** (issue 0038): the calendar should close when the user tabs or clicks away. Without `onBlur`, the consumer must add a global click listener and manually check if the click target is inside the calendar — fragile and non-idiomatic.
- **Form validation**: showing validation messages when the calendar field loses focus (standard `onBlur` form validation pattern).
- **Focus management**: knowing when the user enters the calendar to trigger animations, loading states, or analytics.
- **Multi-widget coordination**: deactivating one calendar when another receives focus.

React's synthetic `onFocus` and `onBlur` events on the root container bubble from child elements, which is exactly the right behavior — the widget should report focus as a unit, not per-cell.

## Requirements

### New props

```ts
interface CalendarWidgetProps {
  /** Called when the calendar widget (or any element inside it) receives focus. */
  onFocus?: (event: React.FocusEvent) => void;
  /** Called when focus leaves the calendar widget entirely (not when moving between cells). */
  onBlur?: (event: React.FocusEvent) => void;
}
```

### Behavior

- `onFocus` fires when focus enters the calendar from outside (e.g., tabbing in, clicking a day cell for the first time). It should NOT fire when focus moves between elements inside the calendar (e.g., arrowing between day cells, clicking the next-month button).
- `onBlur` fires when focus leaves the calendar entirely (e.g., tabbing past the last focusable element, clicking outside). It should NOT fire when focus moves between elements inside the calendar.

### Implementation guidance

Use React's `onFocus` and `onBlur` on the root `<div>` of `CalendarWidget`, combined with `relatedTarget` checking to filter out intra-widget focus moves:

```tsx
const handleFocus = (e: React.FocusEvent) => {
  // Only fire if focus came from outside the widget
  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
    onFocus?.(e);
  }
};

const handleBlur = (e: React.FocusEvent) => {
  // Only fire if focus is moving outside the widget
  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
    onBlur?.(e);
  }
};

return (
  <div className={rootClassName} onFocus={handleFocus} onBlur={handleBlur}>
    ...
  </div>
);
```

### Edge cases

- Clicking from one day cell to another: neither `onFocus` nor `onBlur` fires.
- Clicking the prev/next button while a day cell was focused: neither fires (focus stays inside the widget).
- Tabbing into the calendar from an external input: `onFocus` fires once.
- Tabbing out of the calendar to the next form element: `onBlur` fires once.
- Clicking outside the calendar while a day cell was focused: `onBlur` fires.

## Verification

- Render `<CalendarWidget onFocus={fn} onBlur={fn} />` next to an `<input>`.
- Tab from the input into the calendar → `onFocus` fires once.
- Arrow through several day cells → neither `onFocus` nor `onBlur` fires again.
- Click the next-month button → neither fires.
- Tab out of the calendar to the input → `onBlur` fires once.
- Click a day cell from outside → `onFocus` fires.
- Click outside the calendar → `onBlur` fires.
- Unit tests cover: focus entering from outside, blur leaving to outside, no false fires on intra-widget focus movement, event objects contain correct `relatedTarget`.
