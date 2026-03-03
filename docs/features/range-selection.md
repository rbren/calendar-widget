# Range Selection

The calendar supports selecting a date range (start and end date) in addition to single date selection.

## Enabling range mode

Set `mode="range"` on the `CalendarWidget`:

```tsx
import { useState } from 'react';
import { CalendarWidget, DateRange } from '@calendar-widget/core';
import '@calendar-widget/core/style.css';

function App() {
  const [range, setRange] = useState<DateRange | null>(null);

  return (
    <div>
      <CalendarWidget mode="range" value={range} onChange={setRange} />
      {range && (
        <p>
          {range.start.toLocaleDateString()} – {range.end.toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
```

## How it works

1. **First click** — sets the range start date. The start date is highlighted with the primary color.
2. **Hover preview** — as you move the mouse over other dates, a translucent preview highlights the tentative range between the start and the hovered date.
3. **Second click** — completes the range. `onChange` is called with a `DateRange` object (`{ start, end }`). If the second click is before the first, the dates are automatically swapped so `start ≤ end`.

## Visual styling

Range selection uses dedicated CSS classes and custom properties:

| Element | CSS class | Custom property |
|---------|-----------|-----------------|
| Range start | `.rangeStart` | `--cw-color-selected` (primary background, left-rounded) |
| Range end | `.rangeEnd` | `--cw-color-selected` (primary background, right-rounded) |
| Days in range | `.inRange` | `--cw-color-range-bg` (default: `#dbeafe`) |
| Preview start | `.previewStart` | `--cw-color-range-preview-bg` |
| Preview end | `.previewEnd` | `--cw-color-range-preview-bg` |
| Days in preview | `.inPreview` | `--cw-color-range-preview-bg` (default: `rgba(219, 234, 254, 0.5)`) |

## Combining with constraints

Range mode works with `minDate`, `maxDate`, and `disabledDates`:

```tsx
<CalendarWidget
  mode="range"
  value={range}
  onChange={setRange}
  minDate={new Date(2026, 0, 1)}
  maxDate={new Date(2026, 11, 31)}
  disabledDates={[new Date(2026, 6, 4)]}
/>
```

Disabled dates cannot be selected as range start or end points.

## Accessibility

- The range start cell announces `"selected, start of range"` via `aria-label`.
- The range end cell announces `"selected, end of range"`.
- Days within the completed range announce `"in selected range"`.
- `aria-selected` is `true` for both the range start and end cells.
