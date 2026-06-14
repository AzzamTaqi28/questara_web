# Architecture Decision Record (ADR)

**Date:** 2026-06-14
**Context:** Post-scoping discussion with founder.
**Audience:** AI coding agents, future developers

---

## Summary of Changes from Base PRD

The base PRD (v0.2) recommends a Supabase-centric stack (Supabase Auth, Postgres, Edge Functions, RLS, Storage). After scoping, the architecture was adjusted to fit the founder's deployment preference (self-hosted via Dokploy) and repo structure preference. These changes are documented here so all implementation work aligns with the actual target stack.

---

## Decision 1 — Backend: Standalone REST API instead of Supabase Edge Functions

### Context
The founder will manage infrastructure in Dokploy and prefers a traditional Dockerized API server.

### Decision
- Replace Supabase Edge Functions with a **standalone REST API server**
- Built with **Hono** (lightweight, TypeScript-native, fast)
- Dockerized for Dokploy deployment
- Deployed as a container alongside the admin Next.js app (or as a separate service)

### Consequences
- API server connect directly to Postgres via connection string (`pg` or `Drizzle ORM`)
- All business logic lives in the API (check-in validation, XP awarding, quest completion, AI itinerary)
- No dependency on Supabase Edge Function runtime
- Easier local development (`docker compose up`)
- More control over middleware, logging, error handling

### What stays the same
- Supabase Auth is still used for authentication (free tier, handles JWT, email verification, password reset)
- API server verifies Supabase JWT tokens to identify users
- Postgres schema remains unchanged from PRD tables

---

## Decision 2 — Repo Structure: Monorepo for Web/Backend, Separate Repo for Mobile

### Context
The founder prefers mobile to be in its own repo for cleaner separation.

### Decision
- **Backend/Web monorepo** (root of this project): `apps/api`, `apps/admin`, `packages/*`
- **Mobile app** (`apps/mobile/`): Separate git repo (has its own `.git/`)
- Mobile communicates with backend **only via REST API**, never direct database access

### Directory Layout

```
travel-apps/                        ← backend/web repo root
├── apps/
│   ├── admin/                      ← Next.js admin dashboard
│   │   ├── app/
│   │   ├── components/
│   │   └── package.json
│   └── api/                        ← Hono REST API server
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── services/
│       │   └── index.ts
│       ├── Dockerfile
│       └── package.json
├── packages/
│   ├── types/                      ← shared TS types (DB + domain)
│   ├── utils/                      ← distance, dates, validation, currency
│   ├── ui/                         ← shared React components
│   └── ai/                         ← AI provider abstraction + mock
├── migrations/                     ← Postgres SQL migrations
├── seed.sql                        ← seed data (Surabaya)
├── package.json
├── pnpm-workspace.yaml
└── turbo.json

apps/mobile/                        ← separate git repo
├── app/
├── components/
├── features/
├── lib/
│   └── api.ts                      ← REST API client
├── assets/
└── package.json
```

### Consequences
- Mobile cannot import shared packages directly from backend repo
- Shared types must be kept in sync manually or via a published package (manual sync acceptable for MVP)
- Clear separation of concerns: mobile team can work independently

---

## Decision 3 — Database: User-Managed Postgres (No Supabase Cloud Postgres)

### Context
Founder will provision and manage their own Postgres instance in Dokploy.

### Decision
- We provide raw SQL migrations (in `migrations/`)
- Founder runs migrations against their own Postgres instance
- We use `pg` or `Drizzle ORM` to connect from the API server
- **No Row Level Security (RLS)** — since we have a standalone API, authorization happens at the API middleware layer, not the database layer

### Consequences
- We implement **API-level authorization** instead of RLS:
  - Auth middleware verifies JWT from Supabase Auth
  - Role-based middleware checks `role = 'admin'` for admin endpoints
  - Endpoints that return user-specific data (passport, check-ins, itineraries) filter by `user_id` in SQL queries
- Simpler database schema (no `auth.users` foreign keys, no `security definer` functions)
- Need to be careful about query-level authorization (can't rely on RLS to block reads for free)

---

## Decision 4 — Auth: Supabase Auth (Managed) + JWT Verification in API

### Context
Still need authentication, and Supabase Auth is free-tier and feature-complete.

### Decision
- **Authentication** handled by Supabase Auth (managed service):
  - Email/password registration and login
  - JWT token issuance
  - Password reset, email verification
- **Authorization** handled by API server:
  - API middleware verifies JWT signature against Supabase Auth public key
  - Extracts `sub` (user id) from JWT for user-scoped queries
  - Admin endpoints check `role` from `profiles` table

### Mobile Auth Flow
```
Mobile ↔ Supabase Auth (managed) → JWT token
Mobile → REST API (with JWT in Authorization header) → API verifies JWT → Postgres
```

### Admin Auth Flow
```
Admin App → Supabase Auth → JWT token
Admin App → REST API (with JWT) → API verifies JWT + checks admin role
```

---

## Decision 5 — Storage: External Image URLs (No File Upload in MVP)

### Context
PRD recommends Supabase Storage for images. Since we're not using Supabase Cloud, we don't have Supabase Storage.

### Decision
- **MVP**: Store image URLs as plain text (`image_url` columns)
- Images are hosted externally (Unsplash, venue websites, etc.) or manually uploaded to any CDN
- **Post-MVP**: Add file upload support with S3-compatible storage or a self-hosted MinIO in Dokploy

### Consequences
- Simpler MVP (no upload endpoints needed)
- Admin adds image URLs manually
- Mobile simply renders `<Image source={{ uri: image_url }} />`

---

## Decision 6 — AI: Mock Provider First, Real Provider Optional

### Decision (unchanged from PRD)
- Build `MockAIProvider` as the default AI implementation
- Implement provider abstraction so swapping to OpenAI/Anthropic is a one-line change
- No API keys needed for MVP demo

---

## Decision 7 — Maps: Google Maps (External links only, no in-app maps initially)

### Decision (adjusted from PRD)
- **MVP**: Mobile does NOT embed an interactive map library (this keeps build simple)
- Instead: show static map images or "Open in Google Maps" deep links
- Place detail shows coordinates + address + "Navigate here" button
- Quest detail shows ordered stops as a list with distances

### Post-MVP
- Add Mapbox or Google Maps SDK for interactive in-app maps

---

## Updated API Contract Summary

All endpoints are served by the Hono REST API server (`apps/api`).

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/auth/register` | POST | public | Delegates to Supabase Auth |
| `/auth/login` | POST | public | Delegates to Supabase Auth |
| `/cities` | GET | public | List active cities |
| `/cities/:id/quests` | GET | public | List published quests for city |
| `/quests/:id` | GET | public | Quest detail with stops |
| `/places/:id` | GET | public | Place detail |
| `/check-in` | POST | user | GPS validation + stamp awarding |
| `/generate-itinerary` | POST | user | AI itinerary generation |
| `/passport` | GET | user | User's stamps + XP |
| `/itineraries` | GET/POST | user | List / create itineraries |
| `/submissions` | GET/POST | user | Submit place/event |
| `/admin/*` | various | admin | Admin CMS endpoints |

All protected endpoints require `Authorization: Bearer <jwt>` header.
The API server verifies the JWT with Supabase Auth.

---

## Updated Deployment Architecture

```
Developer/AI Agent
│
├─ GitHub Repository (backend web)
│  ├─ apps/api/          → Docker build → Dokploy (API container)
│  ├─ apps/admin/        → Next.js build → Dokploy (or Vercel)
│  ├─ migrations/        → run against Postgres (user-managed)
│  └─ packages/          → shared code, built into API and Admin
│
└─ GitHub Repository (mobile)
   └─ apps/mobile/       → EAS Build → App Stores (EAS or manual)

External Services:
- Supabase Auth (managed) → handles login/register/JWT
- Postgres (Dokploy)      → user-managed via migration files
- AI Provider (optional)  → OpenAI/Anthropic or Mock
```

---

## Migrations from Supabase-First to API-First

| PRD Concept | New Implementation | Notes |
|---|---|---|
| Supabase Edge Functions | Hono REST API server | Business logic moved from edge functions to Hono routes |
| Supabase Auth | Supabase Auth (managed) | Still used, but only for auth; API verifies JWT |
| Supabase Postgres | Postgres (user-managed) | Founder provisions in Dokploy |
| Row Level Security | API-level auth middleware | JWT verification + role checks in Hono middleware |
| Supabase Storage | External image URLs | Manual URLs for MVP; file upload later |
| Supabase client SDK in mobile | Custom REST API client | Mobile uses fetch/axios to call API |
| `supabase/` directory | `migrations/` + `apps/api/` | Migrations are raw SQL; API is Hono |

---

## What This Means for Implementation

1. **Do NOT write Supabase Edge Functions** — write Hono routes instead
2. **Do NOT write RLS policies** — write Hono middleware instead
3. **Do NOT import Supabase client SDK in mobile** — write a thin API client wrapper
4. **Mobile is its own repo** — it cannot import from `packages/`
5. **Provide SQL migrations** — founder runs them against their own Postgres
6. **Dockerize the API** — provide a `Dockerfile` for Dokploy deployment
