# MonthPicker

Renders a 4×3 grid of month names for the given year. Used by `CalendarWidget` as the drill-up view when the user clicks the month/year heading.

```tsx
import { MonthPicker } from '@calendar-widget/core';
```

> **Note:** You only need to import this directly if you are building a custom calendar layout. For standard usage, `CalendarWidget` renders it automatically when the view is `'months'`.

## Props — `MonthPickerProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `year` | `number` | — | The year being displayed. |
| `currentMonth` | `number` | — | Currently viewed month (0–11) for highlighting. |
| `currentYear` | `number` | — | Currently viewed year for highlighting. |
| `locale` | `string` | `undefined` | Locale for month name formatting (uses `Intl.DateTimeFormat` with `{ month: 'short' }`). |
| `onSelectMonth` | `(month: number) => void` | — | Called when a month cell is clicked or activated via `Enter`/`Space`. |
| `onCancel` | `() => void` | — | Called when `Escape` is pressed, returning to the previous view. |

## Keyboard navigation

| Key | Action |
|-----|--------|
| `←` / `→` | Move focus to the previous / next month |
| `↑` / `↓` | Move focus up / down one row (4 months) |
| `Enter` / `Space` | Select the focused month |
| `Escape` | Cancel and return to the previous view |

## Accessibility

- Rendered as a `<table>` with `role="grid"` and `aria-label="Month picker, {year}"`.
- Uses roving tabindex — only one cell has `tabIndex={0}`.
- The currently viewed month has `aria-selected="true"`.
- Today's month has `aria-current="date"`.

## Visual states

| State | CSS class | Visual effect |
|-------|-----------|---------------|
| Currently viewed month | `.selected` | Primary background |
| Today's month | `.today` | Inset ring |
