# Repository Guidelines

## Project Structure & Module Organization

This project uses a **module-based architecture** where code is organized by feature/domain:

### Module Organization Logic

**`src/modules/`** - Feature-based modules
- Each module is a self-contained feature (e.g., `auth`, `addresses`, `meters`, `readings`)
- Module structure includes: `components/`, `pages/`, `hooks/`, `types/`, `api/`, `utils/`
- Keep module dependencies minimal; prefer importing from `shared/` over cross-module imports
- New features should create a new module directory with relevant subdirectories as needed

**`src/shared/`** - Shared code across modules
- `components/` - Reusable UI components (layouts, navigation)
- `ui/` - Design system primitives (buttons, inputs, cards)
- `hooks/`, `utils/`, `types/`, `constants/` - Shared logic and definitions
- Add code here when it's used by 2+ modules or is a fundamental UI primitive

**Routing & Entry Points**
- `src/App.tsx` defines all React Router v7 routes; update this file when adding new pages
- `src/main.tsx` wires React 19 and global providers; use it for app-level configuration only
- Routes are defined declaratively in `App.tsx`, not file-based

**Configuration & Assets**
- Static media belong in `src/assets`; public assets (favicons, manifest) stay in `public/`
- Build and lint settings live in `vite.config.ts`, `tsconfig*.json`, and `eslint.config.js`

## Build, Test & Development Commands
```bash
pnpm install          # bootstrap dependencies
pnpm run dev          # start Vite dev server with fast refresh
pnpm run build        # type-check (tsc -b) and emit production bundle
pnpm run preview      # serve the build locally
pnpm run lint         # run ESLint across TS/TSX sources
```
Run commands from the repository root; prefer Node 20.19+ or 22.12+ to match Vite's expectations.
This project uses **pnpm** as the package manager.

## Coding Style & Naming Conventions
- TypeScript is mandatory; new files should be `.ts`/`.tsx` with explicit types at module boundaries.
- Indent with two spaces; keep JSX props on new lines when they wrap.
- Components and hooks use PascalCase (`GuestLayout`) and camelCase (`useAuthRedirect`).
- **Use `tailwind-variants` for creating reusable UI components** in `src/shared/ui`. This library helps manage complex component styles with a clear, variant-based API.
- Rely on ESLint's recommended + TypeScript rules; fix issues with `pnpm run lint -- --fix` before submitting.
- Core content blocks on authenticated pages (cards containing main forms or dashboards) must use `shadow-lg` with a light border to match the addresses/meters/providers screens. Nested cards/lists inside those blocks should step down to `shadow-md`.
- Primary CTA buttons on these blocks reuse the shared `Button` component with `tone="primary"` (yellow background, dark text). Keep spacing consistent with the Addresses page (`size="md"`, `min-w` on desktop, full width on mobile). Reuse the shared button props instead of custom class lists.
- **NEVER use hardcoded HEX colors** (e.g., `bg-[#FFE082]`, `text-[#333333]`). Always use colors from the Tailwind theme (e.g., `bg-primary`, `text-neutral-600`). This ensures consistency and maintainability. Hardcoded colors break the design system.

## Testing Expectations
- A formal test runner is not configured yet; when contributing logic-heavy features, add Vitest + React Testing Library alongside your change and expose it via a new `pnpm run test` script.
- Place specs beside the code (`Component.test.tsx`) or under `src/__tests__`. Cover edge cases around routing guards and form validation at minimum.
- Document any new mocks or fixtures in the PR so future agents can reuse them.

## Commit & Pull Request Guidelines
- Follow the existing imperative style (`Add registration page…`). Bundle related changes per commit and keep messages under 72 characters.
- Open PRs with: a concise summary, screenshots or GIFs for UI updates, linked issues, and a checklist of commands you ran (dev, build, lint, tests).
- Flag breaking changes or migrations in the PR title (`[breaking]` prefix) and include rollback instructions when applicable.
