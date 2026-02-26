---
paths: ["**/*.test.{ts,tsx}", "tests/**/*", "src/test-utils/**/*"]
description: Testing strategy and conventions for Vitest and Playwright
---

## Unit Tests (Vitest)

- Environment: jsdom, globals enabled
- Test files: co-located as `*.test.ts(x)` next to source
- Setup file: `src/test-utils/setup.ts`
- Coverage: V8 provider, reporters: text + html
- Path alias: `@test-utils` available in test files
- Libraries: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`

## E2E Tests (Playwright)

- Pattern: Page Object Model (`tests/pages/`)
- Auth: setup project (`tests/auth.setup.ts`) stores state in `playwright/.auth/user.json`
- Browsers: Chromium locally; Chromium + Firefox + WebKit in CI
- Test user: `test+2@example.com` / `@MystrongPassword123`
- Config: `fullyParallel: true`, retries 1 locally / 2 in CI
- Dev server auto-started via `webServer` config

**Do:**
- Write unit tests for hooks, utils, and component logic
- Use Page Object Model for E2E tests
- Use `data-testid` attributes for E2E selectors

**Don't:**
- Don't mock what you can test directly
- Don't write E2E tests for unit-testable logic
- Don't hardcode waits; use Playwright auto-waiting
