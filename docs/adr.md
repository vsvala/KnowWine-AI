# Architecture Decision Records (ADRs)

Short log of decisions that aren't obvious from reading the code alone —
what was chosen, why, and what was given up. One decision per `###`
section, numbered sequentially (`ADR-001`, `ADR-002`, ...) and never
renumbered or deleted once merged — if a decision is later reversed, add a
new ADR that supersedes it and mark the old one's Status accordingly,
rather than editing history away.

This file is shared by the whole monorepo (`back/` and `front/`) — a
decision only needs its own ADR here if it's genuinely architectural
(shapes how future work has to fit in, trades one quality for another, or
would be non-obvious to someone reading the code cold). Routine
implementation choices, bug fixes, and refactors that don't change the
shape of anything don't need one. See the root
[`CLAUDE.md`](../CLAUDE.md#architecture-decision-records) for the format
and the process for adding a new entry.

## ADR-001: Adopt Drizzle ORM for schema migrations and query building

**Status:** Proposed (not yet implemented — tracks
[Known Issue §8.3](../back/README.md#8-known-issues--technical-debt))

**Context:** Data access is hand-written parameterized SQL via `pg`
directly in `models/` (the repository layer, back/README.md §2.3). Schema
is created ad-hoc by `CREATE TABLE IF NOT EXISTS` in
`utils/db.js#initDb()` on every boot — no versioned migrations, no
rollback path. The backend is plain CommonJS JavaScript (no TypeScript),
runs on Render's free tier (spins down after 15 min idle, ~30s cold-start
wake per back/README.md's Deployment section), and talks to Neon
serverless PostgreSQL.

**Decision:** Introduce **Drizzle ORM** + **`drizzle-kit`** for schema
definition, versioned migrations, and query building, replacing the
hand-rolled SQL in `models/` incrementally (one table at a time —
`users` first, then `my_wines`).

**Why Drizzle over Prisma:**

- **No separate query-engine process.** Drizzle is a thin, compiled
  wrapper over the driver — it doesn't spin up an additional engine on
  cold start. That matters concretely here: this project already pays a
  cold-start tax on Render's free tier, so anything that adds engine
  startup latency on top of that is a cost worth avoiding.
- **First-class Neon HTTP driver** (`drizzle-orm/neon-http`) — a
  fetch-based, stateless driver built specifically for serverless Postgres
  like Neon, with no connection-pool warm-up needed after a cold start.
- **Stays close to SQL.** The query builder mirrors the parameterized SQL
  already written by hand in `models/`, so the repository layer becomes
  typed and composable without being hidden behind a fully generated
  client — smaller conceptual jump, and dropping to raw SQL for an
  edge case stays easy.
- **Closes Known Issue §8.3 directly** — `drizzle-kit` produces versioned,
  diffable migration files with a rollback path, replacing the ad-hoc
  `CREATE TABLE IF NOT EXISTS` startup logic.
- **No TypeScript dependency.** Prisma's headline benefit — a generated,
  fully-typed client — buys little in a plain-JS backend; Drizzle's
  runtime-footprint advantage holds regardless of TS.

**Consequences:**

- Smaller ecosystem than Prisma: less Stack Overflow coverage, no
  Prisma Studio-equivalent GUI out of the box, docs are good but younger.
- `models/` gets rewritten file-by-file against Drizzle's query builder —
  mechanical but not free; sequence it one table at a time rather than a
  big-bang rewrite so `mywines`/`users` tests keep passing throughout.
- The first `drizzle-kit` migration must snapshot the _current_ schema
  before any new `ALTER TABLE` lands, or the migration history starts
  from a false baseline.

**Alternatives considered:**

- **Prisma** — more mature tooling, generated client, Prisma Studio for
  ad-hoc DB inspection. Rejected primarily for the added engine-layer
  weight on a spin-down-prone free host; revisit if the backend adopts
  TypeScript (where Prisma's generated types pay off more) or if admin/DB
  inspection tooling becomes a real need.
- **`node-pg-migrate`** — migrations only, no query builder; would have
  closed §8.3 alone but left the hand-rolled SQL in `models/` untouched.
  Rejected because it solves only half the problem this ADR addresses.

## ADR-002: Bound catalogue browsing to 5 pages instead of full pagination

**Status:** Implemented

**Context:** GrapeMinds' real catalogue has ~264,700 wines across ~2,650
pages of 100 at `GET /wines?per_page=100&page=N`. The app's plan caps
usage at **250 requests/month**. Browsing was originally hardcoded to
`page=1` only (back/README.md §8, resolved) — the naive fix would be to
loop through every page and persist the whole catalogue, but that alone
costs ~2,650 requests, more than 10x the entire monthly budget, in a
single run.

**Decision:** Clamp browsing server-side to pages **1–5**
(`MAX_BROWSABLE_PAGES` in `wineService.js`), each cached under its own
Redis key with a 60-day TTL. This bounds worst-case first-time cost to 5
requests total (then free until the cache expires), and bounds it
_predictably_ — unlike search, where a user can type arbitrarily many
distinct terms, "browsing" has a hard, known ceiling of 5 page-loads
regardless of how many users click through it.

**Why not full pagination:** Sequential pages share no cache-reuse
advantage the way popular search terms do — every new page is a
guaranteed cache miss the first time, and a single user clicking "next"
through the catalogue could exhaust the entire month's quota alone (see
the frontend's pagination UI, capped at 5 pages in lockstep with this
server-side bound). Search (back/README.md §5.2b) is the quota-efficient
path to the rest of the catalogue — it proxies to GrapeMinds' own
`/wines/search`, so a user reaches exactly the wines they're looking for
at a cost of one request per distinct search term, not one per page of
everything.

**Consequences:**

- Only 500 of ~264,700 wines are ever browsable via the paginated table;
  the rest are reachable only through search. This is a deliberate
  product tradeoff, not an oversight.
- If traffic ever justifies more browsable depth, the fix is a slow,
  budget-aware background expansion (e.g. 1-2 new pages/day) rather than
  raising `MAX_BROWSABLE_PAGES` outright — see back/README.md
  [§9 Recommended Next Steps](../back/README.md#9-recommended-next-steps).

**Alternatives considered:**

- **Full pagination (all ~2,650 pages)** — rejected outright; costs more
  than 10x the monthly quota to populate once, before counting search or
  wine-detail traffic.
- **Persisting the catalogue to PostgreSQL instead of Redis-only** —
  would remove the "TTL expiry forces a repeat paid call" risk, and is
  worth revisiting if catalogue depth becomes a real product requirement,
  but wasn't necessary to fix the immediate page-1-only bug.

## ADR-003: Use Photon for reverse geocoding, unkeyed and uncached

**Status:** Implemented

**Context:** The Home page (`front/src/pages/Home.tsx`) resolves the
user's browser geolocation coordinates to a place name ("Helsinki,
Finland") to show alongside the globe. This needs a reverse-geocoding
service — something that isn't part of MapLibre or the GrapeMinds
integration, and wasn't needed anywhere else in the app before this
feature.

**Decision:** Call [Photon](https://photon.komoot.io/) (Komoot's
open-source, OpenStreetMap-based geocoder) from the backend
(`back/services/locationService.js`), proxied through `GET /api/location`
rather than called from the browser. No API key, no request signing, no
usage cap enforced on our side — see `back/README.md` §5.4 for the request
flow and `front/docs/ARCHITECTURE.md` §12 for the client side.

**Why Photon over the alternatives:**

- **Nominatim (OpenStreetMap's own instance)** — also free and keyless,
  but its usage policy caps the public instance at 1 request/second and
  explicitly discourages any non-trivial production traffic without
  self-hosting. Photon's public instance carries the same "best-effort,
  no SLA" caveat but doesn't impose that hard per-second ceiling.
- **MapTiler / Mapbox Geocoding** — better reliability and an actual SLA,
  but both require an API key and a paid account past a small free tier.
  For a single, low-traffic "show me my region" feature on the landing
  page, that setup cost wasn't judged worth it yet.

**Consequences:**

- No SLA: Photon's public instance can and does return `503`s under load
  (observed directly during development — see `back/README.md` §5.4 and
  [Known Issue §8.6](../back/README.md#8-known-issues--technical-debt)).
  The frontend must treat "no place name" as an expected, handled state,
  not an edge case.
- No caching and no rate-limiting on the backend side — every page load
  that gets geolocation permission re-hits Photon. Fine at current
  (demo/personal-project) traffic; the same shape of problem GrapeMinds
  hit before ADR-002's quota system, and the fix would be the same shape
  (cache by rounded coordinates, since exact-coordinate cache keys would
  almost never hit).
- Precise coordinates are sent to a third party (Photon) from the
  backend. Routing the call through the backend rather than the browser
  keeps the CSP intact and keeps the raw coordinates off the wire to a
  host the user hasn't been told about directly — see `back/README.md`
  §5.4 — but Photon itself still receives them server-side.

**Alternatives considered:**

- **Nominatim** — rejected for this use case due to the 1 req/s public
  usage cap; revisit if traffic ever requires a paid/self-hosted option
  where a stricter but keyless service becomes viable again.
- **MapTiler / Mapbox Geocoding** — rejected for now due to the added
  API-key/paid-tier setup cost relative to a single low-traffic feature;
  worth revisiting if reverse geocoding becomes more central to the app
  (e.g. tagging saved wines by region) rather than a landing-page detail.
