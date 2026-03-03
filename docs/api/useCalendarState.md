# useCalendarState

A React hook that manages all calendar state: the viewed month, focused date, week grid, selection logic, and range selection state.

```tsx
import { useCalendarState } from '@calendar-widget/core';
```

## Signature

```ts
function useCalendarState(props: CalendarWidgetProps): {
  viewDate: Date;
  focusedDate: Date;
  weeks: Date[][];
  monthYearLabel: string;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  selectDate: (date: Date) => void;
  focusDate: (date: Date) => void;
  hoverDate: (date: Date | null) => void;
  isSelected: (date: Date) => boolean;
  rangeStart: Date | null;
  hoveredDate: Date | null;
};
```

## Parameters

Accepts a `CalendarWidgetProps` object — the same props you pass to `<CalendarWidget>`. See [CalendarWidget](./CalendarWidget.md) for the full prop list.

## Return value

| Property | Type | Description |
|----------|------|-------------|
| `viewDate` | `Date` | The 1st of the currently displayed month. |
| `focusedDate` | `Date` | The date that currently holds keyboard focus (roving tabindex). |
| `weeks` | `Date[][]` | 6×7 grid of `Date` objects for the calendar view. |
| `monthYearLabel` | `string` | Locale-formatted month and year (e.g. `"March 2026"`). |
| `goToPrevMonth` | `() => void` | Navigate to the previous month. |
| `goToNextMonth` | `() => void` | Navigate to the next month. |
| `selectDate` | `(date: Date) => void` | Select a date. In single mode, calls `onChange` with the date. In range mode, the first call sets `rangeStart` and the second call completes the range and calls `onChange` with a `DateRange`. Respects `minDate`, `maxDate`, and `disabledDates`. |
| `focusDate` | `(date: Date) => void` | Move keyboard focus to a date. Automatically navigates to the correct month if the date is outside the current view. |
| `hoverDate` | `(date: Date \| null) => void` | Track the hovered date for range preview. Only has an effect in range mode after the first click. |
| `isSelected` | `(date: Date) => boolean` | Returns `true` if the given date matches the current `value`. |
| `rangeStart` | `Date \| null` | The pending start date during range selection (after the first click, before the second). `null` when no range is in progress. |
| `hoveredDate` | `Date \| null` | The currently hovered date, used to compute the range preview. |

## External value sync

When the `value` prop changes externally (e.g. from a parent component), the hook automatically syncs `viewDate` and `focusedDate` to match the new value. This ensures the calendar always displays the relevant month.

## Usage

Use this hook when you need full control over the calendar layout while reusing the built-in state management:

```tsx
function CustomCalendar() {
  const state = useCalendarState({
    value: selectedDate,
    onChange: setSelectedDate,
    locale: 'en-US',
  });

  return (
    <div>
      <h2>{state.monthYearLabel}</h2>
      <button onClick={state.goToPrevMonth}>Prev</button>
      <button onClick={state.goToNextMonth}>Next</button>

      {state.weeks.map((week, i) => (
        <div key={i}>
          {week.map((day, j) => (
            <button
              key={j}
              onClick={() => state.selectDate(day)}
              aria-selected={state.isSelected(day)}
            >
              {day.getDate()}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Range mode

```tsx
function CustomRangeCalendar() {
  const [range, setRange] = useState<DateRange | null>(null);

  const state = useCalendarState({
    mode: 'range',
    value: range,
    onChange: setRange,
  });

  // state.rangeStart is non-null between the first and second clicks
  // state.hoveredDate tracks the cursor for preview highlighting

  return (
    <CalendarGrid
      weeks={state.weeks}
      viewDate={state.viewDate}
      value={range}
      mode="range"
      focusedDate={state.focusedDate}
      weekStartsOn={0}
      rangeStart={state.rangeStart}
      hoveredDate={state.hoveredDate}
      onSelectDate={state.selectDate}
      onFocusDate={state.focusDate}
      onHoverDate={state.hoverDate}
    />
  );
}
```
