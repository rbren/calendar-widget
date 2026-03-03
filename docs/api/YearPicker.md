# YearPicker

Renders a 4×3 grid of 12 consecutive years. Used by `CalendarWidget` as the top-level drill-up view when the user clicks the year heading in the month picker.

```tsx
import { YearPicker } from '@calendar-widget/core';
```

> **Note:** You only need to import this directly if you are building a custom calendar layout. For standard usage, `CalendarWidget` renders it automatically when the view is `'years'`.

## Props — `YearPickerProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rangeStart` | `number` | — | The start year of the 12-year range to display. |
| `currentYear` | `number` | — | Currently viewed year for highlighting. |
| `onSelectYear` | `(year: number) => void` | — | Called when a year cell is clicked or activated via `Enter`/`Space`. |
| `onCancel` | `() => void` | — | Called when `Escape` is pressed, returning to the previous view. |

## Keyboard navigation

| Key | Action |
|-----|--------|
| `←` / `→` | Move focus to the previous / next year |
| `↑` / `↓` | Move focus up / down one row (4 years) |
| `Enter` / `Space` | Select the focused year |
| `Escape` | Cancel and return to the months view |

## Accessibility

- Rendered as a `<table>` with `role="grid"` and `aria-label="Year picker, {startYear}–{endYear}"`.
- Uses roving tabindex — only one cell has `tabIndex={0}`.
- The currently viewed year has `aria-selected="true"`.
- The current real-world year has `aria-current="date"`.

## Visual states

| State | CSS class | Visual effect |
|-------|-----------|---------------|
| Currently viewed year | `.selected` | Primary background |
| Current real-world year | `.today` | Inset ring |
