# KnowWine AI

🚧 Actively developed full-stack personal project (ongoing development)
![Status](https://img.shields.io/badge/status-active_development-blue)

Personal project: A full-stack CRUD web app for wine discovery and personal wine management, powered by the GrapeMinds API. Discove and manage wines. Browse a wine catalogue from the GrapeMinds API, and keep a personal list of your favourite wines.

It demonstrates modern software engineering practices including authentication, caching, CI/CD, automated testing, and third-party API integration.

**Live app:** https://knowwine-ai.onrender.com/

## Features

Key Features
🍷 Browse wine catalogue via external API (GrapeMinds)
⭐ Personal “My Wines” collection (add / delete / manage)
🔐 JWT authentication (secure login & registration)
🌍 Geolocation-based landing page: flies to your location and shows your city (reverse geocoding via Photon/OpenStreetMap)
⚡ Redis caching for production performance optimization
🧾 Input validation + rate limiting (API protection)
👤 User system with hashed passwords (bcrypt)
🌐 CI/CD github actions pipeline andfull production deployment on Render

## Tech stack

| Layer     | Technology                                      |
| --------- | ----------------------------------------------- |
| Frontend  | React (TypeScript), Vite, Axios, TanStack Query |
| Backend   | Node.js, Express 5                              |
| Database  | PostgreSQL (Neon)                               |
| Cache     | Redis (ioredis + Upstash) — production only     |
| Geocoding | Photon (OpenStreetMap-based reverse geocoding)  |
| Auth      | JWT (`jsonwebtoken`), bcrypt                    |
| Testing   | Unit tests: Vitest + React Testing Library      |
| Testing   | Integration tests: Node + Supertest             |
| Testing   | E2E tests: Playwright                           |
| CI/CD     | CI/CD via GitHub Actions                        |
| Deploy    | Automated deploy Render.com                     |
| Docker    | local PostgreSQL + test DB                      |

## Architecture

### System overview

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│              React 19 + TypeScript (Vite)               │
│         http://localhost:5173 / onrender.com            │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP /api/*
                       ▼
┌───────────────────────────────────────────────────────────────┐
│                     Express 5 (Node 22)                       │
│                    http://localhost:3001                       │
│                                                                 │
│  POST /api/login          → JWT sign                           │
│  GET  /api/wines          → Redis cache → GrapeMinds /wines    │
│                              (browsable catalogue, page 1-5)   │
│  GET  /api/wines?search=  → Redis cache → GrapeMinds           │
│                              /wines/search (full catalogue)    │
│  GET  /api/wines/:id      → Redis cache → GrapeMinds /wines/:id│
│  GET  /api/mywines        → PostgreSQL                         │
│  POST /api/mywines        → JWT verify → PostgreSQL            │
│  GET  /api/location       → Photon /reverse (unauth, no cache) │
└───────┬─────────────────────────┬───────────────────────────────┘
        │                         │
        ▼                         ▼
┌───────────────┐    ┌─────────────────────────┐    ┌──────────────────────┐
│  PostgreSQL   │    │  Redis (Upstash)        │    │  GrapeMinds API      │
│  (Neon)       │    │                         │───►│  api.grapeminds.eu   │
│               │    │  grapeminds:wines:      │    │                      │
│  users        │    │    page:1-5 (60d)       │    │  GET /wines          │
│  my_wines     │    │  grapeminds:search:*    │    │  GET /wines/search   │
│               │    │  grapeminds:wine:*      │    │  GET /wines/:id      │
│               │    │  grapeminds:quota:*     │    │  (250 req/month cap) │
└───────────────┘    └─────────────────────────┘    └──────────────────────┘
```

In **development** the frontend dev server (port 5173) proxies `/api/*` to the backend (port 3001). In **production** the backend serves the built frontend as static files from `back/dist`.

`/api/location` is a fourth external integration alongside PostgreSQL/Redis/GrapeMinds, not shown as its own box above for space — it calls [Photon](https://photon.komoot.io/) (photon.komoot.io) directly, with no cache and no API key. See `back/README.md` §5.4 and `docs/adr.md` ADR-003 for why and its known tradeoffs.

### Data model

```
users
├── id            SERIAL PRIMARY KEY
├── name          TEXT NOT NULL (min 2 chars)
├── username      TEXT NOT NULL UNIQUE (min 3 chars)
├── password_hash TEXT NOT NULL  ← bcrypt, 10 rounds
└── date          TIMESTAMP

my_wines
├── id            SERIAL PRIMARY KEY
├── name          TEXT NOT NULL UNIQUE (min 2 chars)
├── description   TEXT NOT NULL (min 10 chars)
├── user_id       INTEGER → users(id)
└── date          TIMESTAMP
```

### Authentication flow

```
1. POST /api/login  { username, password }
        │
        ├── Look up user by username
        ├── bcrypt.compare(password, password_hash)
        ├── sign access token   (SECRET, 15 min)
        └── sign refresh token  (REFRESH_TOKEN_SECRET, 7 days)
                │
                ▼
        { token, username, name, id }  → held in memory only (front/src/services/apiClient.ts)
        Set-Cookie: refresh token       → httpOnly, path=/api/login/refresh, not readable by JS

2. GET/POST /api/mywines  Authorization: Bearer <token>
        │
        ├── jwt.verify(token, SECRET)  → { id, username }
        ├── Re-fetch the user by id (token payload alone isn't trusted for authorization)
        └── ...request proceeds

3. Access token expires (15 min) → the next request gets a 401
        │
        ├── apiClient's response interceptor catches the 401
        ├── POST /api/login/refresh   (browser sends the httpOnly cookie automatically)
        ├── backend verifies + rotates the refresh token, issues a new access+refresh pair
        └── the original request is retried once, with the new access token
```

No token is ever written to `localStorage` — the access token lives only in memory and the
refresh token only in an httpOnly cookie, so page JavaScript can't read either one. See
`back/README.md` §5.1 for the full backend flow, including refresh-token rotation and reuse
detection.

### Frontend auth state

Session state, the `login`/`logout` actions, and the silent session-restore-from-cookie effect on
mount live in a single `useAuth` hook (`front/src/hooks/useAuth.ts`), exposed app-wide through
`AuthContext` (`front/src/context/AuthContext.tsx`) via a `useAuthContext()` consumer hook.
`main.tsx` wraps the app in `<AuthProvider>`, so any component can read `user` or call
`login`/`logout` without prop drilling. The access token itself isn't part of this hook's state —
it's held in `front/src/services/apiClient.ts`'s module-level memory, attached to every request by
an axios interceptor, and silently refreshed on a 401; see `front/CLAUDE.md` §Authentication.

### Frontend wine state

Wine catalogue browsing and the user's personal wine list are each handled by their own hook — `useWineList` and `useMyWines`. `useMyWines` is exposed app-wide via `MyWinesContext`; `useWineList` is called directly in `pages/WineList.tsx`, its only consumer, so it doesn't need a context. Both hooks call `useNotificationContext()` to surface load/add/delete errors, so `NotificationProvider` must be mounted above `MyWinesProvider` (and any component calling `useWineList`).

`useWineList` fetches the browsable catalogue via TanStack Query (`QueryClientProvider` wraps the app in `main.tsx`), one page at a time — it tracks the current `page` (1–5) and refetches when it changes. Its `staleTime`/`gcTime` (`hooks/wineQueryConfig.ts`) match the backend's 60-day Redis cache, so there's no value in refetching sooner than the underlying cache can actually change. The wine search box on `/wines` (`pages/WineList.tsx`) fires on **explicit submit** (Enter or a Search button), not live-as-you-type, via its own `useWineSearch` hook against `GET /api/wines?search=`; see [Wine search & catalogue](#wine-search--catalogue) below for the full flow.

### Environment matrix

|                  | `development`        | `test`                  | `production`           |
| ---------------- | -------------------- | ----------------------- | ---------------------- |
| Wine data source | `wines.json` (local) | `wines.json` (local)    | GrapeMinds API + Redis |
| Database         | localhost:5432       | localhost:5433 (Docker) | Neon PostgreSQL        |
| Redis            | not used             | not used                | Upstash                |
| Rate limit       | 500 req/15 min       | 500 req/15 min          | 50 req/15 min          |
| DB SSL           | off                  | off                     | on                     |

## Project structure

```
KnowWine/
├── back/                  # Express backend
│   ├── controllers/       # Route handlers (login, mywines, users)
│   ├── models/            # Database query functions (mywine, user)
│   ├── utils/             # Config, DB connection, middleware
│   ├── tests/             # Backend integration tests
│   ├── wines.json         # Static wine catalogue (dev/test fallback)
│   ├── app.js             # Express app setup
│   └── index.js           # Server entry point
└── front/                 # React frontend
    └── src/
        ├── components/    # UI components
        ├── context/       # AuthContext, NotificationContext, MyWinesContext
        ├── hooks/         # useAuth, useNotifications, useMyWines, useWineList
        └── services/      # Axios API calls (login, myWines, users, wineList)
```

## API endpoints

| Method | Path               | Auth required | Description                                                                                                                                                                                                     |
| ------ | ------------------ | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/wines`       | No            | Browsable catalogue page (100 wines). `?page=` (1–5, clamped server-side) selects which cached page; `?search=` (min 3 characters) instead proxies to GrapeMinds' own search endpoint across the full catalogue |
| GET    | `/api/wines/:id`   | No            | Single wine's full detail, proxied from GrapeMinds                                                                                                                                                              |
| GET    | `/api/mywines`     | No            | List all user-saved wines                                                                                                                                                                                       |
| GET    | `/api/mywines/:id` | No            | Get a single saved wine                                                                                                                                                                                         |
| POST   | `/api/mywines`     | Yes (Bearer)  | Add a wine to My Wines                                                                                                                                                                                          |
| DELETE | `/api/mywines/:id` | Yes (Bearer)  | Delete a wine from My Wines                                                                                                                                                                                     |
| GET    | `/api/users`       | Yes (Bearer)  | List users                                                                                                                                                                                                      |
| POST   | `/api/users`       | No            | Register a new user                                                                                                                                                                                             |
| POST   | `/api/login`       | No            | Login and receive a JWT token                                                                                                                                                                                   |

### My Wines validation

- `name`: string, 2–100 characters, must be unique
- `description`: string, 10–1000 characters

### User registration validation

- `name`: at least 2 characters
- `username`: at least 3 characters, letters/numbers/underscores only, must be unique
- `password`: at least 8 characters

---

## Local development

### Prerequisites

- Node.js v22+
- Docker (for PostgreSQL)

### 1. Start the database

```bash
docker run --name knowwine-dev -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=knowwine -p 5432:5432 -d postgres:16
```

Or if the container already exists:

```bash
docker start knowwine-dev
```

### 2. Configure environment

Create `back/.env`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/knowwine
NODE_ENV=development
SECRET=your_jwt_secret_here
GRAPEMINDS_URL=https://api.grapeminds.com
GRAPEMINDS_API_KEY=your_api_key_here
REDIS_HOST=localhost
REDIS_PORT=6379
```

Redis is only used in `production` mode — in `development` and `test` the wine catalogue is served from the local `wines.json` file, so Redis is not required for local dev.

### 3. Install dependencies

```bash
cd back && npm install
cd ../front && npm install
```

### 4. Start the backend

```bash
cd back
npm run dev
```

Backend runs on `http://localhost:3001`.

### 5. Start the frontend

In a separate terminal:

```bash
cd front
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api/*` to the backend.

---

## Testing

### Backend integration tests

Tests use a separate PostgreSQL Docker container so they never touch the development database.

**First time setup:**

```bash
docker run --name knowwine-test -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=knowwine_test -p 5433:5432 -d postgres:16
```

**Every time before running tests:**

```bash
docker start knowwine-test
```

**Run tests:**

```bash
cd back
npm test
```

The test suite automatically creates tables, wipes them, and reseeds before each test. Covers GET, POST, and DELETE for both the `mywines` and `users` endpoints.

```bash
docker stop knowwine-test  # stop when done
```

### Frontend unit tests

Uses Vitest with jsdom and React Testing Library. No database or running server needed.

```bash
cd front
npm test
```

**Coverage report:**

```bash
npm test -- --coverage
```

Generates a summary in the terminal and an HTML report in `front/coverage/index.html`.

| File             | What is tested                                                        |
| ---------------- | --------------------------------------------------------------------- |
| `MyWine.tsx`     | Renders wine name and description                                     |
| `MyWineForm.tsx` | Typing into fields and submitting calls `addWine` with correct values |

### Linting and formatting

```bash
# Check for lint errors
cd back && npm run lint
cd front && npm run lint

# Fix all Prettier formatting issues automatically
cd back && npm run format
cd front && npm run format
```

Lint is also run automatically in the CI pipeline on every push to `master`.

### E2E tests (Playwright)

E2E tests run automatically in the CI pipeline as a separate job after the unit tests pass. They can also be run locally.

**Run locally** (requires both servers running):

```bash
# Terminal 1
cd back && npm run dev

# Terminal 2
cd front && npm run dev

# Terminal 3
cd front && npm run test:e2e

# View last report
cd front && npm run test:report
```

Test files live in `front/tests/e2e/` and cover navigation, home page, and the wine catalogue.

---

## Wine search & catalogue

GrapeMinds' catalogue has over 264,000 wines, but its plan caps usage at **250 requests/month** —
so the app only ever holds a small, cached slice locally, and every code path that talks to
GrapeMinds is designed around that quota. Everything below lives in
`back/services/wineService.js`.

**Browsing** (`GET /api/wines`, no `search` param) returns one page of 100 wines at a time from
GrapeMinds' `/wines?per_page=100&page=N` endpoint. `page` is clamped server-side to **1–5** —
bounded deliberately, since paging through all ~2,650 real pages would exhaust the entire monthly
quota on browsing alone. Each page is cached separately in Redis (`grapeminds:wines:page:<n>`,
60-day TTL). The frontend's `useWineList` hook tracks the current page; `pages/WineList.tsx`
renders an MUI `Pagination` control capped at 5.

**Search** (`GET /api/wines?search=<term>`, minimum 3 characters) proxies directly to GrapeMinds'
own `/wines/search?q=&limit=100` endpoint, rather than filtering the (much smaller) cached
browsing pages — this is what actually reaches the full catalogue, not just whatever page happens
to be cached. Results are cached per normalized search term (`grapeminds:search:<term>`, 60-day
TTL). On the frontend, `pages/WineList.tsx` fires the search on **explicit submit** (Enter or a
Search button) via `useWineSearch`, not on every keystroke — typing "riesling" with a pause
mid-word would otherwise fire two separately-billed queries for one search intent.

**Wine detail** (`GET /api/wines/:id`) proxies to GrapeMinds' `/wines/:id`, cached per id
(`grapeminds:wine:<id>`, 60-day TTL — including a cached `null` for 404s, so a bad/stale id
doesn't cost quota on every repeat visit). `components/WineDetail.tsx` fetches by id directly
rather than looking the wine up in the (page-limited) `useWineList` cache, since a search result
very likely references a wine outside whatever page happens to be cached.

## Redis caching

| Key pattern                   | What it caches                                              | TTL      |
| ----------------------------- | ----------------------------------------------------------- | -------- |
| `grapeminds:wines:page:<1-5>` | One page (100 wines) of the browsable catalogue             | 60 days  |
| `grapeminds:search:<term>`    | Search results for one normalized search term               | 60 days  |
| `grapeminds:wine:<id>`        | A single wine's full detail (or cached `null` for a 404)    | 60 days  |
| `grapeminds:quota:<YYYY-MM>`  | Count of real (non-cached) GrapeMinds calls made this month | ~40 days |

In **development** and **test**, none of this runs — `GET /api/wines*` is served from the local
`back/wines.json` fixture and Redis isn't used at all.

In **production**, every cache miss:

1. Increments `grapeminds:quota:<current month>` and checks it against the 250 cap **before**
   the request goes out — once the quota is spent, the backend throws instead of calling
   GrapeMinds, rather than silently going over.
2. Shares one in-flight request with any other near-simultaneous request for the same uncached
   key (e.g. two users searching the same new term at once), instead of both hitting GrapeMinds.
3. On success, writes the result to its cache key with a 60-day TTL.

The Redis client (`back/utils/redis.js`) uses the `REDIS_URL` environment variable in production (Upstash), or `REDIS_HOST` / `REDIS_PORT` locally.

### Forcing a cache refresh

**Locally** (production-mode testing only):

```bash
docker run --name knowwine-redis -p 6379:6379 -d redis:7
# or: docker start knowwine-redis
```

Set `NODE_ENV=production` in `back/.env`, then start the backend normally. To inspect the cache:

```bash
docker exec -it knowwine-redis redis-cli
> KEYS grapeminds:wines*        # list cached catalogue pages
> DEL grapeminds:wines:page:1   # force that one page to refetch on next request
```

**In production (Upstash)** — there's no admin endpoint for this yet, so it's done directly
against Redis:

- **Console**: log into [console.upstash.com](https://console.upstash.com) → open the database →
  Data Browser / CLI tab → delete the keys matching `grapeminds:wines*`, `grapeminds:search:*`,
  or `grapeminds:wine:*` as needed.
- **CLI**, if `redis-cli` can reach the Upstash instance directly:
  ```bash
  redis-cli -u "$REDIS_URL" --scan --pattern "grapeminds:wines*" | xargs -I{} redis-cli -u "$REDIS_URL" DEL {}
  redis-cli -u "$REDIS_URL" --scan --pattern "grapeminds:search:*" | xargs -I{} redis-cli -u "$REDIS_URL" DEL {}
  redis-cli -u "$REDIS_URL" --scan --pattern "grapeminds:wine:*" | xargs -I{} redis-cli -u "$REDIS_URL" DEL {}
  ```
  (Redis has no wildcard `DEL`, hence `--scan --pattern` + `xargs`.)

**Never delete `grapeminds:quota:*`** unless you specifically intend to reset the monthly usage
counter — it tracks real API calls already made, not cacheable data, and clearing it early just
makes the 250/month cap easier to accidentally exceed.

---

## Deployment

### Production services

| Service  | Provider                                       |
| -------- | ---------------------------------------------- |
| Hosting  | [Render.com](https://render.com) (Web Service) |
| Database | [Neon](https://neon.com) – PostgreSQL          |
| Cache    | [Upstash](https://upstash.com) – Redis         |

### CI/CD pipeline

Every push to `master` triggers the pipeline defined in `.github/workflows/pipeline.yml`. Pull requests run all tests but never deploy.

```
git push master
    │
    ├─► JOB 1: test
    │     ├── Lint — back + front (ESLint)
    │     ├── Backend integration tests (node:test + PostgreSQL container)
    │     ├── Frontend unit tests (Vitest)
    │     └── npm audit --audit-level=high
    │
    ├─► JOB 2: e2e  (runs after test passes)
    │     ├── Start backend in test mode
    │     ├── Wait for backend to be ready (wait-on)
    │     └── Playwright E2E tests (Chromium)
    │
    ├─► JOB 3: deploy  (runs after test + e2e pass, master push only)
    │     └── curl Render deploy hook → Render builds & deploys
    │
    └─► JOB 4: tag_release  (runs after deploy)
          └── Bump patch version and push git tag (e.g. v1.0.4)
```

**Skip deploy and tagging** by including `#skip` in the commit message:

```bash
git commit -m "wip: experimenting with layout #skip"
```

**Required GitHub Secrets:**

| Secret                   | Purpose                                                     |
| ------------------------ | ----------------------------------------------------------- |
| `RENDER_DEPLOY_HOOK_URL` | Triggers Render deploy (Dashboard → Settings → Deploy Hook) |
| `GITHUB_TOKEN`           | Auto-provided — used for pushing version tags               |

### Manual deploy

```bash
cd back
npm run build:ui    # builds front/dist and copies it to back/dist
npm run deploy:full # build:ui + git add + git commit + git push
```

### Setting up production from scratch

**1. PostgreSQL – Neon**

1. Create an account at [neon.com](https://neon.com) and create a free PostgreSQL project
2. Copy the **Connection String** — this is your `DATABASE_URL`
3. Tables are created automatically on first backend start

**2. Redis – Upstash**

1. Create an account at [upstash.com](https://upstash.com)
2. Create a Redis database (region closest to your Render region)
3. Copy the **Redis URL** — this is your `REDIS_URL`

**3. Render – Web Service**

1. New → Web Service → connect your GitHub repository
2. Set the following:

| Setting        | Value                                                                                  |
| -------------- | -------------------------------------------------------------------------------------- |
| Runtime        | Node                                                                                   |
| Build Command  | `cd front && npm ci && npm run build && cd ../back && cp -r ../front/dist . && npm ci` |
| Start Command  | `node index.js`                                                                        |
| Root Directory | _(leave empty)_                                                                        |

3. Add environment variables:

```
NODE_ENV=production
DATABASE_URL=<Neon Connection String>
DB_SSL=true
SECRET=<a long random string, e.g. openssl rand -hex 32>
GRAPEMINDS_URL=https://api.grapeminds.eu/public/v1
GRAPEMINDS_API_KEY=<your GrapeMinds API key>
REDIS_URL=<Upstash Redis URL>
```

> **Note:** The free Render tier spins down after 15 minutes of inactivity. The first request after idle takes ~30 seconds to wake up.

---

## Todo

- testing skipping
- [ ] Adding more parameters for wines (year, grapes etc)
- [ ] Updating wine parameters and descriptions..
- [ ] User administration panel (admin)
- [ ] Second external wine API integration
- [ ] Map of wine regions with pop-ups
- [ ] RAG AI wine recommendation page
- [ ] Rating system for My Wines
- [ ] Wine poems
- [ ] Docker Compose setup for local development
- [ ] Add a periodic health check to regularly do an HTTP GET ping. request to server

## Done

- [x] Removed `WineListContext` — it had a single consumer (`WineList.tsx`), so the hook is now called directly instead of through a provider mounted app-wide
- [x] Wine catalogue search proxied to GrapeMinds' own `/wines/search` endpoint (was: in-memory filter over one cached page) — reaches the full catalogue, fires on submit not on every keystroke
- [x] Bounded catalogue pagination (5 pages, MUI `Pagination`) — was hardcoded to page 1 only
- [x] Single-wine detail endpoint (`GET /api/wines/:id`) — `WineDetail.tsx` no longer depends on the wine being in the currently-cached catalogue page
- [x] GrapeMinds monthly quota tracking (250 req/month, Redis counter) + in-flight request dedup + cached 404s
- [x] Wine catalogue fetching migrated to TanStack Query (caching, retries, tuned `staleTime`)
- [x] refining github CI/CD pipeline to have version release tags and option to skip deployment and tags
- [x] Add playright e2e tests to github CI/CD pipeline to run as parallel job
- [x] protect protect the main branch in a GitHub repository
- [x] CI/CD pipeline (GitHub Actions → Render deploy hook)
- [x] Styles with Material UI
- [x] Redis caching for wine catalogue (production, 60-day TTL, ioredis + Upstash)
- [x] Frontend component tests (Vitest + React Testing Library)
- [x] E2E tests (Playwright)
- [x] External wine API integration (GrapeMinds)
- [x] Navigation with React Router (BrowserRouter)
- [x] JWT token authentication and login/logout
- [x] Auth state moved to Context API (`AuthContext` + `useAuth` hook)
- [x] My Wines state moved to Context API (`MyWinesContext`) — wine catalogue state (`useWineList`) was moved to `WineListContext` too but later reverted since it never had more than one consumer
- [x] Backend integration tests (mywines + users)
- [x] ESLint and Prettier
- [x] Project setup: React (TypeScript) frontend + Express backend connected
- [x] PostgreSQL database integration
- [x] My Wines: add, list, view, and delete wines (backend + frontend)
- [x] Axios API calls extracted into service modules
- [x] Backend structure: `app.js`, `controllers/`, `models/`, `utils/`
- [x] API security: rate limiting, input validation, request size limits
- [x] Deployed to internet (Render.com)
