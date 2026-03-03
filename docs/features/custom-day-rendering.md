# Custom Day Rendering

The `renderDay` prop lets you replace or augment the content rendered inside each day cell. This is useful for adding event indicators, badges, tooltips, or any custom markup.

## Basic usage

`renderDay` receives two arguments:

1. **`dayNumber`** (`ReactNode`) — the default content (a `<span>` containing the day number).
2. **`info`** (`DayRenderInfo`) — context about the date:

```ts
interface DayRenderInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isInRange?: boolean;
}
```

Return a `ReactNode` to replace the default content.

## Examples

### Adding event dots

```tsx
const events = new Set(['2026-03-10', '2026-03-15', '2026-03-22']);

<CalendarWidget
  value={date}
  onChange={setDate}
  renderDay={(dayNumber, info) => {
    const key = info.date.toISOString().slice(0, 10);
    return (
      <div style={{ position: 'relative' }}>
        {dayNumber}
        {events.has(key) && (
          <span style={{
            position: 'absolute',
            bottom: 2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'red',
          }} />
        )}
      </div>
    );
  }}
/>
```

### Highlighting weekends

```tsx
<CalendarWidget
  value={date}
  onChange={setDate}
  renderDay={(dayNumber, info) => {
    const day = info.date.getDay();
    const isWeekend = day === 0 || day === 6;
    return (
      <span style={{ color: isWeekend && info.isCurrentMonth ? '#ef4444' : undefined }}>
        {dayNumber}
      </span>
    );
  }}
/>
```

### Emoji markers

```tsx
const holidays: Record<string, string> = {
  '2026-07-04': '🎆',
  '2026-12-25': '🎄',
  '2026-01-01': '🎉',
};

<CalendarWidget
  value={date}
  onChange={setDate}
  renderDay={(dayNumber, info) => {
    const key = info.date.toISOString().slice(0, 10);
    const emoji = holidays[key];
    return emoji ? <span>{dayNumber} {emoji}</span> : dayNumber;
  }}
/>
```

## Notes

- The `renderDay` function is called for every visible day cell, including days from adjacent months.
- The returned node replaces only the _content_ of the cell — the cell's `<td>` wrapper, CSS classes, ARIA attributes, and click/keyboard handlers are unchanged.
- For accessibility, the cell's `aria-label` is always set automatically regardless of `renderDay` output.
