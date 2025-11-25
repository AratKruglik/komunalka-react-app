# Project Overview

This is a web application for managing utility services, built with React, TypeScript, and Vite. The name "komunalka" suggests its purpose is to track and manage utility bills and readings.

The application features include:
- A dashboard to display an overview of utility data.
- Management of addresses, service providers, and meters.
- A system for inputting and tracking utility readings.
- User authentication with login and registration.

The project is structured in a modular way, with distinct directories for each feature (addresses, auth, dashboard, meters, providers, readings). It uses modern tools like Tailwind CSS and `tailwind-variants` for styling, `react-hook-form` for forms, `recharts` for data visualization, and `react-router` for navigation.

# Building and Running

## Development
To run the application in development mode:
```bash
pnpm dev
```

## Production Build
To build the application for production:
```bash
pnpm build
```

## Linting
To lint the codebase:
```bash
pnpm lint
```

## Testing
The project is set up with Playwright for end-to-end testing. To run the tests:
```bash
pnpm test
```
*Note: The `test` script is not explicitly in `package.json` but is a standard command for Playwright.*

# Development Conventions

- **Styling:** The project uses Tailwind CSS for styling. For reusable UI components in `src/shared/ui`, `tailwind-variants` is used to manage component states and styles. **Never use hardcoded HEX colors.** Always use theme-based utilities (e.g., `bg-primary`, `text-neutral-500`).
- **Components:** Components are organized by feature in the `src/modules` directory.
- **State Management:** While a global state management library is not explicitly listed, it's likely that component state is managed with React Hooks. For more complex state, a library like Zustand or Redux could be added.
- **Linting:** The project uses ESLint to enforce code quality. It's recommended to run the linter before committing changes.
