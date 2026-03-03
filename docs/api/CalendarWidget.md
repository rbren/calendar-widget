# CalendarWidget

The main calendar component. Renders a month view with navigation, weekday headers, and a date grid.

```tsx
import { CalendarWidget } from '@calendar-widget/core';
```

## Props — `CalendarWidgetProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| Date[] \| null` | `undefined` | Currently selected date(s). Pass a single `Date` for single selection, or an array for multi-date selection. |
| `onChange` | `(date: Date) => void` | `undefined` | Callback fired when the user selects a date. Not called if the date is disabled or out of range. |
| `locale` | `string` | Browser default | A BCP 47 locale string (e.g. `"en-US"`, `"ja-JP"`) used for month/year labels and weekday headers via `Intl.DateTimeFormat`. |
| `minDate` | `Date` | `undefined` | Earliest selectable date (inclusive). Dates before this are rendered as disabled. |
| `maxDate` | `Date` | `undefined` | Latest selectable date (inclusive). Dates after this are rendered as disabled. |
| `disabledDates` | `Date[]` | `[]` | Array of specific dates to disable. Compared by calendar day (time is ignored). |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6` | `0` | Day the week starts on. `0` = Sunday, `1` = Monday, etc. |
| `className` | `string` | `undefined` | Additional CSS class name applied to the root `<div>`. Useful for scoping CSS custom property overrides. |

## Usage

### Basic

```tsx
const [date, setDate] = useState<Date | null>(null);

<CalendarWidget value={date} onChange={setDate} />
```

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
2. **CalendarGrid** — weekday headers and the 6×7 date grid (internal, not exported separately)
3. **[CalendarDayCell](./CalendarDayCell.md)** — individual day cell

State is managed by the **[useCalendarState](./useCalendarState.md)** hook.
