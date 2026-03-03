---
tag: architecture
state: open
---

# 0009 — README & Documentation

## Problem

The repository has no README, no usage documentation, and no contributing guide. Without documentation, consumers cannot adopt the widget and contributors cannot onboard. This is a blocker for any kind of release.

## Requirements

### README.md

Create a `README.md` at the project root covering:

1. **Title & badges** — Package name, CI status badge, npm version badge, license badge.

2. **Features** — Bullet list of key capabilities:
   - Date selection (single date)
   - Min/max date constraints
   - Disabled dates
   - Configurable week start day
   - Locale-aware formatting via `Intl.DateTimeFormat`
   - Full keyboard navigation (WAI-ARIA Date Picker pattern)
   - Themeable via CSS custom properties
   - Zero runtime dependencies (React is a peer dep)

3. **Installation**:
   ```bash
   npm install calendar-widget
   ```

4. **Quick start** — Minimal working example:
   ```tsx
   import { CalendarWidget } from 'calendar-widget';
   import 'calendar-widget/dist/style.css';

   function App() {
     const [date, setDate] = useState<Date | null>(null);
     return <CalendarWidget value={date} onChange={setDate} />;
   }
   ```

5. **Props table** — Document every prop from `CalendarWidgetProps` (see issue 0005) with name, type, default, and description.

6. **Theming** — List all `--cw-*` CSS custom properties (from issue 0007) with their defaults and a short example of overriding them.

7. **Accessibility** — Brief statement of WCAG 2.1 AA compliance and a link to the keyboard shortcuts.

8. **Development** — How to clone, install, run dev server, run tests, build.

9. **License** — MIT.

### CONTRIBUTING.md (optional but recommended)

Short guide covering:
- Development setup
- Coding conventions (enforced by ESLint/Prettier)
- Testing expectations (every component/utility must have tests)
- Commit message format (Conventional Commits recommended: `feat:`, `fix:`, `chore:`, etc.)
- PR process

## Verification

- `README.md` exists at the project root and renders correctly on GitHub
- All code examples in the README are syntactically valid
- The props table matches the actual `CalendarWidgetProps` type
- The theming section lists every CSS custom property defined in the widget's CSS
- Links (if any) are not broken

## Architect Notes

A README now exists with good coverage of features, installation, quick start, props, theming, keyboard navigation, and license. Remaining gaps:

1. **Missing badges** -- No CI status badge, npm version badge, or license badge in the header.
2. **Missing Development section** -- No instructions on how to clone, install, run dev server, run tests, or build.
3. **Peer dependency inaccuracy** -- README states "Peer dependencies: React 19+ and ReactDOM 19+" but `package.json` declares `"react": "^18.0.0 || ^19.0.0"`. The README is more restrictive than the actual peer deps.
4. **Quick start missing import** -- The code example does not include `import { useState } from 'react'`, making it not copy-pasteable as-is.
5. **No CONTRIBUTING.md** (recommended but optional per original spec).
