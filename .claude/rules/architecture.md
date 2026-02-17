---
paths: ["src/modules/**/*", "src/shared/**/*"]
description: Module-based architecture rules and component patterns
---

## Module-Based Architecture

Code is organized by feature domain, not technical role. Each module in `src/modules/` is self-contained.

**Module structure:**
```
modules/<name>/
  api/          # API service calls
  components/   # Module-specific components
  hooks/        # Module-specific hooks
  pages/        # Route page components
  types/        # Module-specific types
```

**When to create a new module:** new feature with own pages, distinct business logic, expected growth.

**When to add to shared:** used by 2+ modules, fundamental UI primitive, layout/navigation, app-wide logic.

## Component Patterns

- Functional components only, no class components
- Forms: react-hook-form with `onSubmit` validation mode
- API services: plain exported objects/functions, no class-based services
- Custom hooks: return `{ data, isLoading, error }` trio, use `useCallback`, expose `refetch`

**Do:**
- Keep modules self-contained
- Import shared code from `@shared/*`
- Use path aliases consistently

**Don't:**
- Don't import directly between modules (use shared instead)
- Don't use class components or class-based services
- Don't put page-specific logic in shared
