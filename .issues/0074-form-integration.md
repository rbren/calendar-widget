---
tag: pm
state: open
---

# 0074 — Form Integration

## Problem

Calendar widgets are almost always used inside forms — date-of-birth fields, appointment selectors, booking forms, filter panels. Yet the current component has no integration with the HTML form system or popular form libraries (React Hook Form, Formik, etc.). Without form integration:

- The selected date is not submitted with the form (no `name` attribute, no hidden input).
- HTML5 validation does not work (`required`, `setCustomValidity`).
- Form libraries cannot control the component via `ref` with standard patterns.
- Server-side form handling (progressive enhancement) gets no date value.

Every major date picker library (MUI, Ant Design, react-datepicker) provides `name`, `required`, and form submission support.

## Requirements

### New props

```ts
interface CalendarWidgetProps {
  /** Form field name. When provided, a hidden <input> is rendered with the serialized date value. */
  name?: string;
  /** Whether a date selection is required. Adds required validation to the hidden input. Default: false. */
  required?: boolean;
  /** Message shown when required validation fails. Default: browser default. */
  requiredMessage?: string;
  /** Date serialization format for form submission.
   *  'iso' — ISO 8601 date string, e.g., "2026-03-15" (default).
   *  'timestamp' — Unix timestamp in milliseconds.
   *  Custom function: (date: Date | DateRange | null) => string. */
  dateFormat?: 'iso' | 'timestamp' | ((value: Date | DateRange | null) => string);
}
```

### Hidden input behavior

When `name` is provided, render a visually hidden `<input>` element inside the calendar root:

```html
<input type="hidden" name="appointment-date" value="2026-03-15" />
```

- The hidden input's `value` is updated whenever the selection changes.
- For `null`/no selection: the input value is an empty string.
- For single date: serialized according to `dateFormat`.
- For date range: two hidden inputs are rendered with `name` and `name + "End"` suffixes (e.g., `name="check-in"` → `check-in` and `check-inEnd`), or a single input with a serialized range string if `dateFormat` is a custom function.

### Serialization formats

| `dateFormat` | Single date output | Range output |
|---|---|---|
| `'iso'` (default) | `"2026-03-15"` | Two inputs: `"2026-03-15"` and `"2026-03-20"` |
| `'timestamp'` | `"1773936000000"` | Two inputs: timestamps for start and end |
| `(value) => string` | Custom function return value | Custom function receives `DateRange`, returns single string |

### Required validation

When `required={true}` and `name` is provided:

1. The hidden input has the `required` attribute.
2. If no date is selected and the form is submitted, native form validation prevents submission and shows the browser's required field message.
3. `requiredMessage` customizes the validation message via `setCustomValidity()`.
4. After selecting a date, the custom validity is cleared.

### Ref forwarding

Forward a `ref` that exposes the hidden input element, enabling form library integration:

```tsx
const inputRef = useRef<HTMLInputElement>(null);
<CalendarWidget name="dob" ref={inputRef} />
// inputRef.current is the hidden <input>
```

This allows React Hook Form's `register()` or Formik's `field` to attach to the underlying input.

### Example usage

```tsx
// Basic form submission
<form action="/api/book" method="POST">
  <CalendarWidget name="check-in" required />
  <button type="submit">Book</button>
</form>

// React Hook Form
const { register, handleSubmit } = useForm();
<CalendarWidget name="dob" {...register('dob', { required: true })} />

// Custom format
<CalendarWidget
  name="date"
  dateFormat={(d) => d ? d.toLocaleDateString('en-GB') : ''}
/>
```

### Accessibility

- The hidden input should have `aria-hidden="true"` since it is not visible to users.
- Validation errors should be announced via the calendar's `aria-describedby` or an adjacent `aria-live` region.
- The calendar grid itself acts as the accessible control — the hidden input is only for form data submission.

## Verification

- `name="start-date"`: hidden `<input>` exists in the DOM with that name attribute. Select a date → input value updates to ISO date string.
- Form submission: wrap calendar in `<form>` with `name` → submit → form data includes the date.
- `required={true}` + no selection + form submit → browser validation prevents submission.
- `required={true}` + selection made → form submits normally.
- `requiredMessage="Please pick a date"` → custom message shown on validation failure.
- `dateFormat="timestamp"` → input value is a numeric string.
- `dateFormat` custom function → input value is the function's return.
- Range mode + `name="trip"` → two hidden inputs: `trip` and `tripEnd`.
- No `name` prop → no hidden input rendered.
- `ref` forwarding → ref points to the hidden input element.
- Unit tests cover: hidden input presence with `name`, value serialization for each format, required validation, custom validation message, range mode dual inputs, ref forwarding, no input without name, value update on selection change.
