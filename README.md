# KnowWine AI

Learn about wines

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
```

### 3. Install dependencies

```bash
cd back && npm install
cd ../front && npm install
```

### 4. Start the backend

```bash
cd back
node index.js
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

Tests use a local PostgreSQL Docker container instead of the production database.

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

The test suite will automatically create the `my_wines` table if it does not exist, wipe it, and reseed it before each test. Covers GET, POST, and DELETE endpoints.

### Stop the container when done

```bash
docker stop knowwine-test
```

Data is preserved between restarts. Only `docker rm knowwine-test` deletes it permanently.

---

## Todo

- [ ] Token authentication and sign in
- [ ] User administration
- [ ] Tests for frontend and end-to-end
- [ ] Navigation with React Router
- [ ] Styles with Material UI

- [ ] External wine API integration
- [ ] Map of wine areas
- [ ] Pop-ups for map
- [ ] RAG AI base wine recommendation page
- [ ] Rating for my wines
- [ ] Wine poems
- [ ] Use Docker

## Done

- [x] Tests for backend
- [x] ESLint and prettier
- [x] Project setup: React (TypeScript) frontend + Express backend connected
- [x] PostgreSQL database integration
- [x] My wines: add, list, and search wines (backend + frontend)
- [x] Axios API calls extracted into a service (`myWines.ts`)
- [x] Footer component
- [x] CSS styling
- [x] Backend structure: `app.js`, `controllers/`, `models/`, `utils/`
- [x] API security: rate limiting, input validation, size limits
- [x] Deployed to internet (render.com)
- [x] CI/CD: build + deploy scripts (`build:ui`, `deploy:full`)
