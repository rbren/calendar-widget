# CalendarDayCell

Renders a single day cell inside the calendar grid.

```tsx
import { CalendarDayCell } from '@calendar-widget/core';
```

> **Note:** You only need to import this directly if you are building a custom calendar layout. For standard usage, the internal `CalendarGrid` renders it automatically.

## Props — `CalendarDayCellProps`

| Prop | Type | Description |
|------|------|-------------|
| `date` | `Date` | The date this cell represents. |
| `isCurrentMonth` | `boolean` | `true` if the date belongs to the currently displayed month. |
| `isToday` | `boolean` | `true` if the date is today. |
| `isSelected` | `boolean` | `true` if the date is currently selected. |
| `isDisabled` | `boolean` | `true` if the date is disabled (out of range or explicitly disabled). |
| `isFocusTarget` | `boolean` | `true` if this cell should receive keyboard focus (roving tabindex). |
| `onSelect` | `(date: Date) => void` | Called when the cell is clicked or activated via `Enter`/`Space`. |

## Accessibility

- Rendered as a `<td>` with `role="gridcell"`.
- Uses roving `tabIndex`: the focused cell gets `tabIndex={0}`, all others get `tabIndex={-1}`.
- `aria-selected` reflects the selection state.
- `aria-disabled` reflects the disabled state.
- `aria-current="date"` is set on today's cell.
- Responds to `Enter` and `Space` key presses for selection.

## Visual states

| State | CSS class | Visual effect |
|-------|-----------|---------------|
| Outside current month | `.outside` | Muted text color |
| Today | `.today` | Inset ring in the primary color |
| Selected | `.selected` | Primary background, white text |
| Disabled | `.disabled` | Light gray text, no pointer events |
