---
tag: pm
state: open
---

# 0020 — Multi-Date Selection

## Problem

Beyond single-date and range selection, some use cases require selecting multiple individual (non-contiguous) dates — shift scheduling, multi-day event creation, picking multiple appointment slots. This is a distinct mode from range selection and should be a first-class option.

## Requirements

### New selection mode

Extend the `mode` prop:

```ts
interface CalendarWidgetProps {
  mode?: 'single' | 'range' | 'multiple';   // default: 'single'
  /** For multiple mode, the currently selected dates */
  value?: Date | DateRange | Date[] | null;
  onChange?: (value: Date | DateRange | Date[] | null) => void;
}
```

### Interaction behavior (multiple mode)

1. Clicking a date toggles its selection — click once to select, click again to deselect.
2. Any number of dates can be selected simultaneously.
3. `onChange` receives the full array of selected dates, sorted chronologically.
4. `minDate`, `maxDate`, and `disabledDates` constraints are respected.

### Optional: maximum selection count

```ts
interface CalendarWidgetProps {
  /** Maximum number of dates that can be selected in "multiple" mode.
   *  Ignored in other modes. No limit if not set. */
  maxSelections?: number;
}
```

When the max is reached, additional clicks on unselected dates are ignored (dates are not clickable). Already-selected dates can still be deselected. Provide a visual indication that the max has been reached (e.g., unselected dates appear dimmed similar to disabled dates).

### Visual treatment

- Each selected date gets the same filled accent background as single-selection mode.
- No connecting band between selected dates (that's range mode's treatment).
- Unselectable dates (max reached) should look like disabled dates but use a different ARIA state to distinguish "max reached" from "date disabled".

### Accessibility

- All selected dates have `aria-selected="true"`.
- When max is reached, unselected dates should have `aria-disabled="true"` and an `aria-label` indicating why (e.g., "March 10, maximum selections reached").

### Uncontrolled mode support

When `defaultValue` is a `Date[]`, the component initializes with those dates selected and manages the array internally.

## Verification

- `<CalendarWidget mode="multiple" />` → click 3 dates → all 3 visually selected, `onChange` fires with sorted array of 3 dates. Click one again → deselected, array has 2 dates.
- `maxSelections={3}` with 3 selected → 4th date click is ignored, unselected dates appear dimmed.
- Deselect one → unselected dates become clickable again.
- Keyboard: `Enter`/`Space` toggles selection.
- `disabledDates` are not selectable in multi-mode.
- Unit tests cover: toggle selection, sort order, max enforcement, deselect at max, disabled date interaction, keyboard toggle, uncontrolled with `defaultValue` array.
