---
tag: pm
state: open
---

# 0064 — Highlighted / Accent Dates

## Problem

There is no way to visually emphasize specific dates without selecting them. Issue 0019 (event markers) addresses adding dot indicators below dates, but many use cases require a more prominent visual treatment — a colored background or border to draw attention to dates like holidays, deadlines, pay days, or important milestones.

Currently, the only way to visually distinguish a date is to select it (`isSelected`) or disable it (`isDisabled`), neither of which communicates "this date is noteworthy". Highlighted dates are a distinct concept from selection — they persist regardless of what the user clicks and provide contextual visual information.

## Requirements

### New prop

```ts
interface CalendarWidgetProps {
  /** Dates to visually highlight (or a predicate function returning a highlight category).
   *  Highlighted dates show a colored background but are not selected. */
  highlightedDates?: Date[] | ((date: Date) => string | false);
}
```

When an array of `Date` objects is provided, those dates get the default highlight treatment. When a function is provided, it receives each rendered date and returns either:
- `false` (or a falsy value): no highlight
- A string: a highlight category name used as a CSS modifier class (e.g., `"holiday"`, `"deadline"`)

### Visual treatment

Add a default highlight style and support for named categories:

```css
/* Default highlight */
.highlighted {
  background: var(--cw-color-highlight, #fef3c7);
  color: var(--cw-color-highlight-text, var(--cw-color-text));
}

/* Category-based highlights via data attribute */
.highlighted[data-highlight="holiday"] {
  background: var(--cw-color-highlight-holiday, #fee2e2);
}
.highlighted[data-highlight="deadline"] {
  background: var(--cw-color-highlight-deadline, #fef3c7);
}
```

The consumer can add their own category styles via CSS targeting `[data-highlight="<category>"]`.

### Interaction

- Highlighted dates are fully interactive (clickable, selectable). The highlight is a visual layer beneath the selection layer.
- When a highlighted date is also selected, the selected style takes precedence.
- When a highlighted date is also disabled, both styles combine (highlight background + muted text + no pointer).
- Highlighted dates inside a selected range show the range band, not the highlight.

### Implementation guidance

1. Add `highlightedDates` to `CalendarWidgetProps`.
2. Pass it through to `CalendarGrid`.
3. In `CalendarGrid`, for each rendered date, compute the highlight:
   ```ts
   const highlight = typeof highlightedDates === 'function'
     ? highlightedDates(date)
     : (highlightedDates?.some(d => isSameDay(d, date)) ? 'default' : false);
   ```
4. Pass `highlight` to `CalendarDayCell` as a new `highlight?: string | false` prop.
5. In `CalendarDayCell`, apply the `.highlighted` class and `data-highlight` attribute when `highlight` is truthy.
6. Add `highlight` info to `aria-label` via `formatDayLabel` so screen readers announce it.

### Props additions

```ts
interface CalendarGridProps {
  // ... existing
  highlightedDates?: Date[] | ((date: Date) => string | false);
}

interface CalendarDayCellProps {
  // ... existing
  /** Highlight category for this date, or false for no highlight */
  highlight?: string | false;
}
```

## Verification

- Render with `highlightedDates={[new Date(2026, 2, 17)]}` → March 17 has a colored background distinct from selection.
- Render with a predicate: `highlightedDates={(d) => d.getDay() === 0 ? 'holiday' : false}` → all Sundays have the `holiday` highlight.
- Click a highlighted date → it becomes selected, selection style wins.
- Highlighted dates inside a selected range show range styling, not highlight.
- A disabled + highlighted date shows both visual cues.
- Custom CSS for `[data-highlight="holiday"]` applies correctly.
- Screen reader announces the highlight category (e.g., "Sunday, March 15, 2026, holiday").
- Unit tests cover: array-based highlighting, function-based highlighting with categories, interaction between highlight and selection, highlight and disabled, highlight and range, aria-label inclusion.
