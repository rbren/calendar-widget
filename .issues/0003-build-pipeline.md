---
tag: architecture
state: closed
---

# 0003 — Build Pipeline

## Problem

A library component needs to produce distributable artifacts (ESM, CJS, type declarations) so consumers can install and import it. There is currently no build tooling.

## Requirements

### Bundler — Vite (library mode)

Vite's library mode is lightweight and produces clean ESM + CJS output with no runtime overhead.

```bash
npm install --save-dev vite @vitejs/plugin-react
```

Create `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CalendarWidget',
      formats: ['es', 'cjs'],
      fileName: (format) => `calendar-widget.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
```

### package.json entry points

```json
{
  "main": "dist/calendar-widget.cjs",
  "module": "dist/calendar-widget.mjs",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/calendar-widget.mjs",
      "require": "./dist/calendar-widget.cjs",
      "types": "./dist/types/index.d.ts"
    }
  },
  "files": ["dist"],
  "sideEffects": false
}
```

### npm scripts

```json
{
  "scripts": {
    "build": "vite build && tsc --emitDeclarationOnly --declarationDir dist/types",
    "prebuild": "rm -rf dist"
  }
}
```

## Verification

- `npm run build` exits 0
- `dist/calendar-widget.mjs` exists and is valid ESM
- `dist/calendar-widget.cjs` exists and is valid CJS
- `dist/types/index.d.ts` exists
- `react` and `react-dom` are **not** bundled into the output (check with `grep 'createElement' dist/calendar-widget.mjs` — should not appear)
