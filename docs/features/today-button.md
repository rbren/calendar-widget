# Today Button

The calendar includes a "Today" button below the navigation bar that instantly navigates to the current month and focuses today's date.

## Default behavior

The today button is shown by default. When clicked it:

1. Navigates to the current month (fires `onMonthChange` if the month changed).
2. Moves keyboard focus to today's date.
3. Switches back to the days view if a month or year picker is open.

When the calendar is already showing the current month, the button is visually dimmed and non-interactive (`aria-disabled="true"`).

## Hiding the button

Set `showTodayButton={false}` to remove the button entirely:

```tsx
<CalendarWidget value={date} onChange={setDate} showTodayButton={false} />
```

## Custom label

Use `todayButtonLabel` to change the button text — useful for internationalization:

```tsx
<CalendarWidget
  value={date}
  onChange={setDate}
  locale="de-DE"
  todayButtonLabel="Heute"
/>
```

## Accessibility

- The button has `aria-label="Navigate to current month"`.
- When already on the current month, `aria-disabled="true"` is set instead of the `disabled` HTML attribute, so the button remains discoverable by screen readers.
