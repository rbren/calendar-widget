---
tag: pm
state: open
---

# 0039 — Clear Selection

## Problem

Once a user selects a date, there is no built-in way to clear the selection back to "no date selected." This is a basic expectation for any form control — users make mistakes, change their minds, or need to indicate "no date." Without a clear mechanism:

- In uncontrolled mode, the selection is permanent within the component lifecycle.
- In controlled mode, the consumer must implement their own clear UI and pass `value={null}`.
- There is no visual affordance telling the user they *can* clear the selection.

Every mainstream date picker provides this: MUI has a "Clear" button, Ant Design has a clear icon, `react-datepicker` has `isClearable`.

## Requirements

### `clearable` prop

```ts
interface CalendarWidgetProps {
  /** Show a clear button that resets the selection to null. Default: false. */
  clearable?: boolean;
  /** Custom label for the clear button (default: "Clear"). Useful for i18n. */
  clearButtonLabel?: string;
}
```

### Behavior

1. When `clearable={true}` and a date is selected (`value` is not null/undefined), a "Clear" button appears in the calendar footer area.
2. Clicking "Clear" calls `onChange(null)`.
3. In uncontrolled mode, the internal selection state resets to `null`.
4. In controlled mode, `onChange(null)` fires and the consumer updates `value`.
5. After clearing, the calendar remains on the currently displayed month — it does not navigate.
6. When no date is selected, the "Clear" button is hidden (there's nothing to clear).
7. Works with all selection modes: single, range, and multiple.

### Click-to-deselect alternative

In addition to the clear button, support click-to-deselect for single-selection mode:

```ts
interface CalendarWidgetProps {
  /** In single mode, clicking the selected date again deselects it. Default: false. */
  deselectOnClick?: boolean;
}
```

- `deselectOnClick={true}` + click on the already-selected date → `onChange(null)`.
- In `multiple` mode, click-to-deselect is already the default behavior (toggle).
- In `range` mode, `deselectOnClick` is ignored (clicking starts a new range instead).

### Visual treatment

- The "Clear" button should use a secondary/text-button style — understated, not competing with the calendar grid.
- Placement: below the grid, right-aligned, in a footer area. If a `renderFooter` (issue 0040) is provided, the clear button appears within/before the custom footer.
- Add CSS custom properties:
  - `--cw-clear-btn-color` (default: `--cw-color-text-muted`)
  - `--cw-clear-btn-hover-color` (default: `--cw-color-primary`)

### Accessibility

- Clear button: `aria-label="Clear selected date"` (or "Clear selected dates" / "Clear selected range" depending on mode).
- Keyboard accessible: reachable via `Tab`, activatable via `Enter`/`Space`.
- After clearing, focus moves back to the calendar grid (to the day that was previously selected, or today if it was in the current month, or the first day of the month).
- Screen reader announcement: `aria-live="polite"` region announces "Selection cleared."

### Imperative API integration (issue 0023)

Add a `clearSelection()` method to `CalendarWidgetRef`:

```ts
interface CalendarWidgetRef {
  /** Clear the current selection. Equivalent to onChange(null). */
  clearSelection(): void;
}
```

## Verification

- `clearable={true}` + select a date → "Clear" button appears. Click it → selection removed, `onChange(null)` fires.
- No date selected → "Clear" button is hidden.
- `clearable={false}` (default) → no clear button ever.
- `deselectOnClick={true}` in single mode → click selected date → it deselects.
- `deselectOnClick={true}` in range mode → ignored, click starts new range.
- `clearButtonLabel="Effacer"` → button reads "Effacer".
- Keyboard: Tab to "Clear" → Enter → selection cleared, focus returns to grid.
- Screen reader announces "Selection cleared" after clearing.
- In uncontrolled mode: clear works without consumer managing state.
- In controlled mode: `onChange(null)` fires, visual update depends on consumer.
- Imperative: `calendarRef.current.clearSelection()` → selection cleared.
- Unit tests cover: clear button visibility (selected vs not), clear action fires onChange(null), deselectOnClick in each mode, custom label, keyboard flow, focus management after clear, uncontrolled state reset, imperative clearSelection.
