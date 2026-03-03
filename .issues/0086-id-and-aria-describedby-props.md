---
tag: pm
state: open
---

# 0086 — `id` and `aria-describedby` Props

## Problem

The calendar widget does not accept an `id` prop or `aria-describedby`. These are foundational HTML/accessibility attributes needed for:

1. **Label association**: A `<label htmlFor="my-calendar">` cannot reference the calendar because the root element has no `id`.
2. **Helper text association**: A form field often has descriptive text below it (e.g., "Select your preferred travel date"). Without `aria-describedby`, screen readers cannot associate this text with the calendar.
3. **Testing**: `id` is a common selector for integration tests and E2E frameworks.
4. **Anchor targets**: URL fragment links (`#my-calendar`) and `document.getElementById` lookups.

Every form-capable component should forward `id` and `aria-describedby` to its root element.

## Requirements

### `id` prop

```ts
interface CalendarWidgetProps {
  /** HTML id attribute for the root element. */
  id?: string;
}
```

### `aria-describedby` prop

```ts
interface CalendarWidgetProps {
  /** Space-separated list of element IDs that describe this calendar.
   *  Forwarded to the grid element so screen readers associate
   *  helper text with the calendar. */
  'aria-describedby'?: string;
}
```

### `aria-label` prop

```ts
interface CalendarWidgetProps {
  /** Custom accessible label for the calendar grid.
   *  Overrides the default "Calendar" label. Useful when multiple
   *  calendars are on the same page (e.g., "Departure date", "Return date"). */
  'aria-label'?: string;
}
```

### Behavior

- `id` is applied to the root `<div>` of `CalendarWidget`.
- `aria-describedby` is forwarded to the `<table role="grid">` element.
- `aria-label` overrides the default `aria-label="Calendar"` on the `<table>`.
- All three are optional and have no effect when omitted.

## Implementation Notes

1. Add `id`, `aria-describedby`, and `aria-label` to `CalendarWidgetProps`.
2. In `CalendarWidget`, apply `id` to the root `<div>`.
3. Pass `aria-describedby` and `aria-label` through to `CalendarGrid`, which applies them to the `<table>`.
4. In `CalendarGridProps`, add optional `aria-describedby` and `aria-label` (or a more generic `gridAriaLabel` / `gridAriaDescribedBy`).

## Verification

- Render with `id="departure-cal"` → `<div id="departure-cal" ...>` in the DOM.
- Render with `aria-describedby="helper-text"` → `<table aria-describedby="helper-text" ...>` in the DOM.
- Render with `aria-label="Departure date"` → `<table aria-label="Departure date" ...>`.
- Render two calendars with different `aria-label` values → screen readers distinguish them.
- `<label htmlFor="departure-cal">` correctly associates with the calendar.
- Without any of these props → no `id`, default `aria-label="Calendar"`, no `aria-describedby` (no regression).
- Unit tests: id applied to root, aria-describedby on grid, aria-label overrides default, omitted props produce no attributes.
