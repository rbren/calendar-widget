# useCalendarState

A React hook that manages all calendar state: the viewed month, focused date, week grid, selection logic, range selection state, and drill-up navigation.

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
  goToToday: () => void;
  isCurrentMonth: boolean;
  selectDate: (date: Date) => void;
  focusDate: (date: Date) => void;
  hoverDate: (date: Date | null) => void;
  isSelected: (date: Date) => boolean;
  rangeStart: Date | null;
  hoveredDate: Date | null;
  activeView: CalendarView;
  yearRangeStart: number;
  drillUp: () => void;
  drillDown: () => void;
  selectMonth: (month: number) => void;
  selectYear: (year: number) => void;
  goToPrevYear: () => void;
  goToNextYear: () => void;
  goToPrevYearRange: () => void;
  goToNextYearRange: () => void;
  headingAriaLabel: string | undefined;
};
```

## Parameters

Accepts a `CalendarWidgetProps` object — the same props you pass to `<CalendarWidget>`. See [CalendarWidget](./CalendarWidget.md) for the full prop list.

## Return value

### Core state

| Property | Type | Description |
|----------|------|-------------|
| `viewDate` | `Date` | The 1st of the currently displayed month. |
| `focusedDate` | `Date` | The date that currently holds keyboard focus (roving tabindex). |
| `weeks` | `Date[][]` | 6×7 grid of `Date` objects for the calendar view. |
| `monthYearLabel` | `string` | Locale-formatted month and year (e.g. `"March 2026"`). |
| `isCurrentMonth` | `boolean` | `true` if `viewDate` is the current real-world month. |

### Navigation

| Property | Type | Description |
|----------|------|-------------|
| `goToPrevMonth` | `() => void` | Navigate to the previous month. Fires `onMonthChange`. |
| `goToNextMonth` | `() => void` | Navigate to the next month. Fires `onMonthChange`. |
| `goToToday` | `() => void` | Jump to the current month, set focus to today, and switch to days view. Fires `onMonthChange` if the month changed. |
| `goToPrevYear` | `() => void` | Navigate to the previous year (used by month picker). |
| `goToNextYear` | `() => void` | Navigate to the next year (used by month picker). |
| `goToPrevYearRange` | `() => void` | Navigate to the previous 12-year range (used by year picker). |
| `goToNextYearRange` | `() => void` | Navigate to the next 12-year range (used by year picker). |

### Selection

| Property | Type | Description |
|----------|------|-------------|
| `selectDate` | `(date: Date) => void` | Select a date. In single mode, calls `onChange` with the date. In range mode, the first call sets `rangeStart` and the second call completes the range and calls `onChange` with a `DateRange`. Respects `minDate`, `maxDate`, and `disabledDates`. |
| `focusDate` | `(date: Date) => void` | Move keyboard focus to a date. Automatically navigates to the correct month if the date is outside the current view. Fires `onDayFocus` and `onMonthChange` if the month changes. |
| `hoverDate` | `(date: Date \| null) => void` | Track the hovered date for range preview. Only has an effect in range mode after the first click. |
| `isSelected` | `(date: Date) => boolean` | Returns `true` if the given date matches the current `value`. |
| `rangeStart` | `Date \| null` | The pending start date during range selection (after the first click, before the second). `null` when no range is in progress. |
| `hoveredDate` | `Date \| null` | The currently hovered date, used to compute the range preview. |

### Quick navigation (drill-up)

| Property | Type | Description |
|----------|------|-------------|
| `activeView` | `CalendarView` | Current view: `'days'`, `'months'`, or `'years'`. |
| `yearRangeStart` | `number` | The first year in the current 12-year range shown by the year picker. |
| `drillUp` | `() => void` | Move from days → months or months → years. No-op if `quickNavigation` is `false` or already in years view. |
| `drillDown` | `() => void` | Move from years → months or months → days. |
| `selectMonth` | `(month: number) => void` | Select a month (0–11) in the month picker. Navigates to that month and switches to days view. Fires `onMonthChange`. |
| `selectYear` | `(year: number) => void` | Select a year in the year picker. Navigates to that year and switches to months view. |
| `headingAriaLabel` | `string \| undefined` | Accessible label for the heading button, describing the drill-up action. |

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
    weekStartsOn: 0,
  });

  return (
    <div>
      <button onClick={state.goToPrevMonth}>‹</button>
      <span>{state.monthYearLabel}</span>
      <button onClick={state.goToNextMonth}>›</button>
      <button onClick={state.goToToday}>Today</button>

      <CalendarGrid
        weeks={state.weeks}
        viewDate={state.viewDate}
        value={selectedDate}
        focusedDate={state.focusedDate}
        weekStartsOn={0}
        onSelectDate={state.selectDate}
        onFocusDate={state.focusDate}
      />
    </div>
  );
}
```
