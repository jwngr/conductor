# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Conductor is a modern RSS feed reader and read-it-later service built as a full-stack TypeScript application. It combines React frontend with Firebase backend and includes both a Progressive Web App and browser extension.

## Common Commands

### Development

```bash
# Start full development environment (run these in parallel)
yarn dev:pwa        # React PWA frontend (http://localhost:5173)
yarn dev:functions  # Firebase emulators (admin UI at http://localhost:4000)
yarn dev:rss        # RSS server (http://localhost:6556)

# Build
yarn build                # Build all packages
yarn build:pwa            # Build specific package
yarn build:functions      # Build Firebase functions
```

### Validation & Testing

```bash
# Validation (linting, types, formatting)
yarn validate             # Full validation across all packages
yarn validate:lint        # ESLint only
yarn validate:lint:fix    # Auto-fix linting + format
yarn validate:types       # TypeScript type checking
yarn validate:knip        # Unused code detection
yarn format               # Format code

# Testing
yarn test                 # Run all tests
yarn test:shared          # Test specific package
yarn test:shared:watch    # Watch mode
yarn test:coverage        # Coverage reports
```

### Individual Package Commands

```bash
yarn validate:pwa         # Validate specific package
yarn clean:shared         # Clean specific package
```

## Architecture

### Monorepo Structure (Yarn Workspaces)

- **`@conductor/shared`** - Core types, schemas, utilities shared everywhere
- **`@conductor/shared-client`** - React hooks, Zustand stores, client Firebase
- **`@conductor/shared-server`** - Server services, AI integration, RSS parsing
- **`@conductor/pwa`** - Progressive Web App (React 19 + TanStack Router)
- **`@conductor/extension`** - Chromium browser extension
- **`@conductor/functions`** - Firebase Cloud Functions
- **`@conductor/rss-server`** - Standalone RSS processing server (Hono)
- **`@conductor/scripts`** - Build scripts and utilities

### Dependency Layers

```
shared → shared-client → pwa/extension
shared → shared-server → functions/scripts
```

### Key Technologies

- **Frontend**: React 19, TypeScript, Vanilla Extract CSS + Tailwind v4, Radix UI
- **Backend**: Firebase (Firestore, Functions, Auth, Storage)
- **State**: Zustand stores in shared-client
- **Validation**: Zod schemas throughout
- **Build**: Vite (clients), esbuild (functions)
- **AI**: Google AI/Genkit for content processing

## Development Guidelines

### Code Style (enforced by ESLint/Prettier)

- Strict TypeScript with shared type definitions
- Functional components using `React.FC`
- Absolute imports via `@` prefixes (no relative imports)
- Named exports only (no default exports)
- Split regular and type imports on separate lines
- Results pattern instead of throw/try-catch (see `@conductor/shared/lib/results.shared.ts`)
- Use `assertNever` in switch statements for exhaustive checking

### Package Boundaries (enforced by ESLint)

- shared-client cannot import shared-server
- Client packages cannot import server Firebase libraries
- Packages should remain isolated except for shared dependencies

### Testing

- Jest with TypeScript support
- Base config in `/jest.base.config.mjs`
- Coverage reporting enabled
- Pattern: `**/*.test.ts` and `**/*.test.tsx`
- Some packages still need test implementation

### When making changes:

1. Use appropriate validation commands to check your work
2. Follow existing patterns in the target package
3. Respect the layered architecture - changes to shared packages affect all dependents
4. Use the results pattern for error handling instead of exceptions
