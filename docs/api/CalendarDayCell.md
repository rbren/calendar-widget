# CalendarDayCell

Renders a single day cell inside the calendar grid.

```tsx
import { CalendarDayCell } from '@calendar-widget/core';
```

> **Note:** You only need to import this directly if you are building a custom calendar layout. For standard usage, `CalendarGrid` renders it automatically.

## Props — `CalendarDayCellProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `date` | `Date` | — | The date this cell represents. |
| `isCurrentMonth` | `boolean` | — | `true` if the date belongs to the currently displayed month. |
| `isToday` | `boolean` | — | `true` if the date is today. |
| `isSelected` | `boolean` | — | `true` if the date is currently selected. |
| `isDisabled` | `boolean` | — | `true` if the date is disabled (out of range or explicitly disabled). |
| `isFocusTarget` | `boolean` | — | `true` if this cell should receive keyboard focus (roving tabindex). |
| `isRangeStart` | `boolean` | `undefined` | `true` if this date is the start of a selected range. |
| `isRangeEnd` | `boolean` | `undefined` | `true` if this date is the end of a selected range. |
| `isInRange` | `boolean` | `undefined` | `true` if this date falls within a selected range (not start/end). |
| `isInPreview` | `boolean` | `undefined` | `true` if this date falls within the hover preview range. |
| `isPreviewStart` | `boolean` | `undefined` | `true` if this date is the start of the preview range. |
| `isPreviewEnd` | `boolean` | `undefined` | `true` if this date is the end of the preview range. |
| `onSelect` | `(date: Date) => void` | — | Called when the cell is clicked or activated via `Enter`/`Space`. |
| `onHover` | `(date: Date \| null) => void` | `undefined` | Called when the mouse enters this cell. |
| `locale` | `string` | `undefined` | Locale for formatting the accessible date label. |
| `markerLabel` | `string` | `undefined` | Optional marker/event label to include in the accessible name. |
| `renderDay` | `(dayNumber: ReactNode, info: DayRenderInfo) => ReactNode` | `undefined` | Custom render function for day cell content. When provided, the return value replaces the default day number element. Receives the default content and a `DayRenderInfo` context. |

## Accessibility

- Rendered as a `<td>` with `role="gridcell"`.
- Uses roving `tabIndex`: the focused cell gets `tabIndex={0}`, all others get `tabIndex={-1}`.
- `aria-selected` is `true` when the cell is selected, a range start, or a range end.
- `aria-disabled` reflects the disabled state.
- `aria-current="date"` is set on today's cell.
- `aria-label` provides a full descriptive label, e.g. `"Saturday, March 15, 2026 (today, selected)"` or `"Monday, March 10, 2026 (selected, start of range)"`.
- Responds to `Enter` and `Space` key presses for selection.

## Visual states

| State | CSS class | Visual effect |
|-------|-----------|---------------|
| Outside current month | `.outside` | Muted text color |
| Today | `.today` | Inset ring in the primary color |
| Selected | `.selected` | Primary background, white text |
| Disabled | `.disabled` | Light gray text, no pointer events |
| Range start | `.rangeStart` | Primary background, left-rounded corners |
| Range end | `.rangeEnd` | Primary background, right-rounded corners |
| In range | `.inRange` | Light blue background (`--cw-color-range-bg`) |
| Preview start | `.previewStart` | Left-rounded corners with preview background |
| Preview end | `.previewEnd` | Right-rounded corners with preview background |
| In preview | `.inPreview` | Semi-transparent background (`--cw-color-range-preview-bg`) |
