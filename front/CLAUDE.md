# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This directory (`front/`) is the frontend of a two-package monorepo rooted one
level up (`KnowWine-AI/`, sibling `back/` = Node/Express REST API). The git
repository root is `KnowWine-AI/`, not `front/` — `git status`/`git diff` from
here will show `../back/...` paths too. See the root `CLAUDE.md` for
repo-wide conventions; this file only covers the frontend.

**`front/docs/ARCHITECTURE.md` is the canonical architecture document** —
provider tree, route map, component inventory, and sequence diagrams for
login, add/delete wine, and catalogue browsing/search. `front/README.md` is
the shorter getting-started version of the same material. Read
`ARCHITECTURE.md` before making non-trivial changes instead of re-deriving
structure from source — this file only adds what those two don't cover
(commands and things that have drifted since they were last updated).

## Commands

```bash
npm run dev              # Vite dev server at http://localhost:5173
npm run build             # tsc -b && vite build
npm run preview            # preview the production build locally
npm run test               # Vitest — unit/component tests
npm run test:e2e            # Playwright — needs both dev servers running (see below)
npm run test:report         # open the last Playwright HTML report
npm run lint                # eslint .
npm run format               # prettier . --write
npm run format:check          # prettier . --check
npm run tsc                    # standalone type-check, no build output
```

Run a single Vitest file or test case directly:

```bash
npx vitest run tests/MyWine.test.jsx
npx vitest run tests/MyWine.test.jsx -t "renders content"
```

**The backend (`../back`) must be running on `http://localhost:3001`** for
anything that hits `/api/*` to work in dev — `vite.config.ts` proxies `/api`
there, it isn't mocked away. This applies to `npm run dev` and to
`npm run test:e2e` (Playwright's `webServer` only starts the frontend's own
`npm run dev`; it does not start the backend or a database for you).
Vitest component tests (`tests/*.test.jsx`) don't need the backend — they
mock the relevant `services/*` module instead (see Testing below).

## Architecture essentials

- React 19 + TypeScript, Vite 8, react-router-dom v7, MUI, axios, TanStack
  Query, no Redux/Zustand — see `docs/ARCHITECTURE.md` §1 for the full stack
  table and §2 for the directory layout.
- State flows one way through four layers per domain: **Page/Component →
  Context → Hook → Service**. Only `services/*` may import `axios` or know a
  backend URL exists; components and hooks only ever see plain JS/TS data.
  If the backend's API shape changes, fix it in `services/`, not at call
  sites (`docs/ARCHITECTURE.md` §5, §"Project structure" in the README).
- Contexts (`context/*Context.tsx`) hold no state of their own — each just
  runs its matching hook once and exposes the result, so every consumer
  shares one instance. `useWineList` is the deliberate exception: it's
  called directly in `pages/WineList.tsx` (its only consumer) instead of
  being wrapped in a context, since a context would fetch on every app load
  regardless of whether the user ever visits `/wines`.
- `PrivateRoute` (`components/PrivateRoute.tsx`) gates `/addwine`,
  `/mywines`, and `/mywines/:id`. It also mounts `MyWinesProvider` — that
  provider is _not_ in `main.tsx`'s tree, so `useMyWinesContext()` only
  works inside routes under `PrivateRoute`.

## Authentication

Authentication uses:

- an httpOnly refresh-token cookie (set by the backend, never read by
  frontend JS)
- a short-lived access token, held only in `apiClient.ts`'s module-level
  memory
- `services/apiClient.ts` for token attachment (request interceptor) and
  silent refresh-on-401 (response interceptor)
- `useAuth.ts` for restoring the current user from the refresh cookie on
  mount, and for `login`/`logout`

Rules (beyond Golden rules #7/#8 — no `localStorage`, never bypass
`apiClient`):

- Never manually attach `Authorization` headers in individual `services/*`
  files — that's `apiClient`'s request interceptor's job.
- Don't reintroduce a per-service `setToken()`-style pattern (the old
  design, removed — see Drift below). If you find yourself adding a
  `setToken()`/token param to a service function, that's a sign to route
  through `apiClient` instead.
- Do not implement token refresh anywhere outside `apiClient.ts`'s
  `getRefreshedToken()`.
- If authentication behavior changes, inspect **both** `front/` and
  `back/` before implementing — see the root `CLAUDE.md`.

## Drift from `docs/ARCHITECTURE.md` / `README.md`

`ARCHITECTURE.md` §6 ("Sequence: login") and the README's "State management"
table both still describe the **old** auth flow — `useAuth` reading/writing
`localStorage.setItem('loggedWineappUser', ...)` and calling
`myWineService.setToken()` / `userService.setToken()` directly. That's no
longer how it works: `useAuth.ts` now restores the session from an httpOnly
refresh-token cookie via `services/apiClient.ts` (`getRefreshedToken()` on
mount), and `apiClient`'s own interceptors attach the access token and
silently refresh it on a 401 — individual services no longer call
`setToken()` at all. See `back/README.md` §5.1 for the full flow (both
sides). `git status`/`git diff` before assuming those two docs' auth
sections are current.

## Testing

- **Unit/component** (`tests/*.test.jsx`, Vitest + Testing Library): mock
  the relevant `services/*` module with `vi.mock('../src/services/x')`
  (auto-mock — no factory needed) rather than hitting the real network. Any
  component that renders behind `AuthProvider` needs
  `services/apiClient.ts` mocked too (`apiClient.getRefreshedToken` resolved
  to a fake user), since `useAuth` calls it on mount — seeding
  `localStorage` does nothing anymore (see Drift above).
- `tsconfig.app.json`'s `include` currently lists `tests/MyWine.test.jsx`
  by name rather than a glob over `tests/`— `npm run build`'s `tsc -b` step
  does not type-check other test files (e.g. `MyWineForm.test.jsx`) as a
  result. Worth fixing to a glob if you're touching that config, but not
  something to silently "fix" as a side effect of an unrelated change.
- **E2E** (`e2e/*.spec.ts`, Playwright) exercises the app through a real
  browser against both dev servers — see Commands above for what needs to
  be running first.

## Conventions

- ESLint (`eslint.config.js`) + Prettier — same `prettier/prettier`-backed
  setup style as the backend; run `npm run lint` before considering
  frontend work done, not just `format`.
- Type-based layout, not domain-based: `context/`, `hooks/`, `services/`,
  `pages/`, `components/` are organized by _what kind_ of file lives there,
  not by feature area (`wines/`, `auth/`). Stay consistent with that at the
  current size (~30 source files) rather than introducing a domain split
  for one new feature.
- Prefer TanStack Query for server state that's large, paginated, or
  benefits from caching (the external wine catalogue — see `useWineList`/
  `useWineSearch`). Small, user-owned collections like `useMyWines` and
  auth (`useAuth`) intentionally stay on manual `useState`/`useEffect` —
  see the Drift note above and `docs/ARCHITECTURE.md` §5; don't migrate
  them to TanStack Query as a side effect of unrelated work.
- Add or update tests when changing API-consuming frontend behavior

## Instructions hierarchy

When working on the frontend, use this priority order:

1. This `CLAUDE.md`
2. `../CLAUDE.md` (repository-wide rules)
3. `docs/ARCHITECTURE.md` (canonical frontend architecture)
4. Existing code and tests
5. `README.md`

If documentation conflicts with the current implementation, do not silently
change the architecture to match the documentation. Report the differences. Prefer the current
implementation and report the documentation drift.

## Before making changes

Before modifying code:

1. Read the relevant section of `docs/ARCHITECTURE.md`.
2. Inspect the existing implementation and nearby tests.
3. Identify which architectural layer owns the change.
4. Check whether the change affects routing, authentication, server state,
   or API contracts.
5. Prefer extending an existing pattern over introducing a new one.
6. Do not refactor unrelated code unless explicitly requested.
7. State the intended approach briefly before making non-trivial changes.

## Architectural boundaries

DO NOT:

- Import axios outside `services/`.
- Access backend URLs from components, pages, contexts, or hooks.
- Put API calls directly inside React components.
- Store authentication tokens in localStorage.
- Add Redux, Zustand, or another global state library before discussing tradeoffs
- Duplicate API transformation logic across components.
- Create a new Context when a hook is sufficient.
- Move code between architectural layers without a clear reason.
- Introduce a new abstraction for a single use case.
- Rewrite working code merely to make it stylistically different.

## Server state

Use TanStack Query for server state.

Rules:

- Do not copy server state into React state unless there is a specific reason.
- Prefer `useQuery` for reads.
- Prefer `useMutation` for writes.
- Keep HTTP/API details inside `services/`.
- Keep query and mutation orchestration inside hooks.
- Configure caching, invalidation, and refetching in hooks rather than
  components.
- Components should consume hook results, not construct API requests.

## When uncertain

If the existing architecture does not clearly answer how a feature should
be implemented:

1. Inspect similar existing features.
2. Inspect tests.
3. Check `docs/ARCHITECTURE.md`.
4. Check the backend API implementation if the change crosses the API boundary.
5. Do not invent a new architectural pattern without explaining why.
6. Ask for clarification rather than making a large architectural change
   based on an assumption.

   ## After making changes

Before considering a task complete:

1. Run the relevant tests.
2. Run `npm run tsc`.
3. Run `npm run lint`.
4. Run `npm run build` for changes affecting production code.
5. Review the final diff.
6. Check for unrelated modifications.
7. Update architecture documentation only if the architecture actually changed.
8. Report any tests or checks that could not be run.

## Change scope

Prefer the smallest change that correctly solves the requested problem.

Do not:

- refactor unrelated code
- rename unrelated variables
- reorganize directories without a reason
- update dependencies unless necessary
- change formatting in unrelated files
- "clean up" surrounding code unless requested

If a larger refactor would materially improve the solution, explain it first
instead of silently expanding the scope.

## Golden rules

1. Respect the existing architecture.
2. Components should not know about HTTP.
3. Services own API communication.
4. Hooks own data-fetching orchestration.
5. Context is only used where shared state actually requires it.
6. TanStack Query owns server state.
7. Never store authentication tokens in localStorage.
8. Never bypass `apiClient` for authenticated requests.
9. Never use `any`.
10. Prefer the smallest correct change.
11. Do not refactor unrelated code.
12. Test behavior, not implementation details.
13. Run lint, type-checks, and relevant tests before finishing.
