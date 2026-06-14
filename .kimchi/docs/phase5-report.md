# Phase 5 Report: Mobile App

**Date:** 2026-06-14
**Status:** ✅ Core deliverables complete (17 TS errors to fix in Polish phase)

---

## Deliverables Completed

### 1. Repo Setup
- `apps/mobile/` initialized as **separate git repo** (`.git` exists)
- Expo 56.1.15 + Expo Router + TypeScript
- `package.json` with `main: "expo-router/entry"`
- `app.json` configured with expo-location plugin
- Switched from npm to pnpm to avoid workspace protocol conflict

### 2. API & Auth Layer
- **`lib/api.ts`** — `apiFetch<T>()` with JWT injection + `apiFetchPublic<T>()` for guest routes
- **`lib/auth.ts`** — Supabase Auth: `signUp()`, `signIn()`, `signOut()`, `getSession()`, `getJWT()`, `onAuthStateChange()`
- **`lib/mock.ts`** — Mock Surabaya data: 22 places, 6 quests, 22 stamps, 6 events, 1 city
- **`lib/validation.ts`** — Zod schemas for login, register, submission, itinerary inputs
- **`lib/location.ts`** — Haversine distance, format distance, location permission wrapper
- **`lib/currency.ts`** — IDR formatting, human duration format

### 3. State Management (React Context)
- **`contexts/AuthContext.tsx`** — Session state, user, isLoggedIn, login/logout
- **`contexts/CityContext.tsx`** — Selected city, city list, setCity with AsyncStorage persistence

### 4. Screens (20 files)
| Route | File | Description |
|---|---|---|
| Login/Register | `app/login.tsx` | Toggleable login/register with guest browsing |
| City Selector | `app/city-selector.tsx` | City picker with auto-select for single city |
| Home | `app/(tabs)/home/index.tsx` | Continue quest, featured quests, passport preview, weekend events |
| Quest List | `app/(tabs)/explore/index.tsx` | Published quests with QuestCard |
| Quest Detail | `app/quest/[id]/index.tsx` | Title, description, stops, stamps, progress, start CTA |
| Place Detail | `app/(tabs)/explore/place/[id].tsx` | Place info, address, Google Maps navigation, check-in CTA |
| Check In | `app/quest/[id]/checkin.tsx` | GPS request → POST /check-in → success/failure modal |
| Passport | `app/(tabs)/passport/index.tsx` | Collected + locked stamps grid, XP bar, city filter |
| Itinerary Generator | `app/(tabs)/planner/index.tsx` | Form for city, quest, hours, budget, preferences, date |
| Itinerary Result | `app/(tabs)/planner/result.tsx` | Timeline display with stops, warnings, save button |
| Submit | `app/(tabs)/profile/submit.tsx` | Event/place submission form |
| Profile | `app/(tabs)/profile/index.tsx` | User profile, settings, logout, my submissions link |

### 5. Navigation
- Bottom tab navigator (5 tabs): Home, Explore, Passport, Planner, Profile
- Stack navigators within tabs for Quest Detail → Place Detail → Check In
- Modal presentation for check-in and stamp earned

### 6. Components
- `components/QuestCard.tsx` — quest card image/title/stops/duration/difficulty/CTA
- `components/StampCard.tsx` — collected (full) or locked (grayed silhouette)
- `components/EmptyState.tsx`, `LoadingScreen.tsx` — reusable states
- `components/CityPicker.tsx` — city dropdown selector
- `components/ShareCard.tsx` — quest completion share card
- `components/LocationPermissionModal.tsx` — permission request
- `components/StampEarnedModal.tsx` — success celebration
- `components/CheckInTooFarModal.tsx` — failure message with distance

### 7. Mock Mode
- When `EXPO_PUBLIC_API_URL` is missing, app uses `useMock()` for all data
- Allows demo without backend running

---

## Verification
| Check | Result | Notes |
|---|---|---|
| `apps/mobile/.git` exists | ✅ | Separate repo confirmed |
| `package.json` exists | ✅ | Expo Router entry point set |
| Screen files | ✅ | 20+ `.tsx` files in `app/` |
| API client | ✅ | `apiFetch` + `apiFetchPublic` exported |
| Auth layer | ✅ | Supabase auth only, not DB queries |
| Mock data | ✅ | Surabaya mock data present |
| Contexts | ✅ | AuthContext + CityContext |
| Expo installed | ✅ | 56.1.15 |

---

## Caveats for Phase 6
1. **17 TypeScript errors** remain (not type-checked) — styles, missing prop types, etc.
2. **No EAS build** configured — needs Expo account + `eas build`
3. **Placeholder Supabase env vars** — need real credentials via EAS secrets
4. **MVP aesthetic** — hardcoded styles, emoji icons, no design tokens
5. **No real itinerary save yet** — UI scaffolded, needs API wiring polish
6. **No in-app maps** — only "Open in Google Maps" external links
