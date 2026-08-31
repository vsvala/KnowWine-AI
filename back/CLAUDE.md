# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This directory (`back/`) is the backend of a two-package monorepo rooted one
level up (`KnowWine-AI/`, sibling `front/` = React/TypeScript/Vite SPA). The
git repository root is `KnowWine-AI/`, not `back/` — `git status`/`git diff`
from here will show `../front/...` paths too. See the root
[`CLAUDE.md`](../CLAUDE.md) for repo-wide conventions; this file only covers
the backend.

**`back/README.md` is the canonical architecture document** — request
lifecycle, domain sequence diagrams (login, wine browsing, wine search, wine
detail, my-wines CRUD) plus a route table for user management/roles (§5.5),
the target controller/service/model layering, security posture, known
issues, and four ADRs (Drizzle ORM adoption; the 5-page catalogue browsing
cap; Photon for reverse geocoding; role-based access control for user
management). Read it before making non-trivial changes instead of
re-deriving architecture from source — this file only adds what that
document doesn't cover (commands, conventions, and things that have
drifted since it was last updated).

## Commands

```bash
npm run dev              # node --watch, NODE_ENV=development
npm start                # production start, NODE_ENV=production
npm test                 # NODE_ENV=test node --test --test-concurrency=1
npm run lint              # eslint .
npm run format            # prettier . --write
npm run format:check      # prettier . --check
```

Run a single test file or test case with Node's built-in test runner directly
(the `test` script above is just this with `--test-concurrency=1` and
`NODE_ENV=test` baked in):

```bash
NODE_ENV=test node --test tests/users_api_test.js
NODE_ENV=test node --test --test-name-pattern="creates a new user" tests/users_api_test.js
```

`--test-concurrency=1` is intentional, not a default left in place — tests
hit the same real Postgres database and run destructive setup/teardown per
file, so parallel files would race on shared tables.

`npm run build:ui` and `npm run deploy:full` are wired to the frontend build
and to `git add . && git commit && git push` respectively — treat
`deploy:full` as a real push to shared history, not a routine dev command.

## Environment & local test database

Required vars are documented inline in `env.example` (copy to `.env`); the
process refuses to boot without `SECRET` or `REFRESH_TOKEN_SECRET`
(`index.js`) — this bit CI once already: the e2e job's "Start backend" step
in `.github/workflows/pipeline.yml` must set both, not just `SECRET`.
`NODE_ENV=test` reads
`TEST_DATABASE_URL` instead of `DATABASE_URL` (`utils/config.js`).

CI (`.github/workflows/pipeline.yml`) runs tests against a throwaway
`postgres:16` container mapped to host port **5433**, database
`knowwine_test`, user/password `postgres`/`postgres`. Match that locally
(e.g. `docker run -p 5433:5432 -e POSTGRES_PASSWORD=postgres -e
POSTGRES_DB=knowwine_test postgres:16`) and point `TEST_DATABASE_URL` at it —
there's no committed docker-compose file, this is the CI service definition
translated to a local run. Schema is created by `utils/db.js#initDb()` on
connect (`CREATE TABLE IF NOT EXISTS` — no migration tool; see the Drizzle
ADR in the README if you're touching schema).

Redis and GrapeMinds calls are skipped entirely outside `NODE_ENV=production`
(see below) — no local Redis needed for dev or test.

## Architecture essentials

- Plain CommonJS (`require`/`module.exports`), no TypeScript, no bundler —
  don't introduce ESM `import` syntax or add a build step for this package.
- Current layering per domain (`wines`, `mywines`, `login`, `users`) is
  `controllers/<domain>.js` (Express `Router` — routing _and_ handler logic
  merged) → `services/<domain>Service.js` (business logic, no `req`/`res`) →
  `models/*.js` (raw parameterized SQL via `pg`, no ORM). All four domains
  are already fully migrated to this split; the only remaining reshuffle is
  extracting routing into a dedicated `routes/` layer (README §2.1) — that's
  a pure code-organization move, not a business-logic change.
- `utils/authenticate.js` is the one shared JWT-verification middleware,
  applied per-route (not globally) to the `mywines` and `users` routers that
  need it. It re-fetches the user from the DB on every request rather than
  trusting the token payload for authorization.
- `services/wineService.js` branches hard on `NODE_ENV`: outside production
  it serves the local `wines.json` fixture (search/browse/detail all read
  from it, ignoring pagination), so nothing in the wine-catalogue path talks
  to Redis or GrapeMinds in dev/test. In production it proxies to the
  GrapeMinds API through Redis-cached lookups, with catalogue _browsing_
  hard-clamped server-side to pages 1–5 (`MAX_BROWSABLE_PAGES`) and a
  250-request/month quota tracked in Redis — see
  [ADR-002](../docs/adr.md#adr-002-bound-catalogue-browsing-to-5-pages-instead-of-full-pagination)
  before changing that bound; it's a deliberate quota-safety cap, not an
  oversight.
- All unexpected errors funnel through `next(error)` to the centralized
  `errorHandler` in `utils/middleware.js`, which maps Postgres unique-
  violation and JWT errors to specific status codes and everything else to a
  generic 500 (no stack traces leaked to clients).

## Conventions

- ESLint (`eslint.config.mjs`) + Prettier enforce single quotes, semicolons,
  Unix linebreaks, and route Prettier's own diffs through `eslint-plugin-prettier`
  (`prettier/prettier: 'error'`) — run `npm run lint` before considering
  backend work done, not just `format`.
- `express-validator` (`utils/validate.js#handleValidationErrors`) backs
  `POST` body validation in `controllers/users.js` and `controllers/mywines.js`.
  `controllers/login.js` and every `:id` route param still use hand-rolled
  checks (`Number(req.params.id)` + `Number.isNaN`) instead — known
  inconsistency tracked in the README's Known Issues, not a pattern to copy
  into new code.
- Add tests for new API endpoints.
