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
```

**Note:** This project uses `pnpm` as the package manager.

## Tech Stack

- **Frontend Framework:** React 19.1.1 with TypeScript
- **Routing:** React Router v7
- **Build Tool:** Vite 7.1.7
- **Language:** TypeScript 5.9.3
- **Styling:** Tailwind CSS
- **Component Variants:** tailwind-variants
- **Package Manager:** pnpm
- **Linting:** ESLint 9.36.0 with TypeScript and React plugins

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

**Key Files:**
- `src/App.tsx` - React Router configuration and route definitions
- `src/main.tsx` - Application entry point with React 19 createRoot
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration

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

## Development Workflow

**IMPORTANT: All frontend development tasks must be handled by the senior-frontend-engineer agent.**

When working on this project:
- **Always** use the `fe-e` agent for any frontend-related tasks
- This includes: component creation, styling, refactoring, bug fixes, feature implementation, layout changes, etc.
- The agent has deep expertise in React, TypeScript, and modern frontend practices
- Do not implement frontend changes directly - delegate all frontend work to the agent
- The agent will ensure consistency with the project's architecture and best practices

## Feature Requirements

The application should implement:
1. Address management (CRUD operations)
2. Meter management per address (CRUD operations)
3. Reading input with automatic consumption calculation
4. Historical data visualization (charts/graphs)
5. Statistics: consumption comparisons, averages, forecasting
6. Multi-address overview dashboard
7. Mobile-responsive design