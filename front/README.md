# KnowWine AI — Frontend

The web client for KnowWine AI: browse a wine catalogue, sign in, and keep a personal list of
saved wines. Built with React 19, TypeScript, and Vite; talks to the Express backend in `../back`
over `/api/*`.

For how the app is put together — provider tree, routing, data flow, and sequence diagrams — see
[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Getting started

The backend (`../back`) must be running on `http://localhost:3001` — the Vite dev server proxies
`/api/*` requests to it (see `vite.config.ts`).

```bash
npm install
npm run dev       # starts the app at http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run unit/component tests (Vitest) |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |
| `npm run test:report` | Open the last Playwright HTML report |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting without writing |

## Tech stack

- **React 19** + **TypeScript**, bundled with **Vite**
- **react-router-dom** for routing
- **MUI** (`@mui/material`, `@mui/icons-material`) for UI components
- **axios** for HTTP calls to the backend
- **maplibre-gl** for the globe on the home page
- **Vitest** + **Testing Library** for unit/component tests, **Playwright** for e2e

## State management

No Redux/Zustand — global state is plain React Context wrapping custom hooks. Each domain
follows the same pattern:

- a **hook** (`hooks/useX.ts`) owns the actual `useState`/`useEffect` logic and calls the
  matching service for API access
- a **context** (`context/XContext.tsx`) runs that hook once and exposes its return value via
  `createContext`, so all consumers share one instance instead of re-fetching per component
- a **`useXContext()`** accessor reads the context and throws if called outside its provider,
  so misuse fails immediately instead of surfacing as a confusing `undefined`

| Context | Hook | Owns |
|---|---|---|
| `AuthContext` | `useAuth` | Logged-in `user`, `login`/`logout`, persists the session to `localStorage` |
| `NotificationContext` | `useNotifications` | The current toast message shown by `<Notification>` |
| `WineListContext` | `useWineList` | The full wine catalogue fetched from `/api/wines` |
| `MyWinesContext` | `useMyWines` | The signed-in user's saved wines, plus `addWine`/`deleteWine` |

All four providers are mounted once in `main.tsx`, wrapping `<App />`. Nesting order matters:
`AuthProvider` wraps everything that needs `user`, and `MyWinesProvider` sits inside
`NotificationProvider` because `useMyWines` calls `useNotificationContext()` internally to report
errors. Local, component-only state (form inputs, search text, toggles) stays as plain
`useState` in the component — it isn't lifted into context.

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the provider-tree diagram and data-flow
sequence diagrams.

## Project structure

This app is a client-only SPA — there's no server-side rendering here. `src/` splits into
**client** code (rendering + state, runs entirely in the browser) and **server** code (the only
layer that talks to the backend over HTTP):

```
src/
├── services/     # ── server ── axios clients, one per backend REST resource
│                    (login.ts, myWines.ts, users.ts, wineList.ts)
│
├── context/      # ── client ── React Context wrappers around the hooks below
├── hooks/        # ── client ── state + effects; call into services/ for data
├── pages/        # ── client ── route-level screens
└── components/   # ── client ── reusable/presentational pieces
```

Nothing outside `services/` imports `axios` or knows a backend URL exists — components and hooks
only ever see plain JS/TS data returned from a service call. That's the boundary to preserve if
the backend's API shape changes: fix it once in `services/`, not at every call site.

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full breakdown and diagrams.
