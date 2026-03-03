# Quick Navigation (Month & Year Picker)

The calendar supports a drill-up navigation flow that lets users quickly jump to any month and year without clicking through one month at a time.

## How it works

1. **Days view** (default) — Click the month/year heading (e.g. "March 2026") to open the month picker.
2. **Months view** — A 4×3 grid of abbreviated month names. Click a month to jump there, or click the year heading to open the year picker.
3. **Years view** — A 4×3 grid showing a 12-year range. Click a year to select it and return to the months view. Use the ‹/› buttons to page through year ranges.

After selecting a month (or year → month), the calendar returns to the days view showing the chosen month.

## Enabling / disabling

Quick navigation is enabled by default. To disable it, set `quickNavigation={false}`:

```tsx
<CalendarWidget
  value={date}
  onChange={setDate}
  quickNavigation={false}
/>
```

When disabled, the month/year heading is rendered as plain text instead of a clickable button.

## Keyboard navigation

### Month picker

| Key | Action |
|-----|--------|
| `←` / `→` | Previous / next month |
| `↑` / `↓` | Move up / down one row (4 months) |
| `Enter` / `Space` | Select the focused month |
| `Escape` | Return to the days view |

### Year picker

| Key | Action |
|-----|--------|
| `←` / `→` | Previous / next year |
| `↑` / `↓` | Move up / down one row (4 years) |
| `Enter` / `Space` | Select the focused year |
| `Escape` | Return to the months view |

## Accessibility

- The month/year heading button has a descriptive `aria-label`, e.g. `"Choose month and year, currently March 2026"` (in days view) or `"Choose year, currently 2026"` (in months view).
- The prev/next navigation button labels adapt to the current view: "Previous month" / "Next month", "Previous year" / "Next year", or "Previous year range" / "Next year range".
- Both picker grids use `role="grid"` with roving tabindex for keyboard navigation.
- The currently viewed month/year is marked with `aria-selected="true"`.
- Today's month/year is marked with `aria-current="date"`.
