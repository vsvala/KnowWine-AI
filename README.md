# KnowWine AI

A web app for discovering and managing wines. Browse a wine catalogue from the GrapeMinds API, and keep a personal list of your favourite wines.

**Live app:** https://knowwine-ai.onrender.com/

## Features

- Browse a wine catalogue with details like colour, type, sub-type, producer, and region
- Personal "My Wines" list — add and delete wines with name and description
- JWT-based user authentication (login/logout, token stored in localStorage)
- User registration with input validation
- Rate limiting and request size limits on the backend

## Tech stack

| Layer    | Technology                                     |
| -------- | ---------------------------------------------- |
| Frontend | React (TypeScript), Vite, Axios                |
| Backend  | Node.js, Express 5                             |
| Database | PostgreSQL (Aiven)                             |
| Cache    | Redis (ioredis + Upstash) — production only    |
| Auth     | JWT (`jsonwebtoken`), bcrypt                   |
| Deploy   | Render.com (backend serves the built frontend) |

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
┌─────────────────────────────────────────────────────────┐
│                   Express 5 (Node 22)                   │
│                  http://localhost:3001                   │
│                                                         │
│  POST /api/login     → JWT sign                         │
│  GET  /api/wines     → Redis cache → GrapeMinds API     │
│  GET  /api/mywines   → PostgreSQL                       │
│  POST /api/mywines   → JWT verify → PostgreSQL          │
└───────┬─────────────────────┬───────────────────────────┘
        │                     │
        ▼                     ▼
┌───────────────┐    ┌────────────────┐    ┌─────────────────────┐
│  PostgreSQL   │    │  Redis         │    │  GrapeMinds API     │
│  (Aiven)      │    │  (Upstash)     │───►│  api.grapeminds.eu  │
│               │    │                │    │                     │
│  users        │    │  grapeminds:   │    │  GET /wines         │
│  my_wines     │    │  wines (60d)   │    │  (wine catalogue)   │
└───────────────┘    └────────────────┘    └─────────────────────┘
```

In **development** the frontend dev server (port 5173) proxies `/api/*` to the backend (port 3001). In **production** the backend serves the built frontend as static files from `back/dist`.

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
        └── jwt.sign({ id, username }, SECRET, { expiresIn: '1h' })
                │
                ▼
        { token, username, name }  → stored in localStorage

2. POST /api/mywines  Authorization: Bearer <token>
        │
        ├── jwt.verify(token, SECRET)  → { id, username }
        ├── Look up user by id
        ├── Validate name + description
        └── INSERT INTO my_wines
```

### Environment matrix

| | `development` | `test` | `production` |
| --- | --- | --- | --- |
| Wine data source | `wines.json` (local) | `wines.json` (local) | GrapeMinds API + Redis |
| Database | localhost:5432 | localhost:5433 (Docker) | Aiven PostgreSQL |
| Redis | not used | not used | Upstash |
| Rate limit | 500 req/15 min | 500 req/15 min | 50 req/15 min |
| DB SSL | off | off | on |

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
        └── services/      # Axios API calls (login, myWines, users, wineList)
```

## API endpoints

| Method | Path               | Auth required | Description                   |
| ------ | ------------------ | ------------- | ----------------------------- |
| GET    | `/api/wines`       | No            | List all wines from catalogue |
| GET    | `/api/mywines`     | No            | List all user-saved wines     |
| GET    | `/api/mywines/:id` | No            | Get a single saved wine       |
| POST   | `/api/mywines`     | Yes (Bearer)  | Add a wine to My Wines        |
| DELETE | `/api/mywines/:id` | No            | Delete a wine from My Wines   |
| GET    | `/api/users`       | No            | List users                    |
| POST   | `/api/users`       | No            | Register a new user           |
| POST   | `/api/login`       | No            | Login and receive a JWT token |

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

E2E tests are **not part of the CI pipeline** — run them manually before committing significant UI changes.

They require both the backend and frontend dev server to be running simultaneously.

```bash
# Terminal 1
cd back && npm run dev

# Terminal 2
cd front && npm run dev

# Terminal 3
cd front && npm run test:e2e

# View last report
npm run test:report
```

Test files live in `front/tests/e2e/` and cover navigation, home page, and the wine catalogue.

---

## Redis caching

In **production**, the `GET /api/wines` endpoint caches the GrapeMinds wine catalogue in Redis to avoid hitting the external API on every request. In **development** and **test** the endpoint returns the local `wines.json` file and Redis is not used.

1. On the first production request Redis is empty — the backend fetches wines from the GrapeMinds API and stores the result under the key `grapeminds:wines` with a TTL of 60 days.
2. On subsequent requests the cached JSON is returned directly from Redis, with no external API call.
3. After 60 days the key expires and the next request refreshes the cache from the API.

The Redis client (`back/utils/redis.js`) uses the `REDIS_URL` environment variable in production (Upstash), or `REDIS_HOST` / `REDIS_PORT` locally.

**Running Redis locally (production-mode testing only):**

```bash
docker run --name knowwine-redis -p 6379:6379 -d redis:7
# or: docker start knowwine-redis
```

Set `NODE_ENV=production` in `back/.env`, then start the backend normally. To inspect the cache:

```bash
docker exec -it knowwine-redis redis-cli
> GET grapeminds:wines   # returns cached JSON or (nil) if empty
> TTL grapeminds:wines   # seconds remaining
> DEL grapeminds:wines   # force a cache refresh on next request
```

---

## Deployment

### Production services

| Service  | Provider                                        |
| -------- | ----------------------------------------------- |
| Hosting  | [Render.com](https://render.com) (Web Service)  |
| Database | [Aiven](https://aiven.io) – PostgreSQL          |
| Cache    | [Upstash](https://upstash.com) – Redis          |

### CI/CD pipeline

Every push to `master` triggers the pipeline defined in `.github/workflows/pipeline.yml`.

```
git push master
    │
    ├── GitHub Actions: run tests
    │     ├── Backend integration tests  (node:test + supertest + PostgreSQL container)
    │     └── Frontend unit tests        (Vitest)
    │
    ├── [tests pass] ──► curl Render deploy hook ──► Render builds & deploys
    └── [tests fail] ──► deploy blocked, production unchanged
```

Pull requests to `master` also run the tests, but never trigger a deploy.

**Required setup:**

1. Render Dashboard → Settings → Auto-Deploy → **No** (otherwise Render deploys before tests run)
2. Render Dashboard → Settings → Deploy Hook → copy URL → add as GitHub Secret `RENDER_DEPLOY_HOOK_URL`

### Manual deploy

```bash
cd back
npm run build:ui    # builds front/dist and copies it to back/dist
npm run deploy:full # build:ui + git add + git commit + git push
```

### Setting up production from scratch

**1. PostgreSQL – Aiven**
1. Create an account at [aiven.io](https://aiven.io) and create a free PostgreSQL service
2. Copy the **Service URI** — this is your `DATABASE_URL`
3. Tables are created automatically on first backend start

**2. Redis – Upstash**
1. Create an account at [upstash.com](https://upstash.com)
2. Create a Redis database (region closest to your Render region)
3. Copy the **Redis URL** — this is your `REDIS_URL`

**3. Render – Web Service**
1. New → Web Service → connect your GitHub repository
2. Set the following:

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Build Command | `cd front && npm ci && npm run build && cd ../back && cp -r ../front/dist . && npm ci` |
| Start Command | `node index.js` |
| Root Directory | *(leave empty)* |

3. Add environment variables:

```
NODE_ENV=production
DATABASE_URL=<Aiven Service URI>
DB_SSL=true
SECRET=<a long random string, e.g. openssl rand -hex 32>
GRAPEMINDS_URL=https://api.grapeminds.eu/public/v1
GRAPEMINDS_API_KEY=<your GrapeMinds API key>
REDIS_URL=<Upstash Redis URL>
```

> **Note:** The free Render tier spins down after 15 minutes of inactivity. The first request after idle takes ~30 seconds to wake up.

---

## Todo

- [ ] Filtering wines
- [ ] User administration panel (admin)
- [ ] Second external wine API integration
- [ ] Map of wine regions with pop-ups
- [ ] RAG AI wine recommendation page
- [ ] Rating system for My Wines
- [ ] Wine poems
- [ ] Docker Compose setup for local development

## Done

- [x] CI/CD pipeline (GitHub Actions → Render deploy hook)
- [x] Styles with Material UI
- [x] Redis caching for wine catalogue (production, 60-day TTL, ioredis + Upstash)
- [x] Frontend component tests (Vitest + React Testing Library)
- [x] E2E tests (Playwright)
- [x] External wine API integration (GrapeMinds)
- [x] Navigation with React Router (BrowserRouter)
- [x] JWT token authentication and login/logout
- [x] Backend integration tests (mywines + users)
- [x] ESLint and Prettier
- [x] Project setup: React (TypeScript) frontend + Express backend connected
- [x] PostgreSQL database integration
- [x] My Wines: add, list, view, and delete wines (backend + frontend)
- [x] Axios API calls extracted into service modules
- [x] Backend structure: `app.js`, `controllers/`, `models/`, `utils/`
- [x] API security: rate limiting, input validation, request size limits
- [x] Deployed to internet (Render.com)
