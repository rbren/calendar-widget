---
tag: pm
state: open
---

# 0023 — Imperative API via Ref

## Problem

Some integrations need to programmatically control the calendar from outside React's declarative prop flow — e.g., a "Jump to date" button in a toolbar, an external date input field that should navigate the calendar when the user types a date, or automated testing that needs to drive the widget. Without a ref-based imperative API, consumers must lift all state into props, which adds boilerplate for simple use cases.

## Requirements

### `CalendarWidgetRef` interface

Expose an imperative handle via `React.forwardRef` + `useImperativeHandle`:

```ts
interface CalendarWidgetRef {
  /** Navigate the view to the month containing the given date. */
  goToDate(date: Date): void;
  /** Navigate to the previous month. */
  goToPrevMonth(): void;
  /** Navigate to the next month. */
  goToNextMonth(): void;
  /** Navigate to today's month. */
  goToToday(): void;
  /** Get the currently displayed month as a Date (first of month). */
  getViewDate(): Date;
  /** Get the currently selected value. */
  getSelectedValue(): Date | DateRange | Date[] | null;
  /** Focus the calendar grid (useful for keyboard navigation after external interaction). */
  focus(): void;
}
```

Export `CalendarWidgetRef` from the public API.

### Usage

```tsx
const calendarRef = useRef<CalendarWidgetRef>(null);

<CalendarWidget ref={calendarRef} />
<button onClick={() => calendarRef.current?.goToDate(new Date(2025, 0, 1))}>
  Go to Jan 2025
</button>
```

### Interaction with controlled mode

- In uncontrolled mode, `goToDate` / `goToPrevMonth` / `goToNextMonth` / `goToToday` directly update the internal state.
- In controlled mode (`month` prop provided), these methods call `onMonthChange` but do not change the view unless the parent updates `month`. Document this behavior clearly.
- `getViewDate()` and `getSelectedValue()` always return the current state regardless of mode.

### Implementation notes

- Wrap `CalendarWidget` with `React.forwardRef`.
- Use `useImperativeHandle` to expose the methods.
- `focus()` should place focus on the currently active day cell (the one with `tabIndex={0}`).

## Verification

- Create a ref → call `goToDate(new Date(2020, 5, 15))` → calendar shows June 2020.
- Call `goToToday()` → calendar shows the current month.
- Call `getViewDate()` → returns first-of-month Date matching the displayed month.
- Call `focus()` → the active day cell receives keyboard focus.
- In controlled mode, `goToDate` fires `onMonthChange` but does not change view until parent updates `month`.
- TypeScript: `useRef<CalendarWidgetRef>(null)` provides correct autocompletion for all methods.
- Unit tests cover: each imperative method, controlled vs uncontrolled behavior, focus management, TypeScript type correctness.
