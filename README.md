# Mainproject2 — Farmer-Buyer Produce Marketplace

A live-bidding marketplace connecting farmers directly to intermediary buyers.
Farmers list crops with a reserve price; buyers place open, real-time bids
within a time-boxed auction window; farmers accept whichever bid they trust,
weighing amount against the buyer's reliability score.

## Why this project

Most student marketplace projects target consumers who already have plenty of
options. This targets farmers — an underserved group with real information
asymmetry around fair pricing — and treats the auction mechanics (reserve
price, live bidding, reliability scoring) as the core engineering problem,
not an afterthought.

## Stack

- **Client**: React (Vite) + Tailwind CSS + react-i18next (English/Hindi)
- **Server**: Node.js + Express + Socket.IO
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Self-issued JWT (access + rotating refresh tokens), bcrypt
- **Market price data**: Scheduled Python scraper (separate from the live
  app) writes into a `PriceSnapshot` table; the app only ever reads that
  local table — no live external API calls at runtime.

## Repo layout

```
apps/client/    React frontend
apps/server/    Express API + WebSocket server + Prisma schema
scraper/        Standalone Python scraper (Agmarknet/data.gov.in), run on a
                schedule via GitHub Actions — not called by the live app
```

## Local setup

Requires Node.js 18+, Python 3.10+, and Docker (for local Postgres).

```bash
# 1. Database
docker compose up -d

# 2. Server
cd apps/server
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev

# 3. Client
cd apps/client
npm install
npm run dev
```

## Local Postgres without Docker

If Docker isn't available, use the portable PostgreSQL binaries instead of
`docker compose`:

```bash
# One-time setup
mkdir .tools
curl -L -o .tools/postgres.zip https://get.enterprisedb.com/postgresql/postgresql-16.15-1-windows-x64-binaries.zip
# extract to .tools/pgsql, then:
.tools/pgsql/bin/initdb -D .tools/pgdata -U farmermarket -A trust --encoding=UTF8
.tools/pgsql/bin/pg_ctl -D .tools/pgdata -l .tools/pg.log -o "-p 5433" start
.tools/pgsql/bin/createdb -U farmermarket -h 127.0.0.1 -p 5433 farmermarket
.tools/pgsql/bin/psql -U farmermarket -h 127.0.0.1 -p 5433 -d farmermarket -c "ALTER ROLE farmermarket WITH PASSWORD 'farmermarket';"
```

Then in `apps/server/.env`, point `DATABASE_URL` at port `5433` instead of
`5432`. `.tools/` is git-ignored — it's a local dev convenience, not part of
the deployable app. To stop the DB: `.tools/pgsql/bin/pg_ctl -D .tools/pgdata stop`.

## Status

Work in progress — see commit history for feature-by-feature build order:
auth → listings → bidding/WebSockets → scraper → advisory tips → i18n →
dashboards.
