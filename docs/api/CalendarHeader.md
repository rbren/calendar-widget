# CalendarHeader

Renders the month/year label and previous/next navigation buttons.

```tsx
import { CalendarHeader } from '@calendar-widget/core';
```

> **Note:** You only need to import this directly if you are building a custom calendar layout. For standard usage, `CalendarWidget` renders it automatically.

## Props — `CalendarHeaderProps`

| Prop | Type | Description |
|------|------|-------------|
| `viewDate` | `Date` | The date representing the currently displayed month (typically the 1st of that month). |
| `monthYearLabel` | `string` | Pre-formatted month/year string (e.g. `"March 2026"`). |
| `onPrevMonth` | `() => void` | Called when the user clicks the previous-month button. |
| `onNextMonth` | `() => void` | Called when the user clicks the next-month button. |

## Accessibility

- The previous-month button has `aria-label="Previous month"`.
- The next-month button has `aria-label="Next month"`.
- The month/year label uses `aria-live="polite"` so screen readers announce month changes.

## Usage

```tsx
<CalendarHeader
  viewDate={new Date(2026, 2, 1)}
  monthYearLabel="March 2026"
  onPrevMonth={() => console.log('prev')}
  onNextMonth={() => console.log('next')}
/>
```
