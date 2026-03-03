---
tag: architecture
state: review
---

# 0005 — Core Component Architecture

## Problem

The calendar widget needs a well-defined component hierarchy and public API before feature work begins. Without an agreed architecture, components will grow monolithic and tightly coupled.

## Requirements

### Component tree

```
<CalendarWidget>            # top-level public component; manages state
  <CalendarHeader>          # month/year display + prev/next navigation
  <CalendarGrid>            # 7-column day grid
    <CalendarDayCell>       # individual day; handles selection, today, disabled
  </CalendarGrid>
</CalendarWidget>
```

### Public API (props for `<CalendarWidget>`)

Define in `src/types/calendar.ts`:

```ts
export interface CalendarWidgetProps {
  /** Currently selected date(s) */
  value?: Date | Date[] | null;
  /** Called when the user selects a date */
  onChange?: (date: Date) => void;
  /** Locale string for Intl formatting (default: browser default) */
  locale?: string;
  /** Earliest selectable date */
  minDate?: Date;
  /** Latest selectable date */
  maxDate?: Date;
  /** Dates that should be disabled */
  disabledDates?: Date[];
  /** Day the week starts on: 0 = Sunday, 1 = Monday (default: 0) */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Additional CSS class for the root element */
  className?: string;
}
```

### Utility module — `src/utils/dates.ts`

Pure functions, no React dependency. Must be independently testable:

- `getCalendarDays(year, month, weekStartsOn)` → returns a 2D array of `Date` objects (6 rows × 7 cols, including leading/trailing days from adjacent months)
- `isSameDay(a, b)` → boolean
- `isDateInRange(date, min?, max?)` → boolean
- `isDateDisabled(date, disabledDates)` → boolean
- `formatMonthYear(date, locale)` → string via `Intl.DateTimeFormat`

### State management

Use a single `useCalendarState` custom hook (`src/hooks/useCalendarState.ts`) that owns:

- `viewDate` (the month currently displayed)
- navigation handlers (`goToPrevMonth`, `goToNextMonth`)
- selection logic (respects `minDate`, `maxDate`, `disabledDates`)

The hook returns everything the sub-components need; no prop drilling beyond one level.

### File layout after implementation

```
src/
  index.ts                        # re-exports CalendarWidget + types
  components/
    CalendarWidget.tsx
    CalendarWidget.test.tsx
    CalendarHeader.tsx
    CalendarHeader.test.tsx
    CalendarGrid.tsx
    CalendarGrid.test.tsx
    CalendarDayCell.tsx
    CalendarDayCell.test.tsx
  hooks/
    useCalendarState.ts
    useCalendarState.test.ts
  utils/
    dates.ts
    dates.test.ts
  types/
    calendar.ts
```

## Verification

- `npx tsc --noEmit` exits 0 — all types are sound
- `npm test` passes with tests for every component and utility
- `src/index.ts` exports `CalendarWidget` and all public types
- Importing `CalendarWidget` in a consumer project provides full TypeScript autocompletion for props
