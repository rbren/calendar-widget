---
tag: pm
state: open
---

# 0073 — Loading & Busy State

## Problem

Calendar widgets frequently depend on asynchronous data to determine which dates are available, have events, or have pricing. Common scenarios:

- **Appointment booking**: Available time slots are fetched from an API when the month changes.
- **Hotel availability**: Room availability is loaded per-month from a backend.
- **Event calendars**: Events for the visible month are fetched lazily.

During the data loading window, the calendar needs to communicate its state to the user. Without built-in loading support, consumers must:

1. Overlay their own spinner on top of the calendar.
2. Disable all interactions manually during loading.
3. Handle the visual jank of dates going from "all enabled" to "some disabled" once data arrives.

A first-class loading state prevents clicks on stale data, provides accessible announcements, and delivers a polished experience.

## Requirements

### New prop

```ts
interface CalendarWidgetProps {
  /** When true, the calendar is in a loading/busy state.
   *  The grid is visually dimmed and interactions are suppressed.
   *  Default: false. */
  loading?: boolean;
}
```

### Behavior when `loading={true}`

1. **Visual**: The day grid area is overlaid with a subtle loading indicator (a pulsing opacity animation or a small spinner above the grid). The grid remains visible but at reduced opacity (e.g., `opacity: 0.5`).
2. **Interaction suppression**: Clicking any day cell does nothing — `onChange` does not fire. Hover effects are suppressed (no cursor change, no hover highlight, no range preview).
3. **Navigation preserved**: Prev/next month buttons, the Today button, and quick navigation remain functional. This allows the user to navigate to a different month, which triggers `onMonthChange` (issue 0021) and the consumer fetches new data.
4. **Keyboard**: Arrow key navigation within the grid is suppressed. Enter/Space on a day cell does nothing. Tab still moves to navigation buttons.
5. **ARIA**: The calendar root should have `aria-busy="true"`. An `aria-live="polite"` region should announce "Loading" when entering the loading state.

### CSS custom properties

```css
--cw-loading-opacity: 0.5;       /* Grid opacity during loading */
--cw-loading-overlay-bg: transparent; /* Optional overlay background */
```

### Visual indicator

The default loading indicator should be minimal — a small horizontal bar or pulsing dots centered above the grid, using `--cw-color-primary`. It should be pure CSS (no additional images or icons).

Consumers who want a custom loading indicator can hide the default one and render their own via a future `renderFooter` (issue 0040) or by positioning an element over the calendar.

### Integration with other features

- **Month change callback** (issue 0021): `onMonthChange` fires normally during loading. This is the primary trigger for consumers to fetch new data.
- **Quick navigation** (issue 0013): Works during loading — selecting a month/year updates the view and triggers `onMonthChange`.
- **Range selection** (issue 0012): If loading starts after the first range click, the pending range start is preserved. When loading ends, the user can continue selecting the range end.
- **Controlled mode** (issue 0018): `loading` is orthogonal to controlled/uncontrolled — it only suppresses interactions.

## Verification

- `loading={true}` → grid is visually dimmed, click on a day does nothing, `onChange` does not fire.
- `loading={true}` → prev/next buttons still work, `onMonthChange` fires.
- `loading={true}` → root element has `aria-busy="true"`.
- `loading={false}` (default) → normal behavior, no dimming.
- Transition: `loading` goes from `false` → `true` → `false` → grid fully interactive again.
- `loading={true}` during range selection → range start preserved, second click blocked.
- No hover effects during loading.
- CSS: override `--cw-loading-opacity` → dimming intensity changes.
- Unit tests cover: aria-busy attribute, click suppression during loading, navigation during loading, onChange not called, hover suppression, loading indicator visibility, transition between states, range start preservation.
