# PRD v0.2 — Questara

**Product:** Questara / JelajahPass / StampTrip  
**Category:** Gamified local discovery, cultural tourism, event bundling, and AI-assisted trip planning  
**Target market:** Indonesia  
**Initial MVP city:** Pick one: Surabaya, Jakarta, Yogyakarta, Bandung, or Malang  
**Primary niche for MVP:** Museum, heritage, art, culture, walking routes, and curated weekend experiences  
**Document audience:** Founder, product, design, engineering, AI coding agents  
**Agent targets:** Kimchi, Codex, Claude Code, Cursor, Windsurf, Copilot, Devin-like agents  
**Status:** Draft for implementation  
**Version:** 0.2  
**Last updated:** 2026-06-14  

---


## 25. Error States

### 25.1 Mobile errors

| Scenario | UX |
|---|---|
| No internet | Show cached data if available; otherwise retry state |
| Location denied | Explain permission needed for check-in |
| Too far from place | Show distance and allowed radius |
| GPS unavailable | Allow retry and explain issue |
| Quest unpublished | Show not found / unavailable |
| AI fails | Show rule-based itinerary fallback |
| Empty city | Show “Coming soon” state |

### 25.2 Admin errors

| Scenario | UX |
|---|---|
| Missing required field | Inline validation |
| Invalid lat/lng | Prevent save |
| Upload failed | Retry upload |
| Unauthorized | Redirect to login / no access |
| Publish incomplete quest | Show checklist of missing data |

---
## 26. Testing Strategy

### 26.1 Unit tests

Required:

- Haversine distance
- check-in validity
- duplicate stamp prevention helper
- quest progress calculation
- itinerary schema validation
- budget/duration formatter

### 26.2 Integration tests

Required:

- check-in edge function success
- check-in edge function too far
- generate-itinerary mock provider
- submission creation and admin approval

### 26.3 E2E smoke tests

Required flows:

1. User signs up.
2. User selects city.
3. User opens quest.
4. User performs mock valid check-in.
5. User sees stamp in passport.
6. Admin creates quest and publishes it.

---
## 27. Implementation Milestones

### Milestone 0 — Project scaffold

Deliverables:

- Monorepo
- Expo app runnable
- Next.js admin runnable
- Shared packages
- Supabase config
- README
- env examples

Acceptance:

- `pnpm install` works
- `pnpm dev` or documented commands run apps
- TypeScript compiles

### Milestone 1 — Database and seed data

Deliverables:

- Supabase migrations
- RLS baseline
- Seed city, places, quests, stamps
- Shared DB types

Acceptance:

- DB can be reset and seeded
- Published quests query works
- Admin user can be configured

### Milestone 2 — Mobile browse flow

Deliverables:

- Auth
- City selector
- Home
- Quest list
- Quest detail
- Place detail

Acceptance:

- User can browse seeded city and quest
- Quest detail displays ordered stops

### Milestone 3 — Check-in and passport

Deliverables:

- Location permission
- Check-in edge function
- Stamp awarding
- XP update
- Passport screen

Acceptance:

- Valid check-in awards stamp
- Invalid check-in does not award stamp
- Passport shows earned stamp

### Milestone 4 — Admin CMS

Deliverables:

- Admin login
- Dashboard
- Places CRUD
- Events CRUD
- Quests CRUD
- Quest builder
- Stamps CRUD

Acceptance:

- Admin can create and publish a quest
- Mobile app shows published quest

### Milestone 5 — AI itinerary

Deliverables:

- AI provider abstraction
- Mock provider
- Generate-itinerary edge function
- Itinerary generator screen
- Itinerary result screen

Acceptance:

- User can generate and save itinerary
- Output only references database places
- Fallback works without AI key

### Milestone 6 — Submissions

Deliverables:

- Mobile submit screen
- Submissions table
- Admin review page
- Optional parse-submission function

Acceptance:

- User can submit event/place
- Admin can approve/reject
- Approved item can be converted to draft

### Milestone 7 — Polish and beta

Deliverables:

- Share card
- Better empty/loading/error states
- Analytics events
- QA pass
- Beta deployment

Acceptance:

- App is demo-ready with one city
- Internal beta users can complete a quest

---
## 28. Acceptance Checklist for MVP Launch

Product:

- [ ] One city has at least 20 places.
- [ ] One city has at least 5 quests.
- [ ] Every quest has at least 3 stops.
- [ ] Every check-in eligible place has coordinates.
- [ ] Every stamp has image or placeholder.
- [ ] AI itinerary has mock fallback.

Mobile:

- [ ] User can sign up.
- [ ] User can pick city.
- [ ] User can view quests.
- [ ] User can view quest detail.
- [ ] User can check in.
- [ ] User can earn stamp.
- [ ] User can view passport.
- [ ] User can generate itinerary.

Admin:

- [ ] Admin can login.
- [ ] Admin can CRUD places.
- [ ] Admin can CRUD quests.
- [ ] Admin can manage quest stops.
- [ ] Admin can review submissions.
- [ ] Admin can publish/unpublish.

Infra:

- [ ] Supabase migrations run cleanly.
- [ ] RLS policies enabled.
- [ ] Edge functions deploy.
- [ ] Admin app deploys.
- [ ] Mobile app builds.
- [ ] Env vars documented.

Quality:

- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Critical tests pass.
- [ ] No AI key exposed to client.
- [ ] No admin-only data visible to public users.

---
## 29. Environment Variables

### 29.1 Root `.env.example`

```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mobile public env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_MAP_PROVIDER=
EXPO_PUBLIC_MAPBOX_TOKEN=
EXPO_PUBLIC_GOOGLE_MAPS_KEY=

# Admin
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AI server-side only
AI_PROVIDER=mock
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Analytics
POSTHOG_KEY=
POSTHOG_HOST=

# App config
CHECK_IN_RADIUS_METERS=200
APP_ENV=local
```

Security note:

- `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and `ANTHROPIC_API_KEY` must never be exposed in mobile or browser client bundles.

---
## 30. Suggested Kimchi / Codex / Claude Build Prompts

### 30.1 Scaffold prompt

```txt
/ferment Build the Questara monorepo from docs/PRD/README.md.

Stack:
- Expo React Native with TypeScript in apps/mobile
- Next.js with TypeScript in apps/admin
- Supabase migrations and edge functions in supabase/
- Shared packages for types, utils, UI, and AI provider abstraction

First milestone only:
- create runnable scaffold
- configure pnpm workspace or turbo monorepo
- add lint/typecheck scripts
- add README and env examples
- do not implement full app yet
```

### 30.2 Database prompt

```txt
/ferment Implement the database layer from the PRD.

Create Supabase migrations for:
profiles, cities, places, events, quests, quest_stops, stamps, check_ins, user_stamps, itineraries, submissions.

Add indexes, basic RLS, admin helper function, and seed data for one Indonesian city with sample places, quests, and stamps.
Also generate shared TypeScript types in packages/types.
```

### 30.3 Mobile browse prompt

```txt
/ferment Implement the mobile MVP browse flow.

Use Expo Router and Supabase.
Screens:
Login, Register, CitySelector, Home, QuestList, QuestDetail, PlaceDetail, Passport.

Requirements:
- use seeded Supabase data if env exists
- use mock data fallback if env missing
- show published quests only
- show ordered quest stops
- polish loading, empty, and error states
```

### 30.4 Check-in prompt

```txt
/ferment Implement GPS check-in and stamp awarding.

Create supabase/functions/check-in.
Add mobile check-in flow.
Rules:
- location permission requested only when checking in
- backend validates distance using Haversine
- valid check-in creates check_ins row
- valid check-in upserts user_stamps row
- duplicate stamp should not duplicate XP
- invalid check-in should not award stamp
- return progress and stamp data
Add tests for distance and reward logic.
```

### 30.5 Admin CMS prompt

```txt
/ferment Implement admin dashboard.

Use Next.js and Supabase.
Pages:
Dashboard, Cities, Places, Events, Quests, QuestBuilder, Stamps, Submissions, CheckIns, Users.

Requirements:
- admin role required
- CRUD forms with validation
- quest builder can add/reorder stops
- publish/unpublish quests
- review submissions
```

### 30.6 AI itinerary prompt

```txt
/ferment Implement AI itinerary generation.

Create packages/ai with provider abstraction and mock provider.
Create supabase/functions/generate-itinerary.
Create mobile ItineraryGenerator and ItineraryResult screens.

Rules:
- AI must only use database places/events passed in context
- output must be strict JSON matching schema
- validate place IDs before saving
- fallback to heuristic itinerary if AI fails
- save result to itineraries table
```

---
## 31. Open Questions

1. Which city should be the MVP launch city?
2. Should MVP require login before browsing, or allow guest browsing?
3. Which map provider should be used first?
4. Should check-in radius be fixed globally or configurable per place?
5. Do stamps need custom artwork in MVP or can placeholders be used?
6. Should event submission be available to all users or only approved organizers?
7. Should itinerary generation be gated behind login?
8. What is the first acquisition channel: TikTok content, museum partnership, campus ambassadors, or communities?

Recommended default answers for MVP:

1. Pick one city with dense cultural places.
2. Allow guest browsing, require login for check-in/stamps.
3. Use Mapbox or Google Maps depending on budget/access.
4. Use global 200m radius first.
5. Use placeholders first, custom art later.
6. Allow all users to submit, admin reviews.
7. Require login to save itinerary, allow demo generation if needed.
8. Start with community/content-led beta.

---
## 32. Future Roadmap

### 32.1 Post-MVP features

- QR partner check-in
- Venue/organizer dashboard
- Sponsored quests
- City campaign pages
- Leaderboards
- Friend groups
- Shared itinerary planning
- In-app ticketing affiliate
- Public creator profiles
- More advanced route optimization
- Push notifications
- Seasonal quests
- Official museum/city passport partnerships

### 32.2 Potential monetization

B2B/B2G:

- paid city campaigns
- official digital passport programs
- venue analytics
- sponsored quests

B2C:

- premium curated itineraries
- limited stamp packs
- paid guided quests

Affiliate:

- ticketing
- tours
- cafes/restaurants
- transport partners
- accommodation later

---
## 33. MVP Demo Script

1. Open Questara.
2. Login as demo user.
3. Select Surabaya.
4. View Home and Featured Quests.
5. Open “Surabaya Heritage Starter”.
6. View roadmap and stops.
7. Open first place detail.
8. Use demo/mock location to check in.
9. Earn stamp.
10. Open Passport.
11. Generate a 6-hour itinerary from the quest.
12. Open Admin Dashboard.
13. Show quest builder and submissions review.
14. Publish a new quest.
15. Return to mobile and show new quest available.

---
## 34. Definition of Done

A feature is done when:

1. It meets the PRD acceptance criteria.
2. It has loading, empty, and error states.
3. It is typed end-to-end.
4. It does not expose server secrets.
5. It respects RLS and admin permissions.
6. It has basic test coverage for critical logic.
7. It works with seeded data.
8. It works in mock mode where applicable.
9. It is documented enough for another agent/developer to continue.

---
## 35. Final Product Direction

Questara should start as a gamified cultural discovery app, not a generic AI travel planner. The first product win is making users want to complete local routes and collect stamps. AI should improve planning and content operations, but the emotional hook is the passport, quest, and completion loop.

Build order:

1. Curated city data
2. Quest roadmap
3. GPS check-in
4. Stamp passport
5. Admin CMS
6. AI itinerary
7. Submissions
8. Partner/organizer features

The MVP is successful if a user can open the app, find a quest, visit a place, check in, earn a stamp, and feel motivated to continue exploring.
