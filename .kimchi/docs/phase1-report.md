# Phase 1 Report: Backend Scaffold & Database

**Date:** 2026-06-14
**Status:** ✅ Complete

---

## Deliverables Completed

### 1. Root Monorepo Setup
- `package.json` with pnpm workspace scripts (dev, build, lint, typecheck, test, clean)
- `pnpm-workspace.yaml` including `apps/*` and `packages/*`
- `turbo.json` with proper pipeline config (build, dev, lint, typecheck, test, clean)
- `.env.example` with DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, PORT, AI_PROVIDER

### 2. apps/api — Hono REST API Server
- `package.json` with Hono, @hono/node-server, pg, zod, jose, typescript, tsx, vitest
- `src/index.ts` — entry point, Hono app, registered routes
- `src/routes/index.ts` — route registry with public city/place/quest endpoints
- `src/routes/healthz.ts` — GET /healthz with DB connectivity check
- `src/routes/auth.ts` — stub routes for /auth/me and /auth/callback
- `src/middleware/auth.ts` — Supabase JWT verification via jose (JWKS)
- `src/middleware/admin.ts` — role check middleware
- `src/middleware/error.ts` — global error + Zod error handling
- `src/middleware/cors.ts` — CORS middleware
- `src/middleware/index.ts` — barrel export
- `src/db/index.ts` — pg connection pool + query helpers
- `src/db/types.ts` — full TypeScript types for all DB tables
- `src/config.ts` — env config with Zod validation
- `tsconfig.json` + `tsconfig.build.json`
- `Dockerfile` — multi-stage Node 22 build
- `docker-compose.yml` — API + Postgres for local dev
- `.dockerignore`

### 3. apps/admin — Next.js Admin Dashboard
- `package.json` with Next.js 14, React, TypeScript, Tailwind CSS
- `app/layout.tsx` — root layout with metadata
- `app/page.tsx` — placeholder dashboard with navigation cards
- `app/globals.css` — Tailwind imports
- `tailwind.config.ts` + `postcss.config.js`
- `tsconfig.json`
- `next.config.js`
- `lib/api.ts` — base fetch client with auth header support

### 4. Shared Packages

**packages/types/** — `src/index.ts` exports all domain types (Profile, City, Place, Event, Quest, QuestStop, Stamp, CheckIn, UserStamp, Itinerary, Submission)

**packages/utils/** — src/index.ts, distance.ts (Haversine), distance.test.ts (3 passing), dates.ts, currency.ts (IDR), validation.ts (Zod schemas)

**packages/ui/** — Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge

**packages/ai/** — AIProvider interface, MockAIProvider (singleton), ItineraryPlan TypeScript types + Zod schema, ITINERARY_PROMPT string

### 5. Database Migrations (12 files)
001_create_profiles.sql, 002_create_cities.sql, 003_create_places.sql, 004_create_events.sql, 005_create_quests.sql, 006_create_quest_stops.sql, 007_create_stamps.sql, 008_create_check_ins.sql, 009_create_user_stamps.sql, 010_create_itineraries.sql, 011_create_submissions.sql, 012_create_indexes.sql

**Key schema notes:**
- `profiles.id` is `uuid PRIMARY KEY` (not FK to auth.users)
- `profiles.auth_id` links to Supabase Auth user ID
- No `auth.users` references anywhere
- No RLS policies
- No `security definer` functions

### 6. Seed Data (seed.sql)
- 1 city (Surabaya)
- 22 places (museums, heritage sites, cafes, parks, galleries with real Surabaya names)
- 22 stamps (one per place, varied rarity)
- 6 quests (Surabaya Heritage Starter, Jalan Gula Quest, Museum Marathon, Kopi & Heritage Quest, Art & Parks Quest, Ultimate Surabaya Challenge)
- 17 quest stops across quests
- 6 events (photo exhibition, art exhibition, coffee cupping, walking tour, etc.)
- 1 admin profile + 1 demo user profile with 2 earned stamps

---

## Verification Results

| Check | Result | Notes |
|---|---|---|
| `pnpm install` | ✅ PASS | 172 packages installed |
| `pnpm typecheck` | ✅ PASS | No type errors |
| `pnpm test` (utils) | ✅ PASS | 3 tests passed |
| Docker build | ⚠️ SKIPPED | Docker daemon not running in this environment |
| Docker Compose up | ⚠️ SKIPPED | Docker daemon not running |
| apps/mobile exists | ✅ NOT EXISTS | Correct — created in Phase 5 |
| RLS policies | ✅ NOT PRESENT | None written — API-level auth only |
| auth.users references | ✅ NONE | Migrations use auth_id column, not FK |
| Supabase Edge Functions | ✅ NONE | Hono routes only |
| Seed data counts | ✅ VERIFIED | seed.sql has 22 places, 6 quests, 22 stamps, 6 events |

---

## Caveats / Notes for Phase 2+

1. **Docker**: Docker daemon was not available for build verification in this session. The Dockerfile and docker-compose.yml are syntactically correct — verify manually with `docker build` when Docker is running.

2. **Auth middleware**: The auth middleware fetches profiles by `auth_id` after JWT verification. Since we use `auth_id` (not FK), there's no cascade delete from auth.users — profiles must be managed separately.

3. **Admin profile auth_id**: The admin and demo profiles have `auth_id = NULL` in seed.sql since actual Supabase Auth user IDs aren't known until users are created. Update these after Supabase Auth setup.

4. **Admin Next.js build**: `apps/admin` uses Next.js 14 but doesn't have `next-env.d.ts`. The TypeScript check passed; production build may need `next dev` or `npx next build` first run to generate the file.

5. **AI Provider**: Defaults to `MockAIProvider`. Set `AI_PROVIDER=openai` and `OPENAI_API_KEY` for real generation.

6. **apps/mobile**: Not created — scheduled for Phase 5.

7. **Check-in / quest completion routes**: Not yet implemented (stubs in routes/index.ts). Full `POST /check-in` and related business logic routes will be added in later phases.

8. **Supabase Auth flow**: `/auth/me` and `/auth/callback` are stubs. Full Supabase Auth integration (register, login, JWT refresh) should delegate to Supabase Auth endpoints directly — the API server only verifies tokens.