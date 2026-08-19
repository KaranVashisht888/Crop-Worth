# Mainproject2 — Farmer-Buyer Produce Marketplace

**Live**: [mainproject2-ten.vercel.app](https://mainproject2-ten.vercel.app)
(API: [farmermarket-api-msm2.onrender.com](https://farmermarket-api-msm2.onrender.com))

> The API is on Render's free tier, which spins down after 15 minutes idle —
> the first request after a quiet period can take 30-60s to wake it up.
> That's expected, not a bug.

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

## Market price data

`GET /api/prices` reads from the local `PriceSnapshot` table only - never a
live external call. Two ways to populate it:

- **Real data** (`scraper/scrape_agmarknet.py`): pulls from data.gov.in's
  official mandi price API. Needs a free `DATA_GOV_IN_API_KEY` - register at
  data.gov.in (My Account → API Keys), then run:
  ```bash
  cd scraper
  python -m venv .venv && .venv/Scripts/activate  # or source .venv/bin/activate
  pip install -r requirements.txt
  cp .env.example .env  # fill in DATABASE_URL and DATA_GOV_IN_API_KEY
  python scrape_agmarknet.py
  ```
  Agmarknet's own site (agmarknet.gov.in) now requires solving a CAPTCHA for
  automated requests, which this project won't attempt to bypass - hence
  going through data.gov.in's sanctioned API instead, which serves the same
  underlying data.

- **Placeholder seed data** (no key needed, for demos): `npm run db:seed`
  from `apps/server` inserts realistic reference prices for the crops this
  marketplace lists. Rows are clearly labeled
  `source: "seed-data (placeholder...)"` so they're never mistaken for real
  data.

## Deployment

- **Database**: [Neon](https://neon.tech) (serverless Postgres, free tier
  never expires — unlike most free-tier Postgres offerings, which is why
  it's the pick here over the hosting provider's own database).
- **API + WebSocket server**: [Render](https://render.com), driven by the
  `render.yaml` Blueprint at the repo root. Render's free web service tier
  does support WebSocket connections (verified against their docs before
  picking it — plenty of "free tier" comparisons online claim otherwise and
  are wrong or outdated). It does spin down after 15 minutes idle and takes
  ~30-60s to wake on the next request — normal free-tier behavior, worth
  mentioning up front in a live demo.
- **Frontend**: [Vercel](https://vercel.com), root directory `apps/client`.
  `vercel.json` adds the SPA rewrite React Router needs (Vercel's Vite
  preset doesn't add this automatically).
- **Scraper**: unchanged — GitHub Actions cron, pointed at the same Neon
  `DATABASE_URL` via a repo secret.

**Known limitation**: listing photo uploads use local disk storage
(`apps/server/uploads/`, via Multer), per the project's original scope (no
external storage service). Render's free tier has an ephemeral filesystem,
so uploaded photos are lost on restart/redeploy. In a production build
this would swap the storage adapter for S3-compatible object storage; kept
local here deliberately, matching the project's stated constraints.

**Order of operations** (there's a real dependency chain — the backend
needs to exist before the frontend can point at it, and the backend's CORS
config needs the frontend's final URL):
1. Create the Neon project, copy its connection string.
2. In Render, "New Blueprint Instance" → connect this repo → it reads
   `render.yaml` → fill in `DATABASE_URL` (from Neon), `JWT_ACCESS_SECRET`,
   `JWT_REFRESH_SECRET` (long random strings — not the dev placeholders),
   and a placeholder `CLIENT_ORIGIN` for now.
3. Once the Render service is live, copy its URL.
4. In Vercel, import the repo, set root directory to `apps/client`, add
   env var `VITE_API_URL` = `https://<render-url>/api`.
5. Copy the resulting Vercel URL back into Render's `CLIENT_ORIGIN` env var
   and redeploy the backend so CORS and the refresh-token cookie's
   cross-site settings match the real frontend origin.
