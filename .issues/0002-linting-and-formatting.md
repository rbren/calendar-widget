---
tag: architecture
state: open
---

# 0002 — Linting & Formatting

## Problem

Without linting and formatting, code quality will degrade quickly as contributors join and the codebase grows. This must be set up before any feature code lands.

## Requirements

### ESLint

Install and configure ESLint with TypeScript + React support:

```bash
npm install --save-dev eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks
```

Create `eslint.config.js` (flat config format — ESLint v9+):

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // not needed with React 17+ JSX transform
    },
  },
  {
    ignores: ["dist/", "node_modules/", "coverage/"],
  }
);
```

### Prettier

```bash
npm install --save-dev prettier eslint-config-prettier
```

Create `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2
}
```

Add `eslint-config-prettier` to the ESLint config to disable conflicting rules.

### npm scripts

Add to `package.json`:
```json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,json}\""
  }
}
```

## Verification

- `npm run lint` exits 0 with no warnings on existing source files
- `npm run format:check` exits 0 (all files already formatted)
- Deliberately introduce a lint error (e.g., unused variable) → `npm run lint` reports it
- Deliberately break formatting → `npm run format:check` reports it
