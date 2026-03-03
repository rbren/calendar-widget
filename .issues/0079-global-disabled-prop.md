---
tag: pm
state: open
---

# 0079 — Global `disabled` Prop

## Problem

There is no way to disable the entire calendar widget at once. In form-based UIs, it is a basic expectation that any input component can be globally disabled — visually dimmed, non-interactive, and unable to receive focus. This is distinct from read-only mode (issue 0062), where the calendar still looks active and shows the current selection but prevents changes. A disabled calendar should look and behave like a disabled form control.

## Requirements

### `disabled` prop

```ts
interface CalendarWidgetProps {
  /** When true, the entire calendar is non-interactive: no clicks, no keyboard
   *  navigation, no hover effects. The widget is visually dimmed and
   *  `aria-disabled="true"` is set on the root element. Default: false. */
  disabled?: boolean;
}
```

### Behavior when `disabled` is true

- All day cells have `tabIndex={-1}` (none are focusable).
- Clicking any day cell, navigation button, Today button, or quick-nav heading does nothing.
- Keyboard events (arrow keys, Enter, Space) are ignored.
- Mouse hover does not trigger highlight or range preview.
- The root `<div>` receives `aria-disabled="true"`.
- All buttons inside the header receive the `disabled` HTML attribute.
- The widget applies a `.disabled` CSS class on the root element that reduces opacity (e.g., `opacity: 0.5`) and sets `pointer-events: none`.

### Interaction with other props

- `disabled` takes precedence over `readOnly` (issue 0062) — if both are true, the widget is disabled.
- `onChange`, `onMonthChange`, and `onDayFocus` callbacks are never called while disabled.
- The currently selected `value` is still displayed visually (just dimmed).

## Implementation Notes

1. Accept `disabled?: boolean` on `CalendarWidgetProps`.
2. In `CalendarWidget`, conditionally add the `.disabled` class to the root and set `aria-disabled`.
3. In `useCalendarState`, short-circuit `selectDate`, `focusDate`, `hoverDate`, `goToPrevMonth`, `goToNextMonth`, `goToToday`, `drillUp`, and all navigation functions when `disabled` is true.
4. Pass `disabled` through to `CalendarHeader` to disable its buttons.
5. In `CalendarGrid`, skip keyboard handling when disabled.
6. Add CSS:
   ```css
   .root.disabled {
     opacity: 0.5;
     pointer-events: none;
   }
   ```

## Verification

- Render with `disabled={true}` → clicking any day does nothing, `onChange` is not called.
- Tab through the page → focus skips the calendar entirely.
- Arrow keys do nothing when the calendar is on screen.
- Navigation buttons (prev/next, Today, heading) are all visually disabled and non-clickable.
- The widget is visually dimmed at ~50% opacity.
- `aria-disabled="true"` is present on the root element.
- Toggling `disabled` from `true` to `false` restores full interactivity.
- Unit tests: disabled blocks click, disabled blocks keyboard nav, disabled blocks hover, disabled sets aria-disabled, disabled adds opacity class.
