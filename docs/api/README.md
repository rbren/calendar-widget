# API Reference

## Components

- **[CalendarWidget](./CalendarWidget.md)** — Main calendar component (start here)
- **[CalendarGrid](./CalendarGrid.md)** — Date grid with weekday headers and day cells
- **[CalendarHeader](./CalendarHeader.md)** — Navigation bar with prev/next buttons, heading, and today button
- **[CalendarDayCell](./CalendarDayCell.md)** — Individual day cell
- **[MonthPicker](./MonthPicker.md)** — Month selection grid (drill-up view)
- **[YearPicker](./YearPicker.md)** — Year selection grid (drill-up view)

## Hooks

- **[useCalendarState](./useCalendarState.md)** — Calendar state management hook

## Types

- **[DateRange](./CalendarWidget.md#daterange)** — `{ start: Date; end: Date }`
- **[CalendarView](./CalendarWidget.md#calendarview)** — `'days' | 'months' | 'years'`
- **[DayRenderInfo](./CalendarWidget.md#dayrenderinfo)** — Context for `renderDay` callback
- **CalendarWidgetProps, CalendarHeaderProps, CalendarGridProps, CalendarDayCellProps, MonthPickerProps, YearPickerProps** — Prop interfaces for each component

## Utilities

- **[Utility Functions](./utilities.md)** — `getCalendarDays`, `isSameDay`, `isDateInRange`, `isDateDisabled`, `isDateRange`, `isDateBetween`, `getISOWeekNumber`, `formatMonthYear`, `formatDayLabel`
