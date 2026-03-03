---
tag: pm
state: open
---

# 0054 — Right-Click Context Menu Callback

## Problem

Desktop users commonly right-click on UI elements to access contextual actions (copy, add event, view details). The calendar widget provides no `onDayContextMenu` callback, making it impossible for consumers to attach custom context menus to individual date cells without resorting to `renderDay` (issue 0016) with manual event wiring in every cell.

Applications that embed calendars (project management tools, scheduling apps, CRM dashboards) frequently need per-date context menus for power-user workflows like "Create event on this date", "Copy date", "Mark as holiday", or "View activity".

## Requirements

### New prop

```ts
interface CalendarWidgetProps {
  /** Called when a day cell is right-clicked (contextmenu event).
   *  Receives the date and the native MouseEvent for positioning a custom menu. */
  onDayContextMenu?: (date: Date, event: React.MouseEvent) => void;
}
```

### Behavior

- **Right-click on a day cell:** Fire `onDayContextMenu(date, event)`. The consumer receives both the calendar date and the native event (for `clientX`/`clientY` positioning of a custom popover menu).
- **The widget does NOT render any context menu itself.** It only provides the callback. Rendering a menu is the consumer's responsibility.
- **`event.preventDefault()` is NOT called by the widget.** The consumer decides whether to suppress the browser's native context menu by calling `event.preventDefault()` in their handler.
- **Disabled days:** The callback fires on disabled days too. Consumers can filter in their handler.
- **Outside days:** The callback fires on visible outside days.

### Implementation guidance

Add `onContextMenu` to each `<td>` in `CalendarDayCell`:

```tsx
const handleContextMenu = (e: React.MouseEvent) => {
  onDayContextMenu?.(date, e);
};

<td
  onContextMenu={handleContextMenu}
  // ... existing props
>
```

### Prop threading

```ts
interface CalendarDayCellProps {
  // ... existing props
  /** Called on right-click / context menu */
  onDayContextMenu?: (date: Date, event: React.MouseEvent) => void;
}

interface CalendarGridProps {
  // ... existing props
  /** Called on right-click / context menu on a day cell */
  onDayContextMenu?: (date: Date, event: React.MouseEvent) => void;
}
```

### Accessibility

- Context menus are inherently mouse-centric. For keyboard parity, consumers should also listen for a keyboard equivalent (e.g., Shift+F10 or the Menu key). This is outside the widget's scope but should be documented: "For keyboard-accessible context menus, combine `onDayContextMenu` with a keyboard listener for the Menu key or Shift+F10 on focused cells."

## Verification

- Right-click on March 15 → `onDayContextMenu` fires with a Date for March 15 and the native MouseEvent.
- `event.clientX` and `event.clientY` are usable for positioning a popover menu.
- Consumer calls `event.preventDefault()` → browser native context menu does not appear.
- Consumer does NOT call `event.preventDefault()` → browser native context menu appears normally.
- Right-click on a disabled date → callback fires.
- `onDayContextMenu` not provided → no errors, browser context menu works normally.
- Build a demo: right-click a date → custom popover shows "Create event on March 15" at the cursor position.
- Unit tests cover: callback invocation with correct date and event, disabled day context menu, callback not provided (no crash), event object properties available.
