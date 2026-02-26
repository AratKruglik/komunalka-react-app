---
alwaysApply: true
description: Claude Code agent dispatch system, MCP tools, and skills
---

## Agent Dispatch System

Dispatch tasks to specialized agents using the Task tool based on task type:

| Task Type | Agent | Trigger Keywords |
|-----------|-------|-----------------|
| Frontend (components, pages, hooks, styling) | `fe-e` | component, page, UI, form, hook, Tailwind / компонент, сторінка, форма, верстка, хук |
| Testing (E2E, bugs, verification) | `qa-engineer` | test, E2E, Playwright, bug, verify / тест, баг, перевірка, не працює |
| TypeScript (types, interfaces, contracts) | `type-guardian` | types, interface, DTO, type error / типи, інтерфейс, помилка типів |
| Architecture (modules, structure, review) | `architecture-guardian` | architecture, module, refactor / архітектура, модуль, рефакторинг |

**Agent responsibilities:**

| Agent | Primary Tasks | Skills | MCP Tools |
|-------|--------------|--------|-----------|
| `fe-e` | Components, pages, hooks, styling, forms | react-expert, typescript-pro | Context7 |
| `qa-engineer` | E2E tests, bug reproduction, test coverage | playwright-expert, test-master, debugging-wizard | Playwright MCP |
| `type-guardian` | Type definitions, API contracts, type guards | typescript-pro | Context7 |
| `architecture-guardian` | Module design, dependencies, code review | architecture-designer, code-reviewer | - |

**Sequential workflows:**
1. New feature: `architecture-guardian` -> `fe-e` -> `type-guardian` -> `qa-engineer`
2. Bug fix: `qa-engineer` (reproduce) -> `fe-e` (fix) -> `qa-engineer` (verify)
3. Before PR: `architecture-guardian` (review) -> `qa-engineer` (regression)

## MCP Tools

**Context7** — fetch up-to-date library documentation before implementing:
1. `resolve-library-id` to find the library
2. `query-docs` to get current docs and examples

| Library | When to Check |
|---------|---------------|
| React | Component patterns, hooks, React 19 features |
| React Router | Routing, loaders, actions |
| Tailwind CSS | Utility classes, configuration |
| tailwind-variants | `tv()` API, variants |
| Playwright | Test patterns, locators, assertions |
| Vite | Build configuration, plugins |

**Playwright MCP** — use `browser_*` tools for E2E automation: navigate, click, type, snapshot, screenshot. Use `browser_snapshot` for accessibility tree, `browser_console_messages` for debugging.

**GitHub MCP** — always prefer `mcp__github-mw__*` tools over `gh` CLI for PRs, issues, repo content, code search.

## Skills System

| Skill | Description | Used By |
|-------|-------------|---------|
| `react-expert` | React 19, hooks, performance | fe-e |
| `typescript-pro` | Advanced types, generics, type guards | fe-e, type-guardian |
| `playwright-expert` | E2E testing, Page Objects, selectors | qa-engineer |
| `test-master` | Testing strategy, TDD, coverage | qa-engineer |
| `debugging-wizard` | Bug investigation, root cause analysis | qa-engineer |
| `architecture-designer` | System design, ADRs, patterns | architecture-guardian |
| `code-reviewer` | Code review practices, feedback | architecture-guardian |

Load skills from `.claude/skills/[skill-name]/SKILL.md`.
