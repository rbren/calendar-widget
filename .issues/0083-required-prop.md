---
tag: pm
state: open
---

# 0083 — `required` Prop

## Problem

In form contexts, a calendar field is often mandatory — the user must select a date before submitting. Currently there is no built-in way to:

1. Prevent the user from deselecting a date once one is chosen.
2. Signal to assistive technologies that a selection is required.
3. Provide a visual "required" indicator.

This is a basic expectation for any form-integrated input component. It complements the form integration work in issue 0074 and the validation state in issue 0075.

## Requirements

### `required` prop

```ts
interface CalendarWidgetProps {
  /** When true, indicates that a date selection is required.
   *  Sets `aria-required="true"` on the grid and prevents deselection
   *  if a clear/toggle-off mechanism is added (issue 0039).
   *  Default: false. */
  required?: boolean;
}
```

### Behavior

- `aria-required="true"` is set on the `<table role="grid">` element (or the root, depending on form integration patterns).
- If issue 0039 (clear selection) is implemented, the clear button is hidden or disabled when `required={true}` and no date is selected yet — once a date is selected, the user cannot clear it.
- If a toggle-to-deselect pattern is ever added (click selected date to deselect), `required` prevents that deselection.
- The prop is informational for the parent form — the calendar itself does not block navigation or show error states (that's issue 0075).
- When used with a hidden `<input>` (issue 0074), the hidden input should also have `required` set so native form validation works.

## Implementation Notes

1. Add `required?: boolean` to `CalendarWidgetProps`.
2. In `CalendarGrid`, pass `aria-required={required || undefined}` to the `<table>`.
3. In `useCalendarState`, if `required` is true and the user attempts to deselect (when that feature exists), block the `onChange(null)` call.
4. If issue 0074 adds a hidden `<input>`, conditionally add the `required` HTML attribute.

## Verification

- Render with `required={true}` → `aria-required="true"` is present on the grid element.
- If clear selection (0039) is implemented: clicking "Clear" when `required` is true does nothing.
- Inspecting the DOM shows the correct ARIA attribute.
- Screen reader announces the grid as "required".
- Unit tests: aria-required set when required=true, aria-required absent when required=false, deselection blocked when required.
