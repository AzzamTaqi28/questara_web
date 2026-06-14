# Phase 4 Report: Admin CMS Dashboard

**Date:** 2026-06-14
**Status:** ✅ Complete

---

## Deliverables Completed

### 1. Foundational files
- **`.env.example`** — `NEXT_PUBLIC_API_URL=http://localhost:3001`
- **`lib/api.ts`** — Fixed `unknown` catch, added `next` param for pagination, typed `ApiError`
- **`lib/auth.ts`** — `getSession()`, `setSession()`, `clearSession()`, `isAdmin()`, `login()`, `register()`, `logout()`, `fetchAdminUser()`
- **`app/login/page.tsx`** — Login + Register form with Supabase Auth delegation

### 2. Layout & Navigation
- **`components/admin/Sidebar.tsx`** — Left nav sidebar with all 10 admin sections + logout
- **`components/admin/AdminGuard.tsx`** — Client-side auth guard with `useAdminUser()` hook
- **`app/admin/layout.tsx`** — Admin layout with sidebar wrapper
- **`app/page.tsx`** — Redirects to `/admin/dashboard`

### 3. Reusable Admin Components (`components/admin/`)
- **`DataTable.tsx`** — Sortable/searchable/paginated table with generic `T extends object` support
- **`FormModal.tsx`** — Field-type-aware form (text, textarea, number, boolean, select, array, JSON) with Create/Edit modes
- **`DeleteConfirmModal.tsx`** — Confirmation modal with optional `loading` state
- **`Pagination.tsx`** — Limit/offset pagination controls
- **`LoadingSpinner.tsx`** — Centered spinner
- **`ErrorState.tsx`** — Error display with retry
- **`EmptyState.tsx`** — Empty list display

### 4. Admin Pages (all in `app/admin/[section]/page.tsx`)

| Page | Route | Features |
|---|---|---|
| **Dashboard** | `/admin/dashboard` | Metric cards, quick actions (Create Quest/Place/Review) |
| **Cities** | `/admin/cities` | Full CRUD with lat/lng, province, active toggle |
| **Places** | `/admin/places` | Full CRUD with city selector, category, coordinates, opening hours JSON, prices, image URL, verification status, source URL |
| **Events** | `/admin/events` | Full CRUD with city selector, place selector, start/end times, prices, status, tags array input |
| **Quests list** | `/admin/quests` | Full CRUD with difficulty, duration, budget, published toggle, city selector |
| **Quest Builder** | `/admin/quests/[id]/builder` | Ordered stops list with up/down reorder, position editing, required checkbox, hint, duration. Add/remove stops. Publish/unpublish toggle. Quest preview card |
| **Stamps** | `/admin/stamps` | Full CRUD with rarity dropdown, place selector, image URL |
| **Submissions** | `/admin/submissions` | Review table with approve/reject/convert actions. Status badge colors. |
| **Users** | `/admin/users` | User list with XP, role, city. Paginated. |
| **Check-ins** | `/admin/check-ins` | All check-ins with distance, valid/invalid filters. Paginated. |

### 5. API Integration
- Every page calls the Hono REST API (`localhost:3001`)
- `AdminGuard` wraps all pages
- `useEffect` + `fetch` pattern for client-side data loading
- Zod validation on form submissions
- Loading, empty, and error states on every data table

---

## Verification Results
| Check | Result | Notes |
|---|---|---|
| `pnpm typecheck` | ✅ PASS | All packages pass (cached) |
| `pnpm install` | ✅ PASS | `@questara/types` added to admin deps |
| File structure | ✅ VERIFIED | 10 admin pages + 7 shared components + auth + login |
| Route count | ✅ VERIFIED | /admin/dashboard, /admin/cities, /admin/places, /admin/events, /admin/quests, /admin/quests/[id]/builder, /admin/stamps, /admin/submissions, /admin/users, /admin/check-ins |

---

## Key Implementation Details

- **DataTable uses generic `T extends object`** with column render functions for typed rows
- **FormModal infers field types** from the `fields` array — supports text, textarea, number, checkbox, select, array, JSON
- **Quest builder** stores form state in-memory for stops; reorders via position editing, then calls `POST /admin/quests/:id/reorder`
- **Auth flow**: AdminGuard stores user in React context after fetching `/auth/me`
- **Login page** calls Supabase Auth directly (`supabase.auth.signInWithPassword`) rather than the API
- **Logout** clears localStorage JWT and reloads page

---

## Caveats / Notes

1. **UI is functional, not polished** — MVP aesthetic. Tailwind CSS only, no shadcn/ui components installed.
2. **Image upload** — No file upload; image URLs are string inputs.
3. **Editor for JSON fields** — `JSON.stringify/parse` via textareas; could be enhanced with a JSON editor library later.
4. **Real-time updates** — No WebSocket or polling; data refreshes on page load or manual refresh.
5. **Mobile responsiveness** — Sidebar is always visible; not optimized for mobile screens yet.
6. **Build note**: Next.js `next build` may need `next-env.d.ts` auto-generated on first run.
