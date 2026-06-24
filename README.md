# KnowWine AI

A web app for discovering and managing wines. Browse a wine catalogue from the GrapeMinds API, and keep a personal list of your favourite wines.

## Features

- Browse a wine catalogue with details like colour, type, sub-type, producer, and region
- Personal "My Wines" list — add and delete wines with name and description
- JWT-based user authentication (login/logout, token stored in localStorage)
- User registration with input validation
- Rate limiting and request size limits on the backend

## Production

**Live app:** https://knowwine-ai.onrender.com/

| Service  | Provider                                        |
| -------- | ----------------------------------------------- |
| Hosting  | [Render.com](https://render.com) (Web Service)  |
| Database | [Aiven](https://aiven.io) – PostgreSQL          |
| Cache    | [Upstash](https://upstash.com) – Redis          |

## CI/CD pipeline

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

### How it works

| Step | What happens |
| --- | --- |
| `actions/checkout@v4` | GitHub clones the repo onto a fresh Ubuntu VM |
| `actions/setup-node@v4` | Installs Node.js 22 on the VM |
| `services: postgres` | GitHub starts a PostgreSQL 16 Docker container alongside the VM on port 5433 |
| `npm ci` | Installs exact dependency versions from `package-lock.json` |
| `npm test` (back) | Runs integration tests against the temporary PostgreSQL container |
| `npm test` (front) | Runs Vitest component tests (no server needed) |
| `curl RENDER_DEPLOY_HOOK_URL` | Notifies Render to build and deploy the new code |

The deploy step only runs when **all tests pass** and the event is a direct push to `master` (not a pull request).

### Required setup

**1. Disable Render auto-deploy**
Render Dashboard → Settings → Auto-Deploy → **No**
(otherwise Render deploys immediately on push, before tests have a chance to run)

**2. Add Render Deploy Hook as a GitHub Secret**
- Render Dashboard → Settings → Deploy Hook → copy the URL
- GitHub repo → Settings → Secrets and variables → Actions → New repository secret
  - Name: `RENDER_DEPLOY_HOOK_URL`
  - Value: the copied URL

## Tech stack

| Layer    | Technology                                     |
| -------- | ---------------------------------------------- |
| Frontend | React (TypeScript), Vite, Axios                |
| Backend  | Node.js, Express 5                             |
| Database | PostgreSQL (Aiven)                             |
| Cache    | Redis (ioredis + Upstash) — production only    |
| Auth     | JWT (`jsonwebtoken`), bcrypt                   |
| Deploy   | render.com (backend serves the built frontend) |

## Project structure

```
KnowWine/
├── back/                  # Express backend
│   ├── controllers/       # Route handlers (login, mywines, users)
│   ├── models/            # Database query functions (mywine, user)
│   ├── utils/             # Config, DB connection, middleware
│   ├── tests/             # Backend integration tests
│   ├── wines.json         # Static wine catalogue (GrapeMinds data)
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
- PostgreSQL running locally (or Docker)

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

`REDIS_HOST` and `REDIS_PORT` default to `localhost` and `6379` if not set. Redis is only used in `production` mode — in `development` and `test` the wine catalogue is served from the local `wines.json` file, so Redis is not required for local dev.

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

## Running backend integration tests

Tests use a separate PostgreSQL Docker container so they never touch the development database.

### First time setup

```bash
docker run --name knowwine-test -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=knowwine_test -p 5433:5432 -d postgres:16
```

### Every time before running tests

Make sure the container is running:

```bash
docker start knowwine-test
```

Check it is running:

```bash
docker ps
```

### Run tests

```bash
cd back
npm test
```

The test suite automatically creates tables, wipes them, and reseeds before each test. Covers GET, POST, and DELETE for both the `mywines` and `users` endpoints.

### Stop the container when done

```bash
docker stop knowwine-test
```

Data is preserved between restarts. Only `docker rm knowwine-test` deletes it permanently.

---

## Redis caching

In **production**, the `GET /api/wines` endpoint caches the GrapeMinds wine catalogue in Redis to avoid hitting the external API on every request. In **development** and **test** the endpoint returns the local `wines.json` file and Redis is not used.

### How it works

1. On the first production request Redis is empty — the backend fetches wines from the GrapeMinds API and stores the result under the key `grapeminds:wines` with a TTL of 60 days.
2. On subsequent requests the cached JSON is returned directly from Redis, with no external API call.
3. After 60 days the key expires and the next request refreshes the cache from the API.

The Redis client is configured in `back/utils/redis.js` using [ioredis](https://github.com/redis/ioredis). In production the connection is controlled by the `REDIS_URL` environment variable (Upstash). In local mode `REDIS_HOST` and `REDIS_PORT` are used instead (defaults: `localhost`, `6379`).

### Running Redis locally (production-mode testing only)

```bash
docker run --name knowwine-redis -p 6379:6379 -d redis:7
```

Or start an existing container:

```bash
docker start knowwine-redis
```

Set `NODE_ENV=production` in `back/.env` to activate the Redis path, then start the backend normally.

To inspect the cache:

```bash
docker exec -it knowwine-redis redis-cli
> GET grapeminds:wines   # returns cached JSON or (nil) if empty
> TTL grapeminds:wines   # seconds remaining
> DEL grapeminds:wines   # force a cache refresh on next request
```

---

## Running frontend component tests

Tests use Vitest with jsdom and React Testing Library. No database or running server needed.

```bash
cd front
npm test
```

### Coverage report

```bash
npm test -- --coverage
```

This generates a coverage summary in the terminal and an HTML report in `front/coverage/index.html`.

### What is tested

| File             | Test                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| `MyWine.tsx`     | Renders wine name and description                                     |
| `MyWineForm.tsx` | Typing into fields and submitting calls `addWine` with correct values |

Tests live in `front/tests/` and use `MemoryRouter` to satisfy React Router's routing context.

---

## Running E2E tests (Playwright)

E2E tests are **not part of the CI pipeline** — run them manually before committing significant UI changes.

They require both the backend and frontend dev server to be running simultaneously.

### 1. Start the backend

```bash
cd back
npm run dev
```

### 2. Start the frontend (separate terminal)

```bash
cd front
npm run dev
```

### 3. Run the tests (third terminal)

```bash
cd front
npm run test:e2e
```

### View the last test report

```bash
cd front
npm run test:report
```

Test files live in `front/tests/e2e/` and cover navigation, home page, and the wine catalogue.

---

## Deployment

Live at **https://knowwine-ai.onrender.com/**

The backend serves the built frontend as static files from `back/dist`. Both frontend and backend are deployed as a single Render Web Service.

### Manual deploy (current workflow)

```bash
cd back
npm run build:ui    # builds front/dist and copies it to back/dist
npm run deploy:full # build:ui + git add + git commit + git push
```

Render detects the push and redeploys automatically.

---

### Setting up production from scratch

#### 1. PostgreSQL – Aiven

1. Create an account at [aiven.io](https://aiven.io) and create a free PostgreSQL service
2. Copy the **Service URI** from the connection details — this is your `DATABASE_URL`
3. Tables are created automatically on first backend start (`back/utils/db.js`)

#### 2. Redis – Upstash

1. Create an account at [upstash.com](https://upstash.com)
2. Create a new Redis database (region closest to your Render region)
3. Copy the **Redis URL** from the database details page — this is your `REDIS_URL`
4. The wine catalogue is cached under the key `grapeminds:wines` with a 60-day TTL

#### 3. Render – Web Service

1. Create an account at [render.com](https://render.com)
2. New → Web Service → connect your GitHub repository
3. Set the following:

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Build Command | `cd front && npm ci && npm run build && cd ../back && cp -r ../front/dist . && npm ci` |
| Start Command | `node index.js` |
| Root Directory | *(leave empty)* |

4. Add environment variables under **Environment**:

```
NODE_ENV=production
DATABASE_URL=<Aiven Service URI>
DB_SSL=true
SECRET=<a long random string, e.g. openssl rand -hex 32>
GRAPEMINDS_URL=https://api.grapeminds.eu/public/v1
GRAPEMINDS_API_KEY=<your GrapeMinds API key>
REDIS_URL=<Upstash Redis URL>
```

5. Click **Deploy** — Render will build and start the app

#### 4. Verify the deployment

```bash
# Health check — should return the wine catalogue JSON
curl https://knowwine-ai.onrender.com/api/wines

# Check Redis cache (from Upstash console → Data Browser → key: grapeminds:wines)
```

> **Note:** The free Render tier spins down after 15 minutes of inactivity. The first request after idle takes ~30 seconds to wake up.

---

## Todo

- [ ] more wine parameters and more form fields for them
- [ ] Filtering wines
- [ ] User administration panel (admin)
- [ ] Tests for frontend and end-to-end
- [ ] Styles

- [ ] Second external wine API integration
- [ ] Map of wine regions with pop-ups
- [ ] RAG AI wine recommendation page
- [ ] Rating system for My Wines
- [ ] Wine poems
- [ ] Docker Compose setup for local development

## Done

- [x] Styles with Material UI
- [x] Redis caching for wine catalogue (production, 60-day TTL, ioredis)
- [x] Frontend component tests (Vitest + React Testing Library)
- [x] External wine API integration (GrapeMinds)
- [x] Navigation with React Router (BrowserRouter)
- [x] JWT token authentication and login/logout
- [x] Backend integration tests (mywines + users)
- [x] ESLint and Prettier
- [x] Project setup: React (TypeScript) frontend + Express backend connected
- [x] PostgreSQL database integration
- [x] My Wines: add, list, view, and delete wines (backend + frontend)
- [x] Axios API calls extracted into service modules (`myWines.ts`, `wineList.ts`, etc.)
- [x] Footer component
- [x] CSS styling
- [x] Backend structure: `app.js`, `controllers/`, `models/`, `utils/`
- [x] API security: rate limiting, input validation, request size limits
- [x] Deployed to internet (render.com)
- [x] CI/CD: build + deploy scripts (`build:ui`, `deploy:full`)
