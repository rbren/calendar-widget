---
tag: pm
state: open
---

# 0043 — SSR & Hydration Safety

## Problem

Modern React applications frequently use server-side rendering (Next.js, Remix, Gatsby, Astro). The current implementation has several SSR hazards:

1. **`new Date()` for "today" detection** — `isToday` is computed using `new Date()` inside the render path (`CalendarGrid` creates `const today = new Date()` on every render). If the server renders at 11:59 PM and the client hydrates at 12:01 AM, the "today" cell will differ between server and client HTML, causing a React hydration mismatch warning.

2. **`Intl.DateTimeFormat` locale differences** — Server and client may resolve the default locale differently if no explicit `locale` prop is provided. The server might use `en-US` while the client uses `en-GB`, producing different month names or weekday headers.

3. **`window` / `document` references** — While the current code doesn't access browser globals, future features (touch detection in issue 0034, popover positioning in issue 0038, `prefers-reduced-motion` in issue 0022) will need browser APIs. A pattern must be established now.

Without addressing these, the widget will produce hydration warnings in every SSR framework, undermining trust and making adoption risky for the majority of modern React projects.

## Requirements

### Stable "today" reference

Instead of calling `new Date()` during render, compute "today" once per component mount and keep it stable:

```ts
interface CalendarWidgetProps {
  /** Override the date considered as "today" (default: new Date() at mount time).
   *  Useful for testing and SSR consistency. */
  today?: Date;
}
```

- When `today` is provided, use it directly. This enables deterministic rendering for both SSR and tests.
- When not provided, initialize from `new Date()` inside a `useEffect` (client-only) or `useState` with a stable initial value.
- During SSR (no `useEffect`), the "today" marker should be suppressed (no `cw-day-cell--today` class, no `aria-current="date"`) to avoid mismatches. On hydration, the effect runs and "today" is applied client-side. This is an acceptable tradeoff — the today highlight appearing after hydration is imperceptible to users.

### Locale consistency

- When no `locale` prop is provided, default to `undefined` (let `Intl.DateTimeFormat` use the runtime's default) but document that SSR users should always pass an explicit `locale` to ensure server/client consistency.
- Add a development-mode warning when running in SSR context without an explicit `locale`:

```
[CalendarWidget] No locale prop provided during server render. This may cause hydration mismatches if the server and client locales differ. Pass an explicit locale prop for SSR safety.
```

### Browser API guard pattern

Establish a utility for safely accessing browser APIs:

```ts
// src/utils/env.ts
export const isBrowser = typeof window !== 'undefined';
export const canUseDOM = isBrowser && typeof document !== 'undefined';
```

All future browser API access (touch detection, media queries, popover positioning) must use these guards. Include `env.ts` in the initial implementation as the established pattern.

### `useIsomorphicLayoutEffect`

Provide a utility hook that uses `useLayoutEffect` on the client and `useEffect` on the server (to avoid the "useLayoutEffect does nothing on the server" React warning):

```ts
// src/hooks/useIsomorphicLayoutEffect.ts
import { useEffect, useLayoutEffect } from 'react';
import { isBrowser } from '../utils/env';

export const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;
```

### No `window` / `document` in module scope

Ensure no source file accesses `window`, `document`, or other browser globals at the module level (outside of hooks or event handlers). This causes crashes when the module is imported on the server.

### React Server Components compatibility

Mark the package entry point with `"use client"` directive if the consumer is using React Server Components (RSC). Since the widget uses hooks (`useState`, `useCallback`, etc.), it cannot be a Server Component.

Add `"use client";` as the first line of `src/index.ts` (the entry point). This is a no-op in non-RSC environments and enables seamless use in Next.js App Router.

## Verification

- **Next.js integration test**: render `<CalendarWidget locale="en-US" />` in a Next.js page with SSR → no hydration mismatch warnings in the console.
- **Today prop**: `<CalendarWidget today={new Date(2026, 2, 15)} />` → March 15 is always marked as today regardless of actual date.
- **No today without prop in SSR**: Server-render without `today` prop → no `cw-day-cell--today` class in HTML. After hydration → today class appears on the correct cell.
- **Locale warning**: Server-render without `locale` → development console warning about SSR locale.
- **Module import safety**: `import { CalendarWidget } from '@calendar-widget/core'` in a Node.js script → no crash.
- **RSC compatibility**: import in a Next.js App Router RSC page → `"use client"` boundary works, no errors.
- **No browser globals**: `grep -r "window\." src/ --include="*.ts" --include="*.tsx"` → no matches outside of `isBrowser` guards or hook bodies.
- Unit tests cover: `today` prop overrides today detection, default today detection on client, isBrowser/canUseDOM utilities, useIsomorphicLayoutEffect selection, locale warning in development mode.
