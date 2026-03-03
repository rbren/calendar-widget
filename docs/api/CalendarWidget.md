# CalendarWidget

The main calendar component. Renders a month view with navigation, weekday headers, and a date grid. Supports single date selection and date range selection.

```tsx
import { CalendarWidget } from '@calendar-widget/core';
```

## DateRange

The `DateRange` type represents a start/end date pair, used with `mode="range"`:

```ts
import type { DateRange } from '@calendar-widget/core';

interface DateRange {
  start: Date;
  end: Date;
}
```

## Props — `CalendarWidgetProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'single' \| 'range'` | `'single'` | Selection mode. In `'single'` mode, clicking a date selects it. In `'range'` mode, the first click sets the range start and the second click completes the range. |
| `value` | `Date \| DateRange \| Date[] \| null` | `undefined` | Currently selected date(s). Pass a `Date` for single selection, a `DateRange` for range selection, or an array for multi-date highlighting. |
| `onChange` | `(value: Date \| DateRange \| null) => void` | `undefined` | Callback fired when the user selects a date (single mode) or completes a range (range mode). Not called if the date is disabled or out of range. |
| `locale` | `string` | Browser default | A BCP 47 locale string (e.g. `"en-US"`, `"ja-JP"`) used for month/year labels, weekday headers, and accessible day labels via `Intl.DateTimeFormat`. |
| `minDate` | `Date` | `undefined` | Earliest selectable date (inclusive). Dates before this are rendered as disabled. |
| `maxDate` | `Date` | `undefined` | Latest selectable date (inclusive). Dates after this are rendered as disabled. |
| `disabledDates` | `Date[]` | `[]` | Array of specific dates to disable. Compared by calendar day (time is ignored). |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6` | `0` | Day the week starts on. `0` = Sunday, `1` = Monday, etc. |
| `className` | `string` | `undefined` | Additional CSS class name applied to the root `<div>`. Useful for scoping CSS custom property overrides. |

## Usage

### Basic single date

```tsx
const [date, setDate] = useState<Date | null>(null);

<CalendarWidget value={date} onChange={setDate} />
```

### Date range

```tsx
import { CalendarWidget, DateRange } from '@calendar-widget/core';

const [range, setRange] = useState<DateRange | null>(null);

<CalendarWidget mode="range" value={range} onChange={setRange} />
```

In range mode, the first click sets the start date and a hover preview highlights the tentative range. The second click completes the range and fires `onChange` with a `DateRange` object. If the second click is before the first, the dates are automatically swapped so `start ≤ end`.

### With constraints

```tsx
<CalendarWidget
  value={date}
  onChange={setDate}
  minDate={new Date(2026, 0, 1)}
  maxDate={new Date(2026, 11, 31)}
  disabledDates={[new Date(2026, 6, 4)]}
/>
```

### Localized, week starts on Monday

```tsx
<CalendarWidget
  value={date}
  onChange={setDate}
  locale="de-DE"
  weekStartsOn={1}
/>
```

## Internal structure

`CalendarWidget` composes three sub-components:

1. **[CalendarHeader](./CalendarHeader.md)** — month/year label and prev/next buttons
2. **[CalendarGrid](./CalendarGrid.md)** — weekday headers and the 6×7 date grid
3. **[CalendarDayCell](./CalendarDayCell.md)** — individual day cell

State is managed by the **[useCalendarState](./useCalendarState.md)** hook.
