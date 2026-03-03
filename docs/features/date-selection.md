# Date Selection

## Single date selection

Pass a `Date` as the `value` prop and handle changes with `onChange`:

```tsx
import { useState } from 'react';
import { CalendarWidget } from '@calendar-widget/core';
import '@calendar-widget/core/style.css';

function App() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <div>
      <CalendarWidget value={date} onChange={setDate} />
      <p>Selected: {date?.toLocaleDateString() ?? 'none'}</p>
    </div>
  );
}
```

The selected date cell is highlighted with a solid primary-color background.

## Multi-date selection

Pass an array of `Date` objects as `value`. Each matching date in the grid is highlighted:

```tsx
const [dates, setDates] = useState<Date[]>([]);

function handleChange(date: Date) {
  setDates((prev) => {
    const exists = prev.some(
      (d) => d.toDateString() === date.toDateString(),
    );
    return exists
      ? prev.filter((d) => d.toDateString() !== date.toDateString())
      : [...prev, date];
  });
}

<CalendarWidget value={dates} onChange={handleChange} />
```

> **Note:** The widget calls `onChange` with the clicked `Date` — it's up to you to manage the array (toggle, append, etc.).

## Null / no selection

Pass `null` or `undefined` as `value` to render the calendar with no date selected. The calendar defaults to showing the current month.
