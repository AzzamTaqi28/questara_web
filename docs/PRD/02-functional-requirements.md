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


## 11. Functional Requirements

### 11.1 Authentication

Users must be able to:

- register with email/password
- log in
- log out
- view their profile
- store display name, avatar URL, home city, and XP

Admin users must be identified by a role in the `profiles` table or a dedicated `admin_users` table.

Acceptance criteria:

- Unauthenticated users are redirected to login.
- Authenticated users can access main app.
- Admin-only routes are inaccessible to normal users.
- New users automatically get a profile row.

### 11.2 City selection

Users must be able to:

- view available cities
- pick active city
- see city-specific quests and places

Acceptance criteria:

- Home content filters by selected city.
- City selection persists locally and/or in user profile.
- App handles no selected city gracefully.

### 11.3 Quest browsing

Users must be able to:

- view list of published quests
- filter by city and category/tag
- see duration, budget, difficulty, number of stops, reward preview
- open quest detail

Acceptance criteria:

- Draft/unpublished quests do not appear in mobile app.
- Quest cards show key metadata.
- Empty state appears when no quests exist.

### 11.4 Quest detail

Users must be able to:

- see quest title, description, cover image
- see ordered stops
- see estimated duration and budget
- see map preview
- see reward/stamp preview
- start or continue quest
- open stop/place detail

Acceptance criteria:

- Completed stops are visually marked.
- Current progress is shown as `completed / total`.
- User can continue from last incomplete stop.

### 11.5 Place detail

Users must be able to:

- view place name, description, category, image
- view address and map location
- view opening hours if available
- view ticket price range if available
- view source URL if available
- check in if the place is part of an active quest or available as standalone

Acceptance criteria:

- Missing opening hours or prices display “Needs confirmation”.
- External source links open safely.
- Coordinates are required for check-in eligible places.

### 11.6 GPS check-in

Users must be able to:

- request location permission
- attempt check-in at a place
- receive success/failure feedback
- earn stamp and XP for valid check-in

Validation logic:

- Get user location from device.
- Fetch place coordinates.
- Calculate distance using Haversine formula.
- If distance <= configured radius, mark valid.
- If invalid, show current distance and allowed radius.

Default radius:

- MVP: 200 meters
- Configurable per place later

Acceptance criteria:

- Invalid GPS check-ins do not award stamps.
- Duplicate stamps for same user, stamp, and quest are prevented.
- Duplicate check-ins can be logged but do not duplicate rewards.
- Check-in function is server-side authoritative.

### 11.7 QR check-in, post-MVP optional

Partner venues may display QR codes. QR tokens should be signed or short-lived.

Post-MVP acceptance criteria:

- Admin can generate QR for a place.
- User can scan QR.
- Backend validates token.
- QR check-in can optionally bypass GPS or require both QR + GPS.

### 11.8 Stamp and passport

Users must be able to:

- see collected stamps
- see locked stamps
- open stamp detail
- see earned date
- see associated place/quest
- see city progress

Acceptance criteria:

- Passport shows stamps grouped by city and/or quest.
- Stamp detail is accessible from reward modal and passport.
- Locked stamps reveal teaser but not full reward if desired.

### 11.9 XP and badges

MVP XP rules:

- Valid check-in: +50 XP
- Complete quest: +200 XP
- First stamp: +100 XP bonus
- Approved submission: +100 XP, optional
- Share card: +20 XP, optional and abuse-limited

Badges can be implemented as static derived achievements post-MVP.

Acceptance criteria:

- XP updates after valid check-in.
- XP cannot be incremented directly from client.
- Quest completion bonus is awarded once.

### 11.10 AI itinerary generation

Users must be able to:

- choose city
- optionally choose quest
- provide starting location text
- provide available hours
- provide budget
- choose preferences/tags
- generate itinerary
- save itinerary
- view result as timeline

Hard rule:

> The AI must only use places/events passed from the database. It must not invent locations, prices, opening hours, or events.

Acceptance criteria:

- Generated itinerary is valid JSON.
- Missing data is marked in `warnings`.
- The UI handles AI failure with fallback route ordering.
- Generated itinerary is saved to `itineraries`.
- Mock provider works without API key.

### 11.11 Event/place submission

Users or organizers must be able to submit:

- title
- city
- location text
- date text
- source URL
- notes

Admin must be able to:

- review submission
- approve
- reject
- convert to event/place draft
- edit structured fields
- publish

Acceptance criteria:

- Submissions do not publish directly.
- Admin can see extracted fields if AI parser is enabled.
- Submission history is preserved.

### 11.12 Admin dashboard

Admin dashboard must show:

- total users
- total quests
- total places
- total published events
- total check-ins
- total stamps earned
- recent submissions
- recent check-ins

Acceptance criteria:

- Admin pages require admin role.
- CRUD operations validate required fields.
- Admin can publish/unpublish quests and events.

---
## 12. Non-Functional Requirements

### 12.1 Performance

- Quest list should load within 2 seconds on normal mobile connection.
- Home screen should show cached/skeleton UI during loading.
- Images should be optimized and stored via Supabase Storage or external CDN.
- Use pagination for lists.

### 12.2 Reliability

- Check-in must be idempotent for rewards.
- Itinerary generation must fail gracefully.
- App must support mock data mode for demos.

### 12.3 Security

- All user-owned data protected by RLS.
- Admin actions require admin role.
- Sensitive keys must never be shipped to mobile client.
- AI API key must be used only server-side.
- GPS check-in reward logic must run server-side.

### 12.4 Privacy

- Do not continuously track user location.
- Request location only during check-in or map features.
- Store check-in coordinates only when user performs check-in.
- Make privacy policy clear before public launch.

### 12.5 Scalability

- City-based partitioning is not required for MVP but schema must include `city_id`.
- Add indexes for common filters.
- Keep ingestion and approval pipeline separated from published data.

---
