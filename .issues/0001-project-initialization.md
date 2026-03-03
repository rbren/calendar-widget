---
tag: architecture
state: closed
---

# 0001 — Project Initialization

## Problem

The repository is completely empty (no commits, no files). A React calendar widget project needs a proper foundation before any feature work can begin.

## Requirements

Initialize the project with a modern React/TypeScript toolchain:

1. **Package manager & manifest** — Run `npm init -y` and edit `package.json`:
   - `name`: `@calendar-widget/core` (or `calendar-widget`)
   - `version`: `0.1.0`
   - `license`: `MIT`
   - `type`: `module`
   - `main`, `module`, and `types` entry points (see issue 0003 for build output)

2. **TypeScript** — Install and configure:
   ```bash
   npm install --save-dev typescript
   ```
   Create `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "jsx": "react-jsx",
       "declaration": true,
       "declarationDir": "dist/types",
       "outDir": "dist",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true,
       "isolatedModules": true
     },
     "include": ["src"],
     "exclude": ["node_modules", "dist", "**/*.test.*", "**/*.spec.*"]
   }
   ```

3. **React peer dependency** — React should be a **peer** dependency, not a direct dependency, since consumers provide their own React:
   ```bash
   npm install --save-peer react react-dom
   npm install --save-dev react react-dom @types/react @types/react-dom
   ```

4. **Directory structure** — Create:
   ```
   src/
     index.ts          # public API barrel export
     components/       # React components
     hooks/            # custom hooks
     utils/            # pure helper functions (date math, etc.)
     types/            # shared TypeScript types/interfaces
   ```

5. **`.gitignore`** — At minimum:
   ```
   node_modules/
   dist/
   coverage/
   .env
   *.tsbuildinfo
   ```

6. **Initial commit** — Stage everything and commit:
   ```bash
   git add -A && git commit -m "chore: initialize project"
   ```

## Verification

- `npm install` succeeds with no errors
- `npx tsc --noEmit` exits 0 (even if `src/index.ts` is just `export {};`)
- `git log --oneline` shows the initial commit
- `node_modules/`, `dist/`, and `coverage/` are absent from the repo
