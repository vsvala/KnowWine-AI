# KnowWine AI

A web app for discovering and managing wines. Browse a wine catalogue from the GrapeMinds API, and keep a personal list of your favourite wines.

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
| Database | PostgreSQL                                     |
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
```

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

| File | Test |
| ---- | ---- |
| `MyWine.tsx` | Renders wine name and description |
| `MyWineForm.tsx` | Typing into fields and submitting calls `addWine` with correct values |

Tests live in `front/tests/` and use `MemoryRouter` to satisfy React Router's routing context.

---

## Deployment

The backend serves the built frontend as static files from `back/dist`.

Build the frontend and deploy:

```bash
cd back
npm run build:ui    # builds front/dist and copies it to back/dist
npm run deploy:full # build:ui + git commit + git push
```

Hosted on [render.com](https://render.com).

---

## Todo

- [ ] Redis for APi query caching (Back)
- [ ] User administration panel (admin)
- [ ] Tests for frontend and end-to-end
- [ ] Styles with Material UI

- [ ] Second external wine API integration
- [ ] Map of wine regions with pop-ups
- [ ] RAG AI wine recommendation page
- [ ] Rating system for My Wines
- [ ] Wine poems
- [ ] Docker Compose setup for local development

## Done

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
