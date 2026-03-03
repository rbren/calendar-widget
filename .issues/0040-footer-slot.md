---
tag: pm
state: open
---

# 0040 — Footer Slot / Action Bar

## Problem

Many calendar integration patterns require a footer area below the grid for action buttons or supplementary content:

- **Popover/dialog calendars**: "Apply" and "Cancel" buttons to confirm or discard a range selection.
- **Information display**: showing the selected date in a different format, a "Selected: March 5" label.
- **Shortcut buttons**: "Last 7 days", "This month", "Last 30 days" for range presets.
- **Custom controls**: timezone selectors, time pickers, or notes.

Without a footer slot, consumers must wrap the calendar and manually position extra UI below it — which breaks layout encapsulation and is fragile when combined with animations (issue 0022) or multi-month view (issue 0017).

## Requirements

### `renderFooter` prop

```ts
interface FooterRenderInfo {
  /** The currently selected value (Date, DateRange, Date[], or null). */
  selectedValue: Date | DateRange | Date[] | null;
  /** The currently displayed month (first of month). */
  viewDate: Date;
  /** Clear the current selection. */
  clearSelection: () => void;
  /** Navigate to a specific date's month. */
  goToDate: (date: Date) => void;
  /** The locale string in use. */
  locale: string;
}

interface CalendarWidgetProps {
  /** Custom render function for a footer area below the calendar grid.
   *  Receives selection state and helper functions. */
  renderFooter?: (info: FooterRenderInfo) => React.ReactNode;
}
```

### Behavior

- When `renderFooter` is not provided, no footer area is rendered (no wasted space).
- When provided, the footer renders inside the widget's root container, below the grid, inheriting the widget's width.
- The footer content is entirely consumer-controlled — the component provides context and helpers, not UI.
- The footer re-renders when selection or view changes.

### Example usage: Apply/Cancel pattern

```tsx
<CalendarWidget
  mode="range"
  value={confirmedRange}
  renderFooter={({ selectedValue, clearSelection }) => (
    <div className="calendar-actions">
      <button onClick={clearSelection}>Cancel</button>
      <button onClick={() => onConfirm(selectedValue)}>Apply</button>
    </div>
  )}
/>
```

### Example usage: Range presets

```tsx
<CalendarWidget
  mode="range"
  renderFooter={({ goToDate }) => (
    <div className="presets">
      <button onClick={() => selectPreset('last7days')}>Last 7 days</button>
      <button onClick={() => selectPreset('thisMonth')}>This month</button>
      <button onClick={() => selectPreset('last30days')}>Last 30 days</button>
    </div>
  )}
/>
```

### Visual treatment

- The footer area should have a top border or subtle separator to distinguish it from the grid.
- It should use the same horizontal padding as the rest of the widget for alignment.
- Add a CSS class `cw-footer` on the footer container for consumer styling.
- The footer should respect the widget's width — no overflow.

### Integration with clear button (issue 0039)

When both `clearable={true}` and `renderFooter` are provided:
- The built-in "Clear" button renders as the first element inside the footer container.
- The consumer's `renderFooter` content appears after it.
- This ensures the clear button has a natural position without conflicting with custom footer content.
- Alternatively, the consumer can use `clearSelection()` from the footer info to build their own clear UI and set `clearable={false}`.

### Accessibility

- The footer container should have `role="group"` with `aria-label="Calendar actions"` (or a consumer-provided label).
- Buttons within the footer must be keyboard accessible (they naturally will be as standard `<button>` elements).
- The footer should be reachable via Tab after the calendar grid.

## Verification

- Provide `renderFooter` returning an "Apply" button → button appears below the grid inside the widget container.
- `renderFooter` receives correct `selectedValue` after selecting a date.
- `clearSelection()` from footer info works → clears selection.
- `goToDate()` from footer info works → navigates calendar.
- Without `renderFooter` → no footer element in DOM.
- Footer respects widget width, no overflow.
- Footer updates when selection changes (re-renders with new `selectedValue`).
- With `clearable={true}` and `renderFooter` → clear button appears in footer area alongside custom content.
- Keyboard: Tab through grid → Tab reaches footer buttons.
- Unit tests cover: footer rendering with and without prop, context values accuracy, clearSelection helper, goToDate helper, clear button integration, keyboard reachability, re-render on selection change.
