---
tag: pm
state: open
---

# 0082 — `autoFocus` Prop

## Problem

When the calendar is used inside a popover, dropdown, or modal, the expected UX is that focus moves into the calendar as soon as it appears. Currently, the component does not focus any element on mount — the user must press Tab to reach the calendar grid. This creates a poor experience for keyboard users in popup contexts and is inconsistent with how native `<input autoFocus>` works.

## Requirements

### `autoFocus` prop

```ts
interface CalendarWidgetProps {
  /** When true, the calendar automatically moves focus to the focused day cell
   *  on initial mount. Useful when the calendar appears in a popover or modal.
   *  Default: false. */
  autoFocus?: boolean;
}
```

### Behavior

- When `autoFocus={true}`, on the first render after mount, the day cell with `tabIndex={0}` (the focused date) receives DOM focus via `.focus()`.
- This only happens once, on mount. Subsequent re-renders do not steal focus.
- If the calendar is rendered with `disabled={true}` (issue 0079), `autoFocus` is ignored.
- The focus call should happen in a `useEffect` after the first paint, not during render.
- Screen readers should announce the focused cell when auto-focused.

## Implementation Notes

1. Add `autoFocus?: boolean` to `CalendarWidgetProps`.
2. In `CalendarGrid` (or `CalendarWidget`), add a mount-only effect:
   ```ts
   const didMount = useRef(false);
   useEffect(() => {
     if (autoFocus && !didMount.current && tableRef.current) {
       const cell = tableRef.current.querySelector<HTMLElement>('td[tabindex="0"]');
       cell?.focus();
     }
     didMount.current = true;
   }, []); // eslint-disable-line react-hooks/exhaustive-deps
   ```
3. Pass `autoFocus` from `CalendarWidget` through to `CalendarGrid`.

## Verification

- Render calendar inside a dialog with `autoFocus={true}` → the focused day cell has DOM focus immediately, no Tab needed.
- Screen reader announces the focused day cell's aria-label.
- Render with `autoFocus={false}` (default) → no element is focused on mount.
- Render with `autoFocus={true}` and `disabled={true}` → no element is focused.
- Navigate to a different month, then return → focus is NOT stolen again (mount-only).
- Unit tests: autoFocus moves focus to tabindex=0 cell on mount, autoFocus=false does not, autoFocus does not re-fire on update.
