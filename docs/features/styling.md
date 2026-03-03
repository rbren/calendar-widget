# Styling & Theming

## Importing the stylesheet

The widget ships a default stylesheet that you must import:

```tsx
import '@calendar-widget/core/style.css';
```

## CSS custom properties

All visual aspects are controlled through CSS custom properties defined on the widget root. Override them to theme the calendar:

| Property | Default | Description |
|----------|---------|-------------|
| `--cw-font-family` | `system-ui, sans-serif` | Font family |
| `--cw-font-size` | `14px` | Base font size |
| `--cw-color-primary` | `#2563eb` | Primary accent (selection, focus ring, today ring) |
| `--cw-color-bg` | `#ffffff` | Background color |
| `--cw-color-text` | `#1f2937` | Default text color |
| `--cw-color-text-muted` | `#9ca3af` | Muted text (weekday headers, outside-month days) |
| `--cw-color-hover` | `#eff6ff` | Hover background on day cells |
| `--cw-color-selected` | `var(--cw-color-primary)` | Selected day background |
| `--cw-color-selected-text` | `#ffffff` | Selected day text color |
| `--cw-color-today-ring` | `var(--cw-color-primary)` | Inset ring on today's cell |
| `--cw-color-disabled` | `#e5e7eb` | Disabled day text color |
| `--cw-color-range-bg` | `#dbeafe` | Background for days within a selected range |
| `--cw-color-range-preview-bg` | `rgba(219, 234, 254, 0.5)` | Background for the hover preview range |
| `--cw-border-radius` | `6px` | Border radius for cells and buttons |
| `--cw-cell-size` | `36px` | Width and height of each day cell |

## Theming examples

### Dark theme

```css
.dark-calendar {
  --cw-color-bg: #1e1e2e;
  --cw-color-text: #cdd6f4;
  --cw-color-text-muted: #6c7086;
  --cw-color-primary: #89b4fa;
  --cw-color-hover: #313244;
  --cw-color-selected-text: #1e1e2e;
  --cw-color-disabled: #45475a;
}
```

```tsx
<CalendarWidget className="dark-calendar" value={date} onChange={setDate} />
```

### Rounded cells

```css
.round-calendar {
  --cw-border-radius: 50%;
  --cw-cell-size: 40px;
}
```

### Compact size

```css
.compact-calendar {
  --cw-font-size: 12px;
  --cw-cell-size: 28px;
}
```

## Adding custom classes

Use the `className` prop to scope your overrides:

```tsx
<CalendarWidget className="my-theme" value={date} onChange={setDate} />
```

The class is applied to the outermost `<div>`, so your custom properties cascade to all child elements.
