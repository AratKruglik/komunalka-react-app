# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React web application for tracking utility meter readings (komunalka = utilities in Ukrainian). The application allows users to:
- Manage multiple addresses
- Track multiple meters per address (electricity, gas, hot/cold water, heating)
- Record meter readings over time
- View usage statistics and analytics

### Data Model Hierarchy
- **User** → has multiple **Addresses**
- **Address** → has multiple **Meters**
- **Meter** → has historical **Readings**

## Development Commands

```bash
# Start development server with HMR
pnpm run dev

# Build for production (TypeScript compilation + Vite build)
pnpm run build

# Lint code
pnpm run lint

# Preview production build
pnpm run preview

# E2E tests
pnpm run test:e2e
pnpm run test:e2e:ui
pnpm run test:e2e:debug
```

**Note:** This project uses `pnpm` as the package manager.

## Tech Stack

- **Frontend Framework:** React 19.1.1 with TypeScript
- **Routing:** React Router v7
- **Build Tool:** Vite 7.1.7
- **Language:** TypeScript 5.9.3
- **Styling:** Tailwind CSS + tailwind-variants
- **E2E Testing:** Playwright
- **Package Manager:** pnpm
- **Linting:** ESLint 9.36.0 with TypeScript and React plugins

---

## ⚠️ API Documentation (Single Source of Truth)

**🔴 CRITICAL: The file `Komunalka.API.http` is the PRIMARY and AUTHORITATIVE source of truth for all API interactions.**

All pages, components, and services in this project MUST work with the API according to the documentation in `Komunalka.API.http`. This file contains:
- Complete endpoint specifications (URLs, methods, headers)
- Request body formats and required fields
- Response structures and status codes
- Authentication requirements (JWT tokens)
- Validation rules and error responses

**Rules:**
1. **Before implementing any API call** — read the corresponding section in `Komunalka.API.http`
2. **TypeScript types** MUST match the response/request structures documented in the file
3. **Do NOT assume** API behavior — verify against the documentation
4. **When in doubt** — the `.http` file is always correct, not the code

**File location:** `/Komunalka.API.http`

---

## 🤖 AUTOMATIC AGENT DISPATCH SYSTEM

**CRITICAL: This project uses specialized agents for all development tasks. You MUST dispatch the appropriate agent automatically based on the task type.**

### Agent Dispatch Rules

When receiving a task, analyze it and **immediately dispatch** to the correct agent using the Task tool. Do NOT implement code directly - always delegate to the specialized agent.

| Task Type | Agent | Trigger Keywords (EN / UA) |
|-----------|-------|----------------------------|
| **Frontend Development** | `fe-e` | component, page, UI, form, button, layout, styling, React, hook, state, props, Tailwind, responsive / **компонент, сторінка, форма, кнопка, верстка, стилі, хук, стан** |
| **E2E Testing** | `qa-engineer` | test, testing, E2E, Playwright, verify, QA, regression, bug reproduction, test coverage / **тест, тестування, перевірка, баг, помилка, не працює, зламалось, крайні випадки** |
| **TypeScript Types** | `type-guardian` | types, interface, DTO, API contract, type error, generics, type guard, validation / **типи, інтерфейс, контракт API, помилка типів, дженерики, валідація** |
| **Architecture Review** | `architecture-guardian` | architecture, module, refactor structure, code organization, dependencies, shared components / **архітектура, модуль, рефакторинг, структура коду, залежності, спільні компоненти** |

### Dispatch Decision Tree

```
User Request Received
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Does the request involve creating/modifying React components,   │
│ pages, hooks, styling, or any UI-related code?                  │
└─────────────────────────────────────────────────────────────────┘
         │ YES                              │ NO
         ▼                                  ▼
   ┌───────────┐              ┌─────────────────────────────────┐
   │  fe-e     │              │ Does it involve testing, E2E,   │
   │  agent    │              │ bug verification, or Playwright?│
   └───────────┘              └─────────────────────────────────┘
                                    │ YES              │ NO
                                    ▼                  ▼
                              ┌───────────┐   ┌─────────────────────┐
                              │qa-engineer│   │ Does it involve     │
                              │  agent    │   │ TypeScript types,   │
                              └───────────┘   │ interfaces, or API  │
                                              │ contracts?          │
                                              └─────────────────────┘
                                                   │ YES        │ NO
                                                   ▼            ▼
                                             ┌───────────┐  ┌─────────────────┐
                                             │   type-   │  │ Does it involve │
                                             │ guardian  │  │ architecture,   │
                                             └───────────┘  │ module design,  │
                                                            │ or code review? │
                                                            └─────────────────┘
                                                                 │ YES
                                                                 ▼
                                                           ┌─────────────┐
                                                           │architecture-│
                                                           │  guardian   │
                                                           └─────────────┘
```

### Agent Responsibilities Matrix

| Agent | Primary Tasks | Skills Used | MCP Tools |
|-------|--------------|-------------|-----------|
| **fe-e** | Components, pages, hooks, styling, forms | react-expert, typescript-pro | Context7 |
| **qa-engineer** | E2E tests, bug reproduction, test coverage | playwright-expert, test-master, debugging-wizard | Playwright MCP |
| **type-guardian** | Type definitions, API contracts, type guards | typescript-pro | Context7 |
| **architecture-guardian** | Module design, dependencies, code review | architecture-designer, code-reviewer | - |

### When to Use Multiple Agents (Sequential)

Some tasks require multiple agents in sequence:

1. **New Feature Development:**
   - `architecture-guardian` → Design module structure
   - `fe-e` → Implement the feature
   - `type-guardian` → Verify types match API
   - `qa-engineer` → Write E2E tests

2. **Bug Fix:**
   - `qa-engineer` → Reproduce and document the bug
   - `fe-e` → Fix the issue
   - `qa-engineer` → Verify fix and add regression test

3. **Before PR:**
   - `architecture-guardian` → Review code organization
   - `qa-engineer` → Run regression tests

### Example Dispatches

```
User: "Create a meter reading form"
→ Dispatch to: fe-e (frontend component creation)

User: "The login isn't working"
→ Dispatch to: qa-engineer (bug reproduction)

User: "Update the Address type to include postal code"
→ Dispatch to: type-guardian (type modification)

User: "Should we create a new module for notifications?"
→ Dispatch to: architecture-guardian (architecture decision)

User: "Add tests for the reading submission flow"
→ Dispatch to: qa-engineer (E2E test creation)

User: "Fix the TypeScript error in MeterCard"
→ Dispatch to: type-guardian (type error resolution)
```

---

## Project Structure

This project follows a **module-based architecture** that organizes code by feature/domain rather than by technical role.

### Directory Organization Logic

**`src/modules/`** - Feature modules (UI and business logic grouped by domain)
- Each module represents a distinct feature or business domain (e.g., `auth`, `addresses`, `meters`, `readings`)
- Module structure:
  - `components/` - Components specific to this module
  - `pages/` - Page components that represent routes
  - `hooks/` - Custom hooks used within this module
  - `types/` - TypeScript types specific to this module
  - `api/` - API calls related to this module
  - `utils/` - Utility functions specific to this module
- Modules should be self-contained and minimize dependencies on other modules
- Import from other modules sparingly; prefer importing from `shared/`

**`src/shared/`** - Shared code used across multiple modules
- `components/` - Reusable UI components (layouts, navigation)
- `ui/` - Design system primitives (buttons, inputs, cards)
- `hooks/` - Shared custom hooks
- `utils/` - Common utility functions
- `types/` - Shared TypeScript types
- `constants/` - Application-wide constants

**`tests/`** - E2E testing with Playwright
- `e2e/` - Test specs organized by feature
- `pages/` - Page Object Model classes
- `fixtures/` - Test data
- `helpers/` - API mocks and utilities

**Key Files:**
- `src/App.tsx` - React Router configuration and route definitions
- `src/main.tsx` - Application entry point with React 19 createRoot
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `playwright.config.ts` - Playwright E2E test configuration

### When to Create a New Module

Create a new module when:
- You're adding a new feature with its own pages and components
- The feature has distinct business logic separate from existing modules
- The feature will likely grow and benefit from isolation

### When to Add to Shared

Add to `shared/` when:
- The component/hook/utility is used by 2+ modules
- It's a fundamental UI primitive (button, input, modal)
- It's part of the layout or navigation system
- It contains application-wide logic or constants

## Key Architecture Notes

- Uses Vite's Fast Refresh for React development
- TypeScript strict mode enabled
- React 19 with latest features (no legacy ReactDOM.render)
- ESLint configured for React hooks and React Refresh

## Styling Guidelines

### Tailwind Variants (DRY Principle)

When Tailwind classes are reused across multiple elements (3+ occurrences), extract them using `tailwind-variants`:

```tsx
import { tv } from 'tailwind-variants'

// ✅ Good: Reusable styles with tv()
const socialButton = tv({
  base: [
    'flex items-center justify-center gap-3',
    'rounded-lg border border-neutral-200 bg-white',
    'px-4 py-2.5 text-sm font-medium',
    'transition-colors hover:bg-neutral-50',
  ],
})

// Usage
<button className={socialButton()}>Google</button>
<button className={socialButton()}>Facebook</button>

// ❌ Avoid: Duplicated long className strings
<button className="flex items-center justify-center gap-3 rounded-lg border...">Google</button>
<button className="flex items-center justify-center gap-3 rounded-lg border...">Facebook</button>
```

Benefits:
- **Maintainability**: Change styles in one place
- **Readability**: Array format allows grouping related classes
- **Extensibility**: Easy to add `variants` and `compoundVariants` later
- **Type Safety**: Use `VariantProps<typeof component>` for typed props

---

## 🔧 MCP Tools Usage

### Context7 MCP (Documentation)

**REQUIRED: Before implementing or planning any task, fetch up-to-date documentation.**

- Use `mcp__plugin_context7_context7__resolve-library-id` to find the library ID
- Use `mcp__plugin_context7_context7__query-docs` to get current documentation and examples
- Always check documentation for: React, React Router, Tailwind CSS, tailwind-variants, Vite, TypeScript, and any other libraries used
- This ensures you're using the latest APIs and best practices, not outdated patterns

**Libraries to check:**
| Library | When to Check |
|---------|---------------|
| React | Component patterns, hooks, React 19 features |
| React Router | Routing, loaders, actions |
| Tailwind CSS | Utility classes, configuration |
| tailwind-variants | tv() API, variants |
| Playwright | Test patterns, locators, assertions |
| Vite | Build configuration, plugins |

### Playwright MCP (E2E Testing)

**REQUIRED for qa-engineer agent:**

- Use `mcp__plugin_playwright_playwright__browser_*` tools for browser automation
- Available tools: navigate, click, type, snapshot, screenshot, etc.
- Use `browser_snapshot` for accessibility tree analysis
- Use `browser_console_messages` for debugging

### GitHub MCP

**REQUIRED: Always use GitHub MCP for all GitHub operations.**

- Use `mcp__github-mw__*` tools for: creating PRs, managing issues, reading repository content, searching code
- Do NOT use `gh` CLI commands — always prefer MCP tools
- Available operations: create/update PRs, list/search issues, get file contents, create branches, etc.

---

## 📚 Skills System

Agents have access to specialized skills in `.claude/skills/`:

| Skill | Description | Used By |
|-------|-------------|---------|
| `react-expert` | React 19, hooks, Server Components, performance | fe-e |
| `typescript-pro` | Advanced types, generics, type guards | fe-e, type-guardian |
| `playwright-expert` | E2E testing, Page Objects, selectors | qa-engineer |
| `test-master` | Testing strategy, TDD, coverage | qa-engineer |
| `debugging-wizard` | Bug investigation, root cause analysis | qa-engineer |
| `architecture-designer` | System design, ADRs, patterns | architecture-guardian |
| `code-reviewer` | Code review practices, feedback | architecture-guardian |

**Skill Loading:**
Agents should read relevant skill files from `.claude/skills/[skill-name]/SKILL.md` and reference files as needed.

---

## Git Commit & PR Guidelines

**⛔ CRITICAL: NEVER create commits or push without explicit user command.**

- NEVER run `git add`, `git commit`, `git push`, or create PRs automatically
- ONLY perform git operations when user explicitly says: "commit", "create commit", "push", "create PR"
- Even if work is complete and tests pass — WAIT for user's direct command
- This rule has NO exceptions

**CRITICAL: Never mention AI assistance in commits or PRs.**

- Do NOT include "Generated with Claude", "Co-Authored-By: Claude", "AI-assisted", or any similar references
- Do NOT mention any AI tools (Claude, Gemini, ChatGPT, Copilot, etc.) in commit messages or PR descriptions
- Write commit messages and PR descriptions as if written by a human developer
- Focus on what was changed and why, not how it was created

---

## Feature Requirements

The application should implement:
1. Address management (CRUD operations)
2. Meter management per address (CRUD operations)
3. Reading input with automatic consumption calculation
4. Historical data visualization (charts/graphs)
5. Statistics: consumption comparisons, averages, forecasting
6. Multi-address overview dashboard
7. Mobile-responsive design
