# useCalendarState

A React hook that manages all calendar state: the viewed month, focused date, week grid, and selection logic.

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
  isSelected: (date: Date) => boolean;
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
| `selectDate` | `(date: Date) => void` | Select a date. Respects `minDate`, `maxDate`, and `disabledDates` — calls `onChange` only if the date is valid. |
| `focusDate` | `(date: Date) => void` | Move keyboard focus to a date. Automatically navigates to the correct month if the date is outside the current view. |
| `isSelected` | `(date: Date) => boolean` | Returns `true` if the given date matches the current `value`. |

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
