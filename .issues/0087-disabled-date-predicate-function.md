---
tag: pm
state: open
---

# 0087 — Disabled Weekday Filter (`disabledDaysOfWeek` Prop)

## Problem

The current `disabledDates` prop accepts an array of specific `Date` objects, and issue 0032 proposes a predicate function for more dynamic disabling. However, one of the most common disabling patterns — disabling entire days of the week (e.g., "no weekends") — requires the consumer to either generate hundreds of Date objects or implement a predicate function.

A dedicated `disabledDaysOfWeek` prop would cover this extremely common use case with a simple, declarative API. Booking and scheduling systems almost always need to disable weekends or specific weekdays.

## Requirements

### `disabledDaysOfWeek` prop

```ts
interface CalendarWidgetProps {
  /** Days of the week to disable, where 0 = Sunday, 1 = Monday, ..., 6 = Saturday.
   *  All dates falling on these weekdays will be disabled (non-selectable).
   *  Combines with `disabledDates` and `minDate`/`maxDate` — a date is disabled
   *  if it matches ANY disable condition. */
  disabledDaysOfWeek?: number[];
}
```

### Examples

```tsx
// Disable weekends
<CalendarWidget disabledDaysOfWeek={[0, 6]} />

// Disable Wednesdays and Fridays
<CalendarWidget disabledDaysOfWeek={[3, 5]} />

// Combine with specific disabled dates
<CalendarWidget
  disabledDaysOfWeek={[0, 6]}
  disabledDates={[new Date(2026, 11, 25)]}
/>
```

### Behavior

- A day cell is disabled if its weekday (`date.getDay()`) is in the `disabledDaysOfWeek` array.
- This stacks with existing disable conditions (`disabledDates`, `minDate`/`maxDate`).
- Disabled-by-weekday cells look and behave identically to other disabled cells (same CSS class, `aria-disabled="true"`, non-clickable).
- Keyboard navigation still moves through disabled weekday cells (consistent with current behavior for disabled dates — focus can land on them but Enter/Space does nothing).
- Empty array `[]` disables nothing (same as omitting the prop).

## Implementation Notes

1. Add `disabledDaysOfWeek?: number[]` to `CalendarWidgetProps`.
2. Pass it through to `useCalendarState` and `CalendarGrid`.
3. Update the disabled check in `CalendarGrid` to include weekday matching:
   ```ts
   const isDayDisabled = (date: Date) =>
     !isDateInRange(date, minDate, maxDate) ||
     isDateDisabled(date, disabledDates) ||
     (disabledDaysOfWeek?.includes(date.getDay()) ?? false);
   ```
4. Update `selectDate` in `useCalendarState` to also check `disabledDaysOfWeek`.
5. Add a utility function `isWeekdayDisabled(date, disabledDaysOfWeek)` to `utils/dates.ts`.

## Verification

- Render with `disabledDaysOfWeek={[0, 6]}` → all Saturdays and Sundays are visually disabled.
- Click a disabled weekend day → `onChange` is not called.
- Arrow-key onto a disabled weekend → focus moves there but Enter/Space does nothing.
- Combine with `disabledDates` → both conditions apply.
- Render with `disabledDaysOfWeek={[]}` or no prop → no extra dates disabled.
- Navigate to any month → weekday disabling is consistent.
- Unit tests: weekday disabling applied, stacks with disabledDates, empty array does nothing, click on disabled weekday blocked.
