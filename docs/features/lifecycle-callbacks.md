# Lifecycle Callbacks

The calendar provides two callback props for reacting to navigation and focus changes: `onMonthChange` and `onDayFocus`.

## onMonthChange

Called whenever the displayed month changes. Receives a `Date` representing the first day of the newly displayed month.

```tsx
<CalendarWidget
  value={date}
  onChange={setDate}
  onMonthChange={(month) => {
    console.log('Now viewing:', month.toLocaleDateString());
    // e.g. fetch events for the new month
  }}
/>
```

### When it fires

- Clicking the ‹ or › navigation buttons
- Keyboard navigation that crosses a month boundary (e.g. pressing → on the last day of the month)
- Selecting a month in the quick navigation month picker
- Clicking the "Today" button (if the current month differs from the displayed month)

### When it does NOT fire

- On initial render
- When the parent changes the `value` prop (external sync)

## onDayFocus

Called whenever keyboard focus moves to a new day cell. Receives the `Date` being focused.

```tsx
<CalendarWidget
  value={date}
  onChange={setDate}
  onDayFocus={(focusedDate) => {
    console.log('Focused on:', focusedDate.toLocaleDateString());
    // e.g. show a detail panel for the focused date
  }}
/>
```

### When it fires

- Arrow key navigation between days
- Home/End key navigation within a week
- PageUp/PageDown navigation between months

### Typical use cases

- **Lazy loading** — Fetch event data or details for the focused date.
- **Preview panels** — Update a sidebar or tooltip showing details for the focused date.
- **Analytics** — Track which dates users are browsing.

## Combining both callbacks

```tsx
<CalendarWidget
  value={date}
  onChange={setDate}
  onMonthChange={(month) => loadEventsForMonth(month)}
  onDayFocus={(date) => setPreviewDate(date)}
/>
```
