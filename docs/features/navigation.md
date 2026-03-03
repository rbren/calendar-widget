# Navigation

## Month navigation

The calendar header displays the current month and year with previous/next buttons:

```
  ‹   March 2026   ›
         Today
```

- Click **‹** to go to the previous month.
- Click **›** to go to the next month.
- Click **Today** to jump to the current month (see [Today Button](./today-button.md)).
- Click the **month/year heading** to open the month picker (see [Quick Navigation](./quick-navigation.md)).

## Initial view

The calendar opens to the month of the `value` prop. If no value is provided, it defaults to the current month.

## Keyboard month navigation

When focus is inside the calendar grid:

| Key | Action |
|-----|--------|
| `PageUp` | Move to the same day in the previous month |
| `PageDown` | Move to the same day in the next month |

The view automatically follows keyboard focus — if you arrow or page into a different month, the calendar navigates there.

## Quick navigation

Click the month/year heading to drill up into a month picker, then a year picker. See [Quick Navigation](./quick-navigation.md) for details.

## Programmatic navigation

If you use the `useCalendarState` hook directly, you can call navigation functions from your own UI:

```tsx
const {
  goToPrevMonth,
  goToNextMonth,
  goToToday,
  monthYearLabel,
} = useCalendarState({
  value: date,
  onChange: setDate,
});

<button onClick={goToPrevMonth}>Back</button>
<span>{monthYearLabel}</span>
<button onClick={goToNextMonth}>Forward</button>
<button onClick={goToToday}>Today</button>
```
