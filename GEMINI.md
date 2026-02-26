# GEMINI.md

This file defines how AI coding agents should work in this repository.

## Workflow Orchestration

### 1. Plan Node Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately – don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One tack per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `docs/tasks-docs/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes – don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests – then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `docs/tasks-docs/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `docs/tasks-docs/todo.md`
6. **Capture Lessons**: Update `docs/tasks-docs/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

## 1. Project Overview

React/TypeScript web application for tracking utility meter readings (komunalka = utilities in Ukrainian).

Features: manage addresses, track meters (electricity, gas, hot/cold water, heating), record readings, view usage statistics and analytics.

Data model hierarchy:
- **User** -> has multiple **Addresses**
- **Address** -> has multiple **Meters**
- **Meter** -> has historical **Readings**

API documentation: `Komunalka.API.http` is the **authoritative source of truth** for all API interactions (endpoints, request/response formats, auth, validation). Always verify against this file before implementing API calls.

## 2. Repository Map and Tech Stack

### Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React | 19.1.1 |
| Language | TypeScript | 5.9.3 |
| Build | Vite | 7.1.7 |
| Styling | Tailwind CSS | 4.1.14 |
| Styling utils | tailwind-variants | 3.2.2 |
| Forms | react-hook-form | 7.53.1 |
| HTTP | Axios | 1.13.2 |
| Charts | Recharts | 3.3.0 |
| Icons | Lucide React | latest |
| Routing | React Router | 7.x |
| Unit tests | Vitest | 4.0.18 |
| E2E tests | Playwright | 1.56.1 |
| Linting | ESLint | 9.36.0 |
| Package manager | pnpm | - |

### Directory Structure

```
src/
  modules/          # Feature modules by domain
    addresses/      # Address management
    auth/           # Authentication
    dashboard/      # Overview dashboard
    meters/         # Meter management
    profile/        # User profile
    providers/      # Service providers
    readings/       # Meter readings
    settings/       # App settings
  shared/           # Cross-module shared code
    components/     # Reusable UI components (layouts, nav)
    ui/             # Design system primitives (buttons, inputs, cards)
    hooks/          # Shared custom hooks
    utils/          # Common utilities
    types/          # Shared TypeScript types
    constants/      # App-wide constants
tests/
  auth.setup.ts     # Auth setup for E2E
  e2e/              # E2E test specs by feature
  pages/            # Page Object Model classes
  fixtures/         # Test data
  helpers/          # API mocks and utilities
```

Each module follows the structure: `api/`, `components/`, `hooks/`, `pages/`, `types/`.

### Path Aliases

| Alias | Maps to |
|-------|---------|
| `@/*` | `src/*` |
| `@shared/*` | `src/shared/*` |
| `@modules/*` | `src/modules/*` |
| `@types/*` | `src/shared/types/*` |

### Key Files

- `src/App.tsx` — React Router configuration and route definitions
- `src/main.tsx` — Entry point with React 19 createRoot
- `Komunalka.API.http` — API documentation (2600+ lines)
- `vite.config.ts` — Vite + Tailwind CSS plugin config
- `vitest.config.ts` — Unit test configuration
- `playwright.config.ts` — E2E test configuration

## 3. Setup and Environment

Prerequisites: Node.js, pnpm.

```bash
pnpm install
```

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080` |
| `VITE_API_VERSION` | API version prefix | `v1` |
| `VITE_API_TIMEOUT` | Request timeout (ms) | `10000` |
| `VITE_ENV` | Environment name | `development` |
| `TEST_USER_EMAIL` | E2E test user email | - |
| `TEST_USER_PASSWORD` | E2E test user password | - |

## 4. Build, Run and Tasks

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start dev server with HMR |
| `pnpm run build` | TypeScript compilation + Vite production build |
| `pnpm run lint` | ESLint check |
| `pnpm run preview` | Preview production build |
| `pnpm test` | Run Vitest in watch mode |
| `pnpm run test:run` | Run Vitest once |
| `pnpm run test:coverage` | Vitest with V8 coverage |
| `pnpm run test:e2e` | Run Playwright E2E tests |
| `pnpm run test:e2e:ui` | Playwright with UI mode |
| `pnpm run test:e2e:debug` | Playwright in debug mode |
| `pnpm run test:e2e:report` | Show Playwright HTML report |

After making changes, ensure `pnpm run lint` and `pnpm run test:run` pass before considering work complete.

## 5. Code Style, Linting and Formatting

### ESLint

- No semicolons: `semi: ['error', 'never']`
- TypeScript strict recommended rules
- React Hooks + React Refresh plugins
- Run: `pnpm run lint`

### TypeScript

- `strict: true`
- `noUnusedLocals: true`, `noUnusedParameters: true`
- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- `erasableSyntaxOnly: true`
- Target: ES2022, JSX: react-jsx

### Naming Conventions

- Components: `PascalCase` (files and exports)
- Props interfaces: `<ComponentName>Props`
- Hooks: `use<Name>` in files named `use<Name>.ts(x)`
- Types/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

### Import Order

1. React imports
2. Third-party libraries
3. `@shared/*` imports
4. Relative imports
5. Type imports separated with `import type`

## 6. Domain and Business Constraints

### API Documentation

`Komunalka.API.http` is the authoritative source (2600+ lines). Rules:
1. Before implementing any API call — read the corresponding section in `Komunalka.API.http`
2. TypeScript types MUST match the response/request structures documented in the file
3. Do NOT assume API behavior — verify against the documentation
4. When in doubt — the `.http` file is always correct, not the code

### Authentication

- JWT access + refresh tokens
- OAuth providers: Google, GitHub
- Token refresh handled automatically

### Feature Scope

1. Address management (CRUD)
2. Meter management per address (CRUD)
3. Reading input with automatic consumption calculation
4. Historical data visualization (charts/graphs)
5. Statistics: consumption comparisons, averages, forecasting
6. Multi-address overview dashboard
7. Mobile-responsive design

## 7. Security and Privacy

- Never commit `.env` files; use `.env.example` for documentation
- JWT tokens: secure storage, automatic refresh
- Test credentials (`test+2@example.com`) are for E2E testing only
- No PII in logs or console output
- Do not hardcode secrets or tokens; use environment variables

## 8. Git and PR Workflow

- **Never** create commits or push without explicit user command
- **Never** mention AI assistance in commits or PRs (no "Generated with...", "Co-Authored-By: AI", etc.)
- Write commit messages as if written by a human developer
- Focus on what was changed and why
- Main branch: `develop`

## 9. Non-Goals and Do Not Touch

- Do NOT modify `Komunalka.API.http`
- Do NOT add global state management libraries (Redux, Zustand, etc.)
- Do NOT convert to Next.js, Remix, or any SSR framework
- Do NOT change package manager from pnpm
- Do NOT add CSS-in-JS libraries (styled-components, emotion, etc.)
- Do NOT introduce new external dependencies without explicit instruction
