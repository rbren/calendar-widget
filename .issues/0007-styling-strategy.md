---
tag: architecture
state: review
---

# 0007 — Styling Strategy

## Problem

A distributable component library needs a styling approach that doesn't conflict with consumer applications and supports theming. No styling solution has been chosen yet.

## Requirements

### Approach: CSS Modules

CSS Modules provide locally-scoped class names with zero runtime cost and no external dependencies. They work out of the box with Vite.

1. **File convention**: `ComponentName.module.css` next to each component.

2. **CSS custom properties for theming**: Define all visual tokens as CSS custom properties on a root class so consumers can override them:

   ```css
   /* CalendarWidget.module.css */
   .root {
     --cw-font-family: system-ui, sans-serif;
     --cw-font-size: 14px;
     --cw-color-primary: #2563eb;
     --cw-color-bg: #ffffff;
     --cw-color-text: #1f2937;
     --cw-color-text-muted: #9ca3af;
     --cw-color-hover: #eff6ff;
     --cw-color-selected: var(--cw-color-primary);
     --cw-color-selected-text: #ffffff;
     --cw-color-today-ring: var(--cw-color-primary);
     --cw-color-disabled: #e5e7eb;
     --cw-border-radius: 6px;
     --cw-cell-size: 36px;

     font-family: var(--cw-font-family);
     font-size: var(--cw-font-size);
     color: var(--cw-color-text);
     background: var(--cw-color-bg);
   }
   ```

3. **No global styles**: Components must not inject global CSS or modify elements outside their own tree.

4. **Bundle the CSS**: Vite library mode can emit a single CSS file. Add `cssCodeSplit: false` to `vite.config.ts` build options so consumers get one `style.css` to import:
   ```ts
   build: {
     cssCodeSplit: false,
     // ...
   }
   ```
   Document in README that consumers should:
   ```js
   import 'calendar-widget/dist/style.css';
   ```

5. **Responsive sizing**: Use relative units and allow `--cw-cell-size` override. The grid should not overflow on narrow containers.

## Verification

- `npm run build` produces `dist/style.css` alongside the JS bundles
- `dist/style.css` contains no global element selectors (e.g., no bare `button { }`)
- All class names in the output are hashed/scoped (CSS Modules)
- Overriding `--cw-color-primary` on a parent element changes the accent color
- The widget renders correctly at 280px container width
