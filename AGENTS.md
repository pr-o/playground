# Repository Guidelines

## Project Structure & Module Organization
The app uses Next.js 15 with the App Router. Place route segments, layouts, and pages under `src/app`. Shared logic lives in `src/lib`; exports should prefer named helpers from `utils.ts` so they stay tree-shakeable. Static assets go in `public/`, while global Tailwind and theme primitives live in `src/app/globals.css`. Component aliases declared in `components.json` and `tsconfig.json` allow imports like `@/lib/utils`; keep new modules within `src` so the alias remains valid.

## Build, Test, and Development Commands
Use `npm run dev` to launch the Turbopack dev server on http://localhost:3000 with live reload. `npm run build` compiles the production bundle; run it before shipping any build-affecting change. Serve the optimized output locally with `npm run start` after a build. `npm run lint` runs the Next + TypeScript ESLint config; fix lint violations before opening a PR.

## Coding Style & Naming Conventions
Stick to TypeScript, 2-space indentation, and trailing commas where ESLint requests them. Favor React Server Components except when browser APIs require `use client`. Name components and files with PascalCase for UI (`SidebarMenu.tsx`) and camelCase for utilities (`formatDate`). Tailwind class names should stay ordered by layout → spacing → color to keep diffs clean. Prefer `@/` aliases over relative `../../` chains.

## Testing Guidelines
There is currently no automated test runner wired in. When adding tests, co-locate them in `src/__tests__` or alongside components using `.test.ts[x]` naming, and script them under `npm run test`. Use React Testing Library for component logic and add Storybook visual coverage only after lint and type checks pass. Block merges on lint + planned test suites until they run clean locally.

## Commit & Pull Request Guidelines
Existing commits use concise, lowercase imperatives such as `init shadcn` and occasional Conventional Commit prefixes (`chore:`). Follow that pattern: `<type?> short summary` describing the intent, not the implementation. Every PR should include: what changed, why, manual verification notes, and linked issue or task ID when available. Add screenshots or recordings when UI behavior changes, and request a review once CI and lint are green.

## Environment & Configuration
Secrets belong in `.env.local`, never committed. Keep `next.config.ts` minimal; prefer per-route configuration via `generateMetadata` or middleware. Update `components.json` if you generate new shadcn/ui parts so aliases stay consistent, and rerun `npm run lint` afterwards to ensure imports resolve.
