---
tag: pm
state: open
---

# 0075 — Error & Validation State

## Problem

When a calendar widget is used as a form field, it needs to communicate validation errors to the user — "This field is required," "Date must be in the future," "Selected date is unavailable." Currently there is no mechanism to display error states or messages. Without visual error feedback:

- Users don't know why their form submission failed.
- The calendar looks identical whether the field is valid or invalid.
- Consumers must build error display from scratch, positioned outside the component, with no visual connection to the calendar.

Standard form components (inputs, selects) have native error states. A calendar widget used as a form control needs the same.

## Requirements

### New props

```ts
interface CalendarWidgetProps {
  /** Whether the calendar is in an error/invalid state. Default: false.
   *  When true, the widget shows a visual error indicator. */
  error?: boolean;
  /** Error message to display below the calendar grid.
   *  Only shown when error={true}. */
  errorMessage?: string;
}
```

### Visual treatment

When `error={true}`:

1. The calendar root element gets a red/error border (using `--cw-color-error`, default: `#dc2626`).
2. If `errorMessage` is provided, it appears below the grid in a small, red text block.
3. The error border replaces the default border (if any), not in addition to it.

CSS custom properties:

```css
--cw-color-error: #dc2626;            /* Error border and text color */
--cw-color-error-bg: transparent;      /* Optional error message background */
--cw-error-border-width: 2px;          /* Error border thickness */
```

### Accessibility

- When `error={true}`: the root element gets `aria-invalid="true"`.
- When `errorMessage` is provided: the message is rendered in a `<div>` with a generated `id`, and the calendar root references it via `aria-describedby`.
- The error message container should have `role="alert"` so screen readers announce it immediately when it appears.

### Behavior

- The error state is purely visual and informational — it does NOT prevent interaction. Users can still select dates, navigate months, etc. The consumer controls when to set/clear `error` based on their validation logic.
- When the user makes a new selection (`onChange` fires), the consumer is responsible for re-validating and updating `error`/`errorMessage`. The component does not auto-clear errors.

### Integration with form integration (issue 0074)

- When `required={true}` (issue 0074) and native form validation triggers, consumers can set `error={true}` and `errorMessage` in their `onInvalid` handler.
- The error state from this prop is independent of HTML5 form validation — they can be used separately or together.

### Example usage

```tsx
const [error, setError] = useState(false);
const [errorMsg, setErrorMsg] = useState('');

<CalendarWidget
  value={selectedDate}
  error={error}
  errorMessage={errorMsg}
  onChange={(date) => {
    setSelectedDate(date);
    if (!date) {
      setError(true);
      setErrorMsg('Please select a date');
    } else if (date < new Date()) {
      setError(true);
      setErrorMsg('Date must be in the future');
    } else {
      setError(false);
      setErrorMsg('');
    }
  }}
/>
```

## Verification

- `error={true}` → calendar has red/error border, `aria-invalid="true"` on root.
- `error={true} errorMessage="Required"` → error message appears below grid, root has `aria-describedby` pointing to message, screen reader announces "Required".
- `error={false}` (default) → no error border, no `aria-invalid`, no error message.
- `error={true}` → all interactions still work (click, keyboard, navigation).
- `error` toggled dynamically → visual state updates immediately.
- CSS: override `--cw-color-error` → border and text change color.
- `errorMessage` without `error={true}` → message is not rendered.
- Unit tests cover: error border presence, aria-invalid attribute, errorMessage rendering, aria-describedby linkage, role="alert" on message, no error state by default, interactions preserved during error, dynamic toggling, errorMessage hidden when error=false.
