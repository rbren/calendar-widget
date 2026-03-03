# CalendarHeader

Renders the month/year label, previous/next navigation buttons, and an optional "Today" button. When quick navigation is enabled, the heading is a clickable button that triggers drill-up navigation.

```tsx
import { CalendarHeader } from '@calendar-widget/core';
```

> **Note:** You only need to import this directly if you are building a custom calendar layout. For standard usage, `CalendarWidget` renders it automatically.

## Props — `CalendarHeaderProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `viewDate` | `Date` | — | The date representing the currently displayed month (typically the 1st of that month). |
| `monthYearLabel` | `string` | — | Pre-formatted label string. In days view this is the month/year (e.g. `"March 2026"`), in months view the year, and in years view the year range. |
| `onPrevMonth` | `() => void` | — | Called when the user clicks the previous navigation button. |
| `onNextMonth` | `() => void` | — | Called when the user clicks the next navigation button. |
| `activeView` | `CalendarView` | `'days'` | Current drill-up view. Controls the `aria-label` on the prev/next buttons (e.g. "Previous month", "Previous year", "Previous year range"). |
| `quickNavigation` | `boolean` | `undefined` | When `true`, the heading is rendered as a `<button>` instead of a `<span>`. |
| `onDrillUp` | `() => void` | `undefined` | Called when the heading button is clicked to drill up. |
| `headingAriaLabel` | `string` | `undefined` | Accessible label for the heading button (e.g. `"Choose month and year, currently March 2026"`). |
| `showTodayButton` | `boolean` | `true` | Whether to show the "Today" button. |
| `todayButtonLabel` | `string` | `"Today"` | Label text for the today button. |
| `isCurrentMonth` | `boolean` | `false` | When `true`, the today button is rendered as `aria-disabled` and is not clickable. |
| `onGoToToday` | `() => void` | `undefined` | Called when the today button is clicked. |

## Accessibility

- The previous/next buttons have dynamic `aria-label` values based on the active view: `"Previous month"` / `"Next month"`, `"Previous year"` / `"Next year"`, or `"Previous year range"` / `"Next year range"`.
- The month/year label uses `aria-live="polite"` so screen readers announce changes.
- When quick navigation is enabled, the heading button has a descriptive `aria-label` (e.g. `"Choose month and year, currently March 2026"`).
- The today button has `aria-label="Navigate to current month"` and uses `aria-disabled="true"` when already viewing the current month.

## Usage

```tsx
<CalendarHeader
  viewDate={new Date(2026, 2, 1)}
  monthYearLabel="March 2026"
  onPrevMonth={() => console.log('prev')}
  onNextMonth={() => console.log('next')}
  activeView="days"
  quickNavigation
  onDrillUp={() => console.log('drill up')}
  headingAriaLabel="Choose month and year, currently March 2026"
  showTodayButton
  todayButtonLabel="Today"
  isCurrentMonth={false}
  onGoToToday={() => console.log('go to today')}
/>
```
