# Fameworld worker (simulation heartbeat) — build from the monorepo root:
#   docker build -f apps/worker/Dockerfile -t fameworld-worker .
FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/db/package.json packages/db/
COPY packages/game-engine/package.json packages/game-engine/
COPY packages/i18n/package.json packages/i18n/
COPY apps/web/package.json apps/web/
COPY apps/worker/package.json apps/worker/
RUN pnpm install --frozen-lockfile

FROM base AS run
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @fameworld/db generate
# Runs the BullMQ + Redis heartbeat daemon.
CMD ["pnpm", "--filter", "@fameworld/worker", "start"]
