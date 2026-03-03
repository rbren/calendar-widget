# @calendar-widget/core

[![CI](https://github.com/rbren/calendar-widget/actions/workflows/ci.yml/badge.svg)](https://github.com/rbren/calendar-widget/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@calendar-widget/core)](https://www.npmjs.com/package/@calendar-widget/core)
[![license](https://img.shields.io/npm/l/@calendar-widget/core)](./LICENSE)

A lightweight, accessible React calendar widget with single date and date range selection, full keyboard navigation, localization support, and flexible theming via CSS custom properties.

## Features

- **Date selection** — Single date or date range selection with optional min/max constraints and disabled dates
- **Range mode** — Two-click range picking with live hover preview
- **Accessible** — Full keyboard navigation (WAI-ARIA grid pattern), descriptive `aria-label` on every cell, and ARIA attributes throughout
- **Localizable** — Uses `Intl.DateTimeFormat` for locale-aware month, day, and accessible label formatting
- **Configurable** — Set the first day of the week to any day (Sunday–Saturday)
- **Themeable** — Customize colors, sizing, and fonts with CSS custom properties
- **Lightweight** — Zero runtime dependencies (React is a peer dependency)

## Installation

```bash
npm install @calendar-widget/core
```

**Peer dependencies:** React 18+ and ReactDOM 18+ (`^18.0.0 || ^19.0.0`).

## Quick Start

```tsx
import { useState } from 'react';
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

### Range Selection

```tsx
import { useState } from 'react';
import { CalendarWidget, DateRange } from '@calendar-widget/core';
import '@calendar-widget/core/style.css';

function App() {
  const [range, setRange] = useState<DateRange | null>(null);

  return (
    <CalendarWidget
      mode="range"
      value={range}
      onChange={setRange}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'single' \| 'range'` | `'single'` | Selection mode |
| `value` | `Date \| DateRange \| Date[] \| null` | — | Currently selected date(s) or range |
| `onChange` | `(value: Date \| DateRange \| null) => void` | — | Called when the user selects a date or completes a range |
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

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--cw-font-family` | `system-ui, sans-serif` | Font family |
| `--cw-font-size` | `14px` | Base font size |
| `--cw-color-primary` | `#2563eb` | Primary accent color |
| `--cw-color-bg` | `#ffffff` | Background color |
| `--cw-color-text` | `#1f2937` | Default text color |
| `--cw-color-text-muted` | `#9ca3af` | Muted text (outside days, weekday headers) |
| `--cw-color-hover` | `#eff6ff` | Day cell hover background |
| `--cw-color-selected` | `var(--cw-color-primary)` | Selected day background |
| `--cw-color-selected-text` | `#ffffff` | Selected day text color |
| `--cw-color-today-ring` | `var(--cw-color-primary)` | Ring color for today's date |
| `--cw-color-disabled` | `#e5e7eb` | Disabled day text color |
| `--cw-color-range-bg` | `#dbeafe` | Background for days within a selected range |
| `--cw-color-range-preview-bg` | `rgba(219, 234, 254, 0.5)` | Background for the hover preview range |
| `--cw-border-radius` | `6px` | Day cell border radius |
| `--cw-cell-size` | `36px` | Day cell width and height |

See [docs/features/styling.md](docs/features/styling.md) for more details.

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `←` `→` | Previous / next day |
| `↑` `↓` | Previous / next week |
| `Home` / `End` | First / last day of current week |
| `PageUp` / `PageDown` | Same day in previous / next month |
| `Enter` / `Space` | Select the focused date |

## Accessibility

This widget targets WCAG 2.1 Level AA compliance. The calendar grid uses the WAI-ARIA grid pattern with `role="grid"`, descriptive `aria-label` attributes on every day cell (e.g. "Saturday, March 15, 2026 (today, selected)"), and a roving tabindex for keyboard navigation. See the [Keyboard Navigation](#keyboard-navigation) table above for supported shortcuts.

## Development

```bash
# Clone the repository
git clone https://github.com/rbren/calendar-widget.git
cd calendar-widget

# Install dependencies
npm install

# Start the dev server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint and format
npm run lint
npm run format

# Type-check
npm run typecheck

# Build for production
npm run build
```

## Documentation

- [API Reference](docs/api/)
- [Feature Guides](docs/features/)
- [Release Notes](docs/releases/)
- [Demos](docs/demos/)

## License

[MIT](./LICENSE)
