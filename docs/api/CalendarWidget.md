# CalendarWidget

The main calendar component. Renders a month view with navigation, weekday headers, and a date grid. Supports single date and date range selection, quick month/year drill-up navigation, a "Today" button, ISO week numbers, custom day rendering, and lifecycle callbacks.

```tsx
import { CalendarWidget } from '@calendar-widget/core';
```

## Types

### DateRange

The `DateRange` type represents a start/end date pair, used with `mode="range"`:

```ts
import type { DateRange } from '@calendar-widget/core';

interface DateRange {
  start: Date;
  end: Date;
}
```

### CalendarView

Represents the current drill-up view:

```ts
type CalendarView = 'days' | 'months' | 'years';
```

### DayRenderInfo

Context object passed to the `renderDay` callback:

```ts
interface DayRenderInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isInRange?: boolean;
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
| `showWeekNumbers` | `boolean` | `false` | When `true`, an extra column displays the ISO 8601 week number for each row. |
| `quickNavigation` | `boolean` | `true` | When `true`, the month/year heading is clickable and drills up into a month picker, then a year picker. Set to `false` to disable this behavior. |
| `showTodayButton` | `boolean` | `true` | When `true`, a "Today" button appears below the navigation bar for quick return to the current month. |
| `todayButtonLabel` | `string` | `"Today"` | Custom label text for the today button. Useful for internationalization. |
| `renderDay` | `(dayNumber: ReactNode, info: DayRenderInfo) => ReactNode` | `undefined` | Custom render function for day cell content. Receives the default day number element and a `DayRenderInfo` context object. Return a `ReactNode` to replace the default content. |
| `onMonthChange` | `(month: Date) => void` | `undefined` | Called when the displayed month changes via prev/next buttons, quick navigation, the today button, or keyboard navigation that crosses a month boundary. Receives a `Date` representing the 1st of the new month. Does **not** fire on initial mount or when the parent updates the `value` prop. |
| `onDayFocus` | `(date: Date) => void` | `undefined` | Called when keyboard focus moves to a new day cell. Useful for showing previews or loading details for the focused date. |
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

### Week numbers

```tsx
<CalendarWidget value={date} onChange={setDate} showWeekNumbers />
```

### Custom day rendering

```tsx
const holidays = new Set(['2026-07-04', '2026-12-25']);

<CalendarWidget
  value={date}
  onChange={setDate}
  renderDay={(dayNumber, info) => {
    const key = info.date.toISOString().slice(0, 10);
    return (
      <span>
        {dayNumber}
        {holidays.has(key) && <span style={{ color: 'red' }}> 🎉</span>}
      </span>
    );
  }}
/>
```

### Lifecycle callbacks

```tsx
<CalendarWidget
  value={date}
  onChange={setDate}
  onMonthChange={(month) => console.log('Now viewing:', month)}
  onDayFocus={(date) => console.log('Focused on:', date)}
/>
```

### Disabling quick navigation and the today button

```tsx
<CalendarWidget
  value={date}
  onChange={setDate}
  quickNavigation={false}
  showTodayButton={false}
/>
```

## Internal structure

`CalendarWidget` composes several sub-components depending on the active view:

1. **[CalendarHeader](./CalendarHeader.md)** — month/year label, prev/next buttons, and today button
2. **[CalendarGrid](./CalendarGrid.md)** — weekday headers and the 6×7 date grid (shown in `days` view)
3. **[CalendarDayCell](./CalendarDayCell.md)** — individual day cell
4. **[MonthPicker](./MonthPicker.md)** — 4×3 month selection grid (shown in `months` view)
5. **[YearPicker](./YearPicker.md)** — 4×3 year selection grid (shown in `years` view)

State is managed by the **[useCalendarState](./useCalendarState.md)** hook.
