---
tag: pm
state: open
---

# 0018 — Controlled & Uncontrolled Modes

## Problem

The current prop design (issue 0005) implies a controlled component (`value` + `onChange`), but does not define behavior when `value` is not provided. React components should support both controlled mode (parent owns state) and uncontrolled mode (component owns state internally, optionally reports changes). Without explicit support for both, consumers will hit confusing edge cases — e.g., clicking a date does nothing if `onChange` is provided but `value` is not updated.

## Requirements

### Uncontrolled mode

When `value` is not provided (or is `undefined`), the component manages its own selection state internally:

```tsx
// Uncontrolled — component tracks selection internally
<CalendarWidget
  defaultValue={new Date(2026, 2, 15)}
  onChange={(date) => console.log('Selected:', date)}
/>
```

### Controlled mode

When `value` is provided (including `null`), the component is fully controlled — it renders exactly what `value` says and never updates its own state:

```tsx
// Controlled — parent owns the state
const [date, setDate] = useState<Date | null>(null);
<CalendarWidget value={date} onChange={setDate} />
```

### New props

```ts
interface CalendarWidgetProps {
  /** Selected date (controlled mode). When provided, component is controlled. */
  value?: Date | DateRange | null;
  /** Initial selected date (uncontrolled mode). Ignored if `value` is provided. */
  defaultValue?: Date | DateRange | null;
  /** Called when selection changes in either mode. */
  onChange?: (value: Date | DateRange | null) => void;
  /** The initially displayed month (uncontrolled). Defaults to today or `defaultValue`'s month. */
  defaultMonth?: Date;
  /** The displayed month (controlled). When provided, navigation is controlled. */
  month?: Date;
  /** Called when the displayed month changes. */
  onMonthChange?: (month: Date) => void;
}
```

### View date (month) controlled/uncontrolled

The same pattern applies to which month is displayed:

- **Uncontrolled** (default): internal state, `defaultMonth` sets the initial view. Prev/next buttons update internally.
- **Controlled**: `month` + `onMonthChange`. Prev/next call `onMonthChange` but do not change the view unless the parent updates `month`.

This enables scenarios like syncing two calendar widgets to adjacent months, or restricting which months are viewable.

### Implementation guidance

In `useCalendarState`, detect the mode:

```ts
const isControlled = value !== undefined;
const isMonthControlled = month !== undefined;
```

Use `useState` for internal state only in uncontrolled mode. In controlled mode, use `value`/`month` directly and call the corresponding callback.

Follow React's conventions: do not switch between controlled and uncontrolled during the component's lifetime. Log a console warning in development if this happens (similar to React's own input warnings).

## Verification

- **Uncontrolled**: Render `<CalendarWidget />` with no `value` → click a date → it visually selects, `onChange` fires.
- **Uncontrolled with default**: Render with `defaultValue={someDate}` → that date is initially selected.
- **Controlled**: Render with `value={null}` → click a date → `onChange` fires but nothing visually changes until parent updates `value`.
- **Controlled**: Render with `value={someDate}` → that date is shown as selected. Update `value` prop → selection changes.
- **Month controlled**: Render with `month={new Date(2026, 0)}` → shows January. Click "next" → `onMonthChange` fires with February but view stays on January until parent updates `month`.
- **Dev warning**: Render with `value`, then remove `value` → console warning about switching modes.
- Unit tests cover: both modes for selection, both modes for month navigation, `defaultValue` initial state, mode-switching warning.
