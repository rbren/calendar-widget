---
tag: pm
state: open
---

# 0019 — Event Markers / Date Decorations

## Problem

Calendars frequently need to indicate that certain dates have associated events, appointments, or data points. While `renderDay` (issue 0016) provides a general escape hatch, a first-class "markers" API is more ergonomic for the most common case: showing a small dot or badge on dates that have events. Without this, every consumer with event data has to build the same dot-rendering logic themselves.

## Requirements

### `markedDates` prop

```ts
interface DateMarker {
  /** The date to mark */
  date: Date;
  /** Optional dot color (defaults to --cw-color-primary) */
  color?: string;
  /** Optional tooltip or aria-label text */
  label?: string;
}

interface CalendarWidgetProps {
  /** Dates to show with an event marker (dot indicator) */
  markedDates?: DateMarker[];
}
```

### Visual treatment

- A small colored dot (4–6px circle) appears below the day number inside the cell.
- If multiple markers share the same date, show up to 3 dots side-by-side (additional markers are collapsed to an ellipsis or "+" indicator).
- Dots use the marker's `color` if provided, otherwise `--cw-color-primary`.
- Add CSS custom properties:
  - `--cw-marker-size` (default: `5px`)
  - `--cw-marker-gap` (default: `2px`, space between multiple dots)

### Interaction

- Markers are purely visual indicators — they do not affect date selection or disabled state.
- If a `label` is provided, it should appear as a tooltip on hover (`title` attribute) and be included in the cell's `aria-label` (e.g., "March 5, Team standup").

### Interaction with `renderDay`

- If both `markedDates` and `renderDay` are provided, the markers should be included in the `DayRenderInfo` context:

```ts
interface DayRenderInfo {
  // ... existing fields
  /** Markers for this date, if any */
  markers?: DateMarker[];
}
```

- When `renderDay` is provided, the default dot rendering is **skipped** — the consumer is responsible for rendering markers using the `markers` array in the info object. This prevents conflicts between custom rendering and built-in dots.

## Verification

- Pass `markedDates` with 5 dates → dots appear on exactly those 5 dates.
- Pass a marker with `color: "red"` → that date's dot is red.
- Pass 4 markers on the same date → 3 dots + overflow indicator.
- Pass a marker with `label: "Meeting"` → hovering shows tooltip, screen reader includes "Meeting" in the date's label.
- `markedDates={[]}` or omitted → no dots, no regressions.
- With `renderDay` also set → no default dots rendered, but `info.markers` is populated.
- Unit tests cover: dot rendering, color override, multi-marker overflow, label/tooltip, interaction with `renderDay`, ARIA label inclusion.
