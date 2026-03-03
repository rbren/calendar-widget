---
tag: architecture
state: review
---

# 0068 — Extract CalendarGrid Helper Functions to `utils/dates.ts`

## Problem

`CalendarGrid.tsx` (277 lines) contains five private helper functions that perform pure date and formatting operations:

| Function | Lines | Purpose |
|---|---|---|
| `getWeekdayHeaders(weekStartsOn, locale?)` | 16–29 | Returns localized short weekday names |
| `addDays(date, days)` | 32–36 | Adds N days to a Date |
| `sameMonth(date, month, year)` | 48–50 | Checks if a date is in a given month/year |
| `getFirstDayOfWeek(date, weekStartsOn)` | 38–42 | Finds the first day of the week |
| `getLastDayOfWeek(date, weekStartsOn)` | 44–46 | Finds the last day of the week |

These are general-purpose date utilities that:

1. **Are not tested directly.** They only get exercised indirectly via CalendarGrid integration tests (keyboard navigation, rendering). If a subtle bug exists in `addDays` or `getFirstDayOfWeek`, it's hard to isolate from component behavior.

2. **Cannot be reused.** Other components or future features (e.g., week selection mode, fixed-weeks toggle) may need `addDays`, `getFirstDayOfWeek`, or `getWeekdayHeaders`. Currently they would have to duplicate the logic.

3. **Bloat the component file.** 50+ lines of pure logic in a React component file obscures the rendering code.

Meanwhile, `utils/dates.ts` (136 lines) is the project's designated location for date utilities and already contains `getCalendarDays`, `isSameDay`, `isDateBetween`, `getISOWeekNumber`, etc.

Additionally, `CalendarGrid` defines an inline `isSelected` function and an inline `getRangeFlags` function. These are rendering-specific and fine to keep in the component, but the pure date helpers should be extracted.

## Fix

1. Move `addDays`, `getFirstDayOfWeek`, `getLastDayOfWeek`, `sameMonth`, and `getWeekdayHeaders` from `CalendarGrid.tsx` to `utils/dates.ts`.

2. Export them from `utils/dates.ts` (they can be internal — not necessarily exported from the barrel `index.ts`).

3. Add direct unit tests for each function in `utils/dates.test.ts`:
   - `addDays`: positive, negative, across month boundary, across year boundary.
   - `getFirstDayOfWeek` / `getLastDayOfWeek`: various weekStartsOn values.
   - `sameMonth`: same month returns true, different month returns false, edge cases (Dec/Jan boundary).
   - `getWeekdayHeaders`: default locale, explicit locale, all weekStartsOn values.

4. Update `CalendarGrid.tsx` to import them from `../utils/dates`.

5. Do **not** add these functions to the barrel export (`src/index.ts`) — they are internal implementation details per issue 0060's guidance.

## Verification

1. `npm test` passes — all existing CalendarGrid tests still work.
2. New unit tests in `dates.test.ts` cover the extracted functions.
3. `CalendarGrid.tsx` no longer defines any top-level functions outside the component (except the component itself).
4. `npm run build` succeeds with no type errors.
5. `npm run lint` passes.
