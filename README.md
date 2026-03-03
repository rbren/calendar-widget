# @calendar-widget/core

A lightweight, accessible React calendar widget with full keyboard navigation, localization support, and flexible theming via CSS custom properties.

## Features

- **Accessible** — Full keyboard navigation (arrow keys, Home/End, PageUp/PageDown) and ARIA attributes
- **Localizable** — Uses `Intl.DateTimeFormat` for month/day labels in any locale
- **Themeable** — Customize colors, sizing, and fonts with CSS custom properties
- **Flexible** — Supports single and multi-date selection, min/max ranges, and disabled dates
- **Lightweight** — Zero runtime dependencies beyond React

## Installation

```bash
npm install @calendar-widget/core
```

**Peer dependencies:** React 19+ and ReactDOM 19+.

## Quick Start

```tsx
import { CalendarWidget } from '@calendar-widget/core';
import '@calendar-widget/core/style.css';

function App() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <CalendarWidget
      value={date}
      onChange={setDate}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| Date[] \| null` | — | Currently selected date(s) |
| `onChange` | `(date: Date) => void` | — | Called when a date is selected |
| `locale` | `string` | Browser default | Locale for `Intl` formatting (e.g. `"fr-FR"`) |
| `minDate` | `Date` | — | Earliest selectable date |
| `maxDate` | `Date` | — | Latest selectable date |
| `disabledDates` | `Date[]` | `[]` | Specific dates to disable |
| `weekStartsOn` | `0–6` | `0` (Sunday) | First day of the week |
| `className` | `string` | — | Additional CSS class on the root element |

## Theming

Override CSS custom properties on the widget root to change the look:

```css
.my-calendar {
  --cw-color-primary: #8b5cf6;
  --cw-color-bg: #fafafa;
  --cw-cell-size: 40px;
  --cw-border-radius: 50%;
}
```

```tsx
<CalendarWidget className="my-calendar" value={date} onChange={setDate} />
```

See [docs/features/styling.md](docs/features/styling.md) for the full list of CSS custom properties.

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `←` `→` | Previous / next day |
| `↑` `↓` | Previous / next week |
| `Home` / `End` | First / last day of current week |
| `PageUp` / `PageDown` | Same day in previous / next month |
| `Enter` / `Space` | Select the focused date |

## Documentation

- [API Reference](docs/api/)
- [Feature Guides](docs/features/)
- [Release Notes](docs/releases/)
- [Demos](docs/demos/)

## License

MIT
