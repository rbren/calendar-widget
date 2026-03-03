---
tag: architecture
state: closed
---

# 0004 — Testing Infrastructure

## Problem

There is no test runner, no test utilities, and no tests. A calendar widget has complex date logic and UI interactions that demand thorough automated testing from day one.

## Requirements

### Vitest + React Testing Library

Vitest integrates naturally with the Vite build (issue 0003) and provides a fast, Jest-compatible API.

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Create `vitest.config.ts` (or merge into `vite.config.ts`):

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/**/*.d.ts', 'src/index.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

### npm scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Test file conventions

- Test files live next to the module they test: `Foo.tsx` → `Foo.test.tsx`
- Utility tests: `utils/dates.ts` → `utils/dates.test.ts`
- Use `describe` / `it` blocks with clear, behavior-oriented names
- Prefer `@testing-library/user-event` over `fireEvent` for user interactions

### Minimum initial tests

Once the first component or utility exists, there must be at least one passing test that exercises it. An empty test suite should still pass:

```ts
// src/utils/placeholder.test.ts
describe('placeholder', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
```

## Verification

- `npm test` exits 0
- `npm run test:coverage` exits 0 and prints a coverage summary
- Coverage thresholds are enforced (deliberately lower coverage → build fails)
- Adding a failing test (`expect(1).toBe(2)`) causes `npm test` to exit non-zero
