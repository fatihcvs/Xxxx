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
pnpm db:seed                    # starter city, venues, skills, genres, jobs, books

# Run
pnpm dev                        # web on http://localhost:3000
pnpm dev:worker                 # world heartbeat (needs Redis)
```

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

## Roadmap (phased)

- **Phase 0–1 (done):** infra, world clock, character + meters, city/venue
  navigation, actions, jobs, shop, i18n, auth, heartbeat worker.
- **Phase 2:** timed skill learning, university, masters, attribute XP, weekly
  Friday paydays, rent.
- **Phase 3:** bands, stage roles, song composing, rehearsals, concerts, fame.
- **Phase 4:** CD releases, charts, radio, reviews, awards.
- **Phase 5:** relationships, messaging, marriage, children, aging → heir.
- **Phase 6:** real estate, businesses, city politics, VIP.
- **Phase 7:** procedural NPC world, balancing, more cities, deployment.

The engine formulas for song quality and concert outcomes already exist in
`packages/game-engine` and are unit-tested.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Run the web app |
| `pnpm dev:worker` | Run the heartbeat worker (Redis) |
| `pnpm --filter @fameworld/worker once` | Run one heartbeat sweep (no Redis) |
| `pnpm db:migrate` / `pnpm db:seed` | Migrate / seed the database |
| `pnpm test` | Run game-engine unit tests |
| `pnpm typecheck` | Typecheck every package |
