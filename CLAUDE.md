# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Turbopack dev server on http://localhost:3000
npm run build        # Production build (Turbopack)
npm run lint         # ESLint (Next.js + TypeScript config)
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier format all files
npm run test         # Jest unit tests (runs in band)
npm run test:watch   # Jest in watch mode
npm run test:visual  # Build + Playwright visual regression tests
```

Run a single Jest test file:

```bash
npm run test -- --testPathPattern="src/__tests__/apps/upbit"
```

Database (Drizzle + Neon PostgreSQL):

```bash
npx drizzle-kit generate   # Generate migrations from schema changes
npx drizzle-kit migrate    # Apply migrations
npx drizzle-kit studio     # Open Drizzle Studio
```

## Architecture

This is a **Next.js 15 App Router** monorepo-style playground with multiple self-contained mini-apps and games, all sharing a single Next.js instance.

### Route Structure

- `src/app/` — root layout, home page (project gallery)
- `src/app/apps/[app-name]/` — mini-apps: `excalidraw`, `netflix`, `notion`, `upbit`, `youtube`, `youtube-music`
- `src/app/games/[game-name]/` — browser games: `bejeweled`, `game-2048`, `slither`, `sudoku`, `tetris`
- `src/app/api/trpc/` — tRPC HTTP handler

### Key Directories

| Path              | Purpose                                                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/` | Shared UI components (shadcn/ui based)                                                                                                                          |
| `src/lib/`        | Utilities, `project-entries.ts` (home page registry)                                                                                                            |
| `src/trpc/`       | tRPC setup: `init.tsx` (router/procedure factories), `server.tsx` (RSC caller), `client.tsx` (React provider + `trpc` client), `routers/_app.tsx` (root router) |
| `src/db/`         | Drizzle schema (`schema.ts`) — single `users` table keyed on Clerk IDs                                                                                          |
| `src/providers/`  | React context providers (per-app or global)                                                                                                                     |
| `src/store/`      | Zustand stores (per-app, co-located by feature)                                                                                                                 |
| `src/hooks/`      | Custom React hooks                                                                                                                                              |
| `src/workers/`    | Web Workers                                                                                                                                                     |
| `src/__tests__/`  | Jest tests (`apps/`, `games/`, mirroring source structure)                                                                                                      |

### tRPC Pattern

- **Server components**: import `trpc` from `@/trpc/server` (uses RSC caller, no HTTP round-trip)
- **Client components**: import `trpc` from `@/trpc/client` (uses `httpBatchLink` to `/api/trpc`)
- Add new routers in `src/trpc/routers/` and compose them into `_app.tsx`
- Context is in `init.tsx` — currently returns a static `userId`; wire Clerk auth there when needed

### Auth

Clerk middleware in `src/middleware.ts` protects routes matching `/protected(.*)`. The DB `users` table syncs via Clerk webhooks (see `src/app/api/`).

### Adding a New App or Game

1. Create `src/app/apps/<name>/` (or `games/<name>/`) with `page.tsx` and optional `layout.tsx`
2. Register it in `src/lib/project-entries.ts` so it appears on the home page
3. Add per-app state to `src/store/<name>/` and providers to `src/providers/<name>/` as needed

### Styling

Tailwind CSS v4, shadcn/ui components (`components.json` tracks installed primitives). Import path alias `@/` maps to `src/`.

### Testing

- Jest + React Testing Library for unit/integration tests; test files live in `src/__tests__/apps/` or `src/__tests__/games/`
- MSW (`src/__tests__/msw-server.ts`) for API mocking in tests
- Playwright for visual regression (screenshots in `src/__tests__/__screenshots__/`)
