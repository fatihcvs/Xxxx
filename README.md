# Fameworld

A browser-based, real-time **music-industry life-simulation MMO** (working
title). Your character is born in a city, ages, learns skills, gets a job,
forms a band, composes songs, plays concerts and builds fame — the world keeps
running while you are offline.

> **Original work.** Fameworld reimplements the *mechanics* and page-based UI
> layout of the genre from scratch. It uses only original names, assets and text
> and generates song **titles** procedurally (never lyrics). It is not
> affiliated with, and copies no assets/text/trademarks from, any existing game.

## Design

All UI/UX — every screen, component, state, animation and required asset across
all phases — is specified in **[`docs/DESIGN.md`](docs/DESIGN.md)**. Any design
tool or designer should read that file first. All visuals must be **100%
original** (no assets, logo, wordmark or icons copied from any existing game).

## Stack

- **Next.js 15** (App Router, React 19, TypeScript) + **Tailwind CSS**
- **PostgreSQL** + **Prisma**
- **Auth.js** (credentials, JWT sessions)
- **next-intl** (English + Turkish)
- **Redis** + **BullMQ** for the world "tick" worker
- **Vitest** for the pure game-engine formulas

## Monorepo layout

```
apps/web          Next.js app (UI, server actions, auth)
apps/worker       Simulation heartbeat (BullMQ + Redis; --once for cron/testing)
packages/db       Prisma schema, migrations, seed, client
packages/game-engine  Pure TS formulas (time, meters, xp, skills, song, concert)
packages/i18n     Translation messages (en / tr)
```

## Getting started

```bash
pnpm install
cp .env.example .env            # then adjust DATABASE_URL / REDIS_URL / AUTH_SECRET

# Postgres + Redis (or use your own instances)
docker compose up -d postgres redis

# Database
pnpm db:migrate                 # apply migrations
pnpm db:seed                    # cities, venues, skills, genres, jobs, courses, books
pnpm seed:npc                   # populate the world with NPC characters, bands & releases

# Run
pnpm dev                        # web on http://localhost:3000
pnpm dev:worker                 # world heartbeat (needs Redis)
```

An admin dashboard is available at `/<locale>/admin` for accounts with the
`ADMIN` role, and a health probe at `/api/health`.

### World clock

Game time runs fast: **1 in-game year = 56 real days** (configurable via
`REAL_DAYS_PER_GAME_YEAR`). Meters and age are derived on read from stored
anchors, so characters keep living while nobody is watching. Discrete events
(paydays, learning completion, concerts, births, deaths) are scheduled on the
worker.

## Core gameplay loop (implemented)

Register → create a character (born in a city, starts at 18) → walk the city →
visit venues → rest / eat to manage **Mood / Health / Energy** → apply for a job
→ buy books at the shop to raise skills. Mood or Health below 15% sends the
character to hospital; the heartbeat worker admits and discharges them.

## Roadmap (all phases implemented)

- **Phase 0–1:** infra, world clock, character + meters, city/venue navigation,
  actions, jobs, shop, i18n, auth, heartbeat worker.
- **Phase 2:** timed skill learning, university courses, attribute XP, weekly
  Friday paydays, apartment rent.
- **Phase 3:** bands, stage roles, song composing, rehearsals, concerts, fame.
- **Phase 4:** recorded releases (single/album), weekly sales, charts, royalties.
- **Phase 5:** relationships, messaging, children, aging → death → heir.
- **Phase 6:** real estate, businesses, city elections/mayor + tax, VIP.
- **Phase 7:** multiple cities, procedural NPC world, admin dashboard, deployment.
- **Phase 8–9:** 17 genres + stage roles, music videos, fan bases; 19-category
  skill tree with prerequisites and mentors.
- **Phase 10 (core):** an **achievement engine** (18 trophies hooked into every
  major system), the in-game **newspaper** (elections, chart leaders, obituaries,
  awards, press releases), **press releases** driven by the Media Manipulation
  skill, and **annual music awards** (Band/Album/Song/Artist of the Year).
- **Phase 13 (core):** a world of **50 real cities in 39 countries** (timezones,
  coordinates), inter-city **flights** (distance-based cost/duration/energy,
  real-time arrival), airports, the World page and a classic page-based UI theme.

All simulation formulas live in `packages/game-engine` and are unit-tested.

## Deployment

Both apps ship with Dockerfiles (build from the repo root):

```bash
docker build -f apps/web/Dockerfile -t fameworld-web .
docker build -f apps/worker/Dockerfile -t fameworld-worker .
```

The web image uses Next.js **standalone** output. Provide `DATABASE_URL`,
`REDIS_URL`, `AUTH_SECRET` and the `WORLD_EPOCH_*` variables at runtime. Run
migrations (`pnpm db:migrate`) against the production database before starting,
then run the web container and one worker container. Point a scheduler at the
worker daemon (BullMQ repeatable job) or invoke
`pnpm --filter @fameworld/worker once` from cron.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Run the web app |
| `pnpm dev:worker` | Run the heartbeat worker (Redis) |
| `pnpm --filter @fameworld/worker once` | Run one heartbeat sweep (no Redis) |
| `pnpm seed:npc` | Populate/top-up the procedural NPC world |
| `pnpm db:migrate` / `pnpm db:seed` | Migrate / seed the database |
| `pnpm test` | Run game-engine unit tests |
| `pnpm typecheck` | Typecheck every package |
