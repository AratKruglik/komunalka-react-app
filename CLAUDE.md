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
npm run dev

# Build for production (TypeScript compilation + Vite build)
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Tech Stack

- **Frontend Framework:** React 19.1.1 with TypeScript
- **Build Tool:** Vite 7.1.7
- **Language:** TypeScript 5.9.3
- **Linting:** ESLint 9.36.0 with TypeScript and React plugins

## Project Structure

- `src/App.tsx` - Main application component
- `src/main.tsx` - Application entry point with React 19 createRoot
- `vite.config.ts` - Vite configuration with React plugin
- `tsconfig.json` - TypeScript configuration (references app and node configs)
- `tsconfig.app.json` - Application TypeScript settings
- `tsconfig.node.json` - Node/build TypeScript settings

## Key Architecture Notes

- Uses Vite's Fast Refresh for React development
- TypeScript strict mode enabled
- React 19 with latest features (no legacy ReactDOM.render)
- ESLint configured for React hooks and React Refresh

## Feature Requirements

The application should implement:
1. Address management (CRUD operations)
2. Meter management per address (CRUD operations)
3. Reading input with automatic consumption calculation
4. Historical data visualization (charts/graphs)
5. Statistics: consumption comparisons, averages, forecasting
6. Multi-address overview dashboard
7. Mobile-responsive design