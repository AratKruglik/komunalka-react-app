# Repository Guidelines

## Project Structure & Module Organization
- `src/main.tsx` wires React 19, the TanStack router, and global providers; use it for app-level configuration only.
- `src/routes` follows file-based routing (`auth/login.tsx`, `addresses.tsx`). Co-locate loaders/actions beside the screen component and keep cross-route helpers in `src/components`.
- `src/components` contains reusable UI grouped by domain (`auth`, `layout`, `common`); new shared widgets should land here with matching Storybook notes if you add stories later.
- Static media belong in `src/assets`; anything that must be served verbatim (favicons, manifest) stays in `public/`.
- Build and lint settings live in `vite.config.ts`, `tsconfig*.json`, and `eslint.config.js`; the generated router map `src/routeTree.gen.ts` is tracked—regenerate it only via the TanStack router plugin.

## Build, Test & Development Commands
```bash
npm install           # bootstrap dependencies
npm run dev           # start Vite dev server with fast refresh
npm run build         # type-check (tsc -b) and emit production bundle
npm run preview       # serve the build locally
npm run lint          # run ESLint across TS/TSX sources
```
Run commands from the repository root; prefer Node 18+ to match Vite’s expectations.

## Coding Style & Naming Conventions
- TypeScript is mandatory; new files should be `.ts`/`.tsx` with explicit types at module boundaries.
- Indent with two spaces; keep JSX props on new lines when they wrap.
- Components and hooks use PascalCase (`GuestLayout`) and camelCase (`useAuthRedirect`). Match Tailwind utility strings to the design tokens defined in `src/index.css`.
- Rely on ESLint’s recommended + TypeScript rules; fix issues with `npm run lint -- --fix` before submitting.

## Testing Expectations
- A formal test runner is not configured yet; when contributing logic-heavy features, add Vitest + React Testing Library alongside your change and expose it via a new `npm run test` script.
- Place specs beside the code (`Component.test.tsx`) or under `src/__tests__`. Cover edge cases around routing guards and form validation at minimum.
- Document any new mocks or fixtures in the PR so future agents can reuse them.

## Commit & Pull Request Guidelines
- Follow the existing imperative style (`Add registration page…`). Bundle related changes per commit and keep messages under 72 characters.
- Open PRs with: a concise summary, screenshots or GIFs for UI updates, linked issues, and a checklist of commands you ran (dev, build, lint, tests).
- Flag breaking changes or migrations in the PR title (`[breaking]` prefix) and include rollback instructions when applicable.
