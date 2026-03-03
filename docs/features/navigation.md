# Navigation

## Month navigation

The calendar header displays the current month and year with previous/next buttons:

```
  ‹   March 2026   ›
```

- Click **‹** to go to the previous month.
- Click **›** to go to the next month.

## Initial view

The calendar opens to the month of the `value` prop. If no value is provided, it defaults to the current month.

## Keyboard month navigation

When focus is inside the calendar grid:

| Key | Action |
|-----|--------|
| `PageUp` | Move to the same day in the previous month |
| `PageDown` | Move to the same day in the next month |

The view automatically follows keyboard focus — if you arrow or page into a different month, the calendar navigates there.

## Programmatic navigation

If you use the `useCalendarState` hook directly, you can call `goToPrevMonth()` and `goToNextMonth()` from your own UI:

```tsx
const { goToPrevMonth, goToNextMonth, monthYearLabel } = useCalendarState({
  value: date,
  onChange: setDate,
});

<button onClick={goToPrevMonth}>Back</button>
<span>{monthYearLabel}</span>
<button onClick={goToNextMonth}>Forward</button>
```
