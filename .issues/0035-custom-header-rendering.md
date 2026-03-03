---
tag: pm
state: open
---

# 0035 — Custom Header Rendering

## Problem

The `renderDay` prop (issue 0016) allows customizing day cell content, but there's no equivalent for the calendar header. Consumers frequently need to customize the navigation area — adding extra buttons, changing the layout, integrating breadcrumbs, embedding the calendar in a toolbar, or matching a specific design system's navigation pattern. Without a header customization API, consumers must either accept the default header or wrap the entire widget and re-implement navigation logic externally.

## Requirements

### `renderHeader` prop

```ts
interface HeaderRenderInfo {
  /** The currently displayed month/year as a Date (first of month). */
  viewDate: Date;
  /** The formatted month-year string (localized). */
  label: string;
  /** Navigate to the previous month. */
  goToPrevMonth: () => void;
  /** Navigate to the next month. */
  goToNextMonth: () => void;
  /** Navigate to a specific date's month. */
  goToDate: (date: Date) => void;
  /** Navigate to today's month. */
  goToToday: () => void;
  /** Whether the previous month navigation is possible (respects minDate). */
  canGoToPrev: boolean;
  /** Whether the next month navigation is possible (respects maxDate). */
  canGoToNext: boolean;
  /** The locale string in use. */
  locale: string;
}

interface CalendarWidgetProps {
  /** Custom render function for the calendar header.
   *  When provided, replaces the entire default header (CalendarHeader component).
   *  Receives navigation helpers and view state. */
  renderHeader?: (info: HeaderRenderInfo) => React.ReactNode;
}
```

### Behavior

- When `renderHeader` is not provided, the default `CalendarHeader` component renders as normal (prev/next arrows, month-year label, today button).
- When `renderHeader` is provided, it **completely replaces** the default header. The consumer is responsible for rendering navigation controls using the provided helper functions.
- The header render function receives all navigation state and methods needed to build a fully functional header without accessing internal component state.

### Example usage

```tsx
<CalendarWidget
  renderHeader={({ label, goToPrevMonth, goToNextMonth, canGoToPrev, canGoToNext }) => (
    <div className="my-custom-header">
      <button onClick={goToPrevMonth} disabled={!canGoToPrev}>←</button>
      <h3>{label}</h3>
      <button onClick={goToNextMonth} disabled={!canGoToNext}>→</button>
    </div>
  )}
/>
```

### Accessibility considerations

- When using `renderHeader`, the consumer assumes responsibility for accessible navigation buttons (`aria-label`, keyboard support).
- Document clearly that custom headers should include:
  - `aria-label` on navigation buttons.
  - `aria-live="polite"` on the month label for screen reader announcements.
  - Keyboard-accessible controls.
- The `CalendarGrid` continues to manage its own `aria-label` referencing the current month — this is not affected by `renderHeader`.

### Integration with other features

- **Quick navigation** (issue 0013): When `renderHeader` is provided, the built-in month/year drill-up is not available (it's part of the default header). Consumers can implement their own month picker using `goToDate`. Document this tradeoff.
- **Today button** (issue 0014): `showTodayButton` and `todayButtonLabel` are ignored when `renderHeader` is provided. The consumer can use `goToToday()` to implement their own.

## Verification

- Provide `renderHeader` with custom buttons → default header is not rendered, custom header appears with working navigation.
- Call `goToPrevMonth` from custom header → calendar navigates to previous month.
- Call `goToNextMonth` from custom header → calendar navigates to next month.
- `canGoToPrev` is `false` when at `minDate` boundary → consumer can disable their button.
- `canGoToNext` is `false` when at `maxDate` boundary.
- `goToDate(new Date(2020, 0))` from custom header → calendar jumps to January 2020.
- Without `renderHeader` → default header renders normally, no regressions.
- `label` is correctly localized when `locale` prop is set.
- Unit tests cover: custom header renders, navigation helpers work, `canGoToPrev`/`canGoToNext` boundary states, `goToDate` navigation, default header when prop is absent, localized label.
