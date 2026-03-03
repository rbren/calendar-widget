---
tag: pm
state: open
---

# 0084 — Component Slot Overrides (Headless Customization)

## Problem

The calendar widget exports its sub-components (`CalendarHeader`, `CalendarGrid`, `CalendarDayCell`, `MonthPicker`, `YearPicker`), which allows advanced users to compose their own calendar. However, there is no way to replace individual sub-components within the pre-composed `CalendarWidget` without forking or re-composing from scratch. This is a significant customizability gap.

Modern component libraries (react-day-picker's `components` prop, Radix's `asChild`, MUI's `slots`/`slotProps`) allow users to override internal components through a declarative prop. This enables:

- Swapping the header for a completely custom layout.
- Replacing day cells with custom components (beyond what `renderDay` offers — full control over the `<td>` element itself, not just its content).
- Injecting a custom month/year picker.
- Building headless variants without duplicating state logic.

## Requirements

### `components` prop

```ts
interface CalendarComponents {
  /** Override the header component. Receives CalendarHeaderProps. */
  Header?: React.ComponentType<CalendarHeaderProps>;
  /** Override the day grid component. Receives CalendarGridProps. */
  Grid?: React.ComponentType<CalendarGridProps>;
  /** Override individual day cells. Receives CalendarDayCellProps. */
  DayCell?: React.ComponentType<CalendarDayCellProps>;
  /** Override the month picker. Receives MonthPickerProps. */
  MonthPicker?: React.ComponentType<MonthPickerProps>;
  /** Override the year picker. Receives YearPickerProps. */
  YearPicker?: React.ComponentType<YearPickerProps>;
}

interface CalendarWidgetProps {
  /** Override internal sub-components with custom implementations.
   *  Each override receives the same props the default component would. */
  components?: CalendarComponents;
}
```

### Behavior

- If `components.Header` is provided, `CalendarWidget` renders `<components.Header {...headerProps} />` instead of the default `<CalendarHeader>`.
- The same pattern applies to each slot.
- Default components are used for any slot not overridden.
- The `CalendarComponents` type is exported so users can type their custom components.
- The `useCalendarState` hook remains the primary source of calendar logic — component overrides are purely presentational.

### Interaction with `renderDay`

- `renderDay` continues to work as a simpler customization path for day cell content.
- `components.DayCell` is a more powerful alternative that replaces the entire cell component.
- If both are provided, `components.DayCell` takes precedence and receives `renderDay` in its props (it can choose to use it or ignore it).

## Implementation Notes

1. Add `CalendarComponents` interface and `components` prop to types.
2. In `CalendarWidget`, resolve each component:
   ```ts
   const HeaderComp = components?.Header ?? CalendarHeader;
   const GridComp = components?.Grid ?? CalendarGrid;
   // ... etc.
   ```
3. Replace JSX references with the resolved component variables.
4. Export `CalendarComponents` from the barrel.

## Verification

- Render with `components={{ Header: MyCustomHeader }}` → the custom header is rendered, receiving all standard header props.
- Render with `components={{ DayCell: MyDayCell }}` → each day renders using the custom cell component.
- Render with no `components` prop → default components are used (no regression).
- Render with only some slots overridden → non-overridden slots use defaults.
- Type-check: custom components that don't match the expected props signature produce TS errors.
- Unit tests: custom header receives correct props, custom day cell renders for each day, partial overrides work, default behavior unchanged without prop.
