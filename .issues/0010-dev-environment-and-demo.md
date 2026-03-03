---
tag: architecture
state: closed
---

# 0010 — Development Environment & Demo Page

## Problem

Developers working on the widget need a way to see their changes in real time. Without a live dev server and a demo page, every visual change requires a full build cycle or guessing from test output. This slows down iteration and makes it easy to ship visual regressions.

## Requirements

### Dev server with a demo page

Vite (already required by issue 0003) includes a dev server. Create a minimal HTML entry point and a demo app that renders the calendar widget with various configurations.

1. **`index.html`** at the project root (Vite's dev entry):

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <title>Calendar Widget — Dev</title>
   </head>
   <body>
     <div id="root"></div>
     <script type="module" src="/demo/main.tsx"></script>
   </body>
   </html>
   ```

2. **`demo/main.tsx`** — A small React app that mounts several `CalendarWidget` instances:
   - Default configuration
   - With `minDate` / `maxDate`
   - With `disabledDates`
   - With `weekStartsOn={1}` (Monday)
   - With custom theme (overridden CSS custom properties)
   - With a non-English locale (e.g., `locale="de-DE"`)

3. **`demo/App.tsx`** — The demo app component. Keep it simple; this is not a production app.

4. **npm script**:
   ```json
   {
     "scripts": {
       "dev": "vite"
     }
   }
   ```

### Exclusions

- `demo/` and `index.html` must **not** be included in the published npm package. Ensure the `files` field in `package.json` (issue 0003) only includes `dist`.
- `demo/` should be excluded from `tsconfig.json`'s `include` or handled by a separate `tsconfig.dev.json` that extends the base config.

### `.gitignore` update

Ensure `index.html` and `demo/` **are** committed (they are development tools, not build output).

## Verification

- `npm run dev` starts a local server (default `http://localhost:5173`)
- The demo page renders multiple calendar instances with different configurations
- Editing a component file triggers hot-module replacement (the page updates without a full reload)
- `npm run build` still produces only the library output (no demo code in `dist/`)
- `npm pack --dry-run` does not include `demo/` or `index.html`

## Architect Notes

Closed as of commit `a87c45d` (review at `2026-03-03T20:00Z`).

All requirements verified:
- `npm run dev` script exists in `package.json`.
- `demo/App.tsx` renders multiple CalendarWidget instances: default, controlled, min/max, disabled dates, weekStartsOn=1, custom theme, and German locale.
- `demo/main.tsx` mounts the App with React.StrictMode.
- `index.html` at project root serves as Vite's dev entry point.
- `npm pack --dry-run` output contains only `dist/`, `LICENSE`, `README.md`, and `package.json` — no `demo/` or `index.html`.
- `tsconfig.json` `include` is scoped to `src` so demo code doesn't affect type checking or build output.
