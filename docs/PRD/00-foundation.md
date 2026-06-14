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


## 0. Agent Instructions

This PRD is written to be implementation-ready for AI coding agents.

When implementing, agents must follow these principles:

1. Build an MVP first, not a full travel super-app.
2. Prioritize mobile app + database + admin CMS + check-in + stamp mechanics.
3. Do not build mass social media scraping in MVP.
4. AI itinerary generation must only use places/events from the app database.
5. Use structured data and deterministic validation before calling LLMs.
6. All database tables must support future city expansion.
7. Keep code modular, typed, and easy to replace later.
8. Add mock data mode for local development.
9. Add basic tests for critical logic: distance validation, stamp awarding, quest progress, itinerary JSON validation.
10. Avoid hardcoding only one city except in seed data.

Recommended MVP stack:

- Mobile: Expo React Native + TypeScript
- Admin: Next.js + TypeScript
- Backend/Data: Supabase Auth, Postgres, Storage, Edge Functions
- Maps: Mapbox, Google Maps, or MapLibre/OpenStreetMap
- AI: Provider-agnostic wrapper with mock mode
- Analytics: PostHog or Supabase event table
- Deployment: EAS for mobile, Vercel for admin, Supabase for backend

---
## 1. Executive Summary

Questara turns Indonesian local tourism into playable city quests. Users discover curated bundles of places and events, follow a roadmap, check in at real-world locations, collect digital stamps, complete quests, and generate personalized itineraries.

The product combines:

1. Local place/event discovery
2. Curated route bundles called quests
3. Real-world GPS/QR check-in
4. Digital passport and collectible stamps
5. AI-assisted itinerary planning
6. Admin/community submission workflow for data freshness
7. Optional future partner programs with museums, local governments, communities, venues, cafes, and event organizers

The MVP should focus on one city and one theme cluster: museum, heritage, art, and cultural discovery. The app should prove that users are willing to start a quest, visit locations, collect stamps, and return for more quests.

---
## 2. Product Thesis

Indonesian local events and cultural destinations are fragmented across Instagram, TikTok, news articles, Google Maps, venue pages, ticketing apps, tourism office pages, and word-of-mouth. Users often want to explore, but planning is annoying.

Questara solves this by transforming scattered destinations into curated, gamified routes.

The wedge is not generic AI trip planning. The wedge is:

> Local discovery + quest roadmap + check-in + digital stamp + shareable progress.

AI is a support layer, not the core product. It helps with itinerary generation, event summarization, and structured data extraction, but the app experience should work without AI.

---
## 3. Product Positioning

### 3.1 One-liner

Questara helps people explore Indonesian cities through curated quests, real-world check-ins, collectible digital stamps, and AI-assisted itineraries.

### 3.2 Tagline options

- Collect places. Complete quests. Explore Indonesia differently.
- Turn your city into a playable map.
- A digital passport for local adventures.
- Discover events, follow quests, collect stamps.
- Your weekend, gamified.

### 3.3 Product category

Gamified local discovery and trip planning.

### 3.4 Competitive framing

Questara is not:

- just an event aggregator
- just a map app
- just an AI trip planner
- just a loyalty program
- just a tourism directory

Questara is:

- a playable discovery layer for cities
- a digital passport system
- a route bundling and itinerary engine
- a lightweight CRM/engagement channel for venues and communities

---
## 4. Problem Statement

### 4.1 User problem

Users want interesting things to do but face these issues:

- Event information is scattered.
- Social media posts are hard to convert into a real plan.
- Users do not know which places are near each other.
- Users do not know what order to visit places in.
- Users are unsure about opening hours, prices, and event validity.
- Local tourism can feel passive and not rewarding.
- Existing travel planner apps are often too generic and not locally curated.

### 4.2 Venue/community problem

Museums, galleries, communities, local governments, and cultural venues need:

- more foot traffic
- repeat visits
- younger audience engagement
- measurable campaign participation
- a way to bundle with nearby destinations
- better digital storytelling
- lightweight gamification without building their own app

### 4.3 Founder opportunity

Start with curated cultural quests, then expand into:

- partner-sponsored quests
- event submission network
- official city passports
- route-based ticket bundles
- local tourism campaigns
- AI-powered itinerary personalization

---
## 5. Goals and Non-Goals

### 5.1 MVP goals

1. Users can sign up and choose a city.
2. Users can browse curated quests.
3. Users can view quest details and ordered stops.
4. Users can view locations on a map.
5. Users can check in at places via GPS.
6. Users can earn stamps after valid check-ins.
7. Users can see their digital passport.
8. Users can see quest progress.
9. Admins can manage cities, places, events, quests, quest stops, and stamps.
10. Users can generate simple itineraries using only database-backed places/events.
11. Users or communities can submit event/place suggestions for admin review.
12. The product can be demoed with one launch city and seeded sample data.

### 5.2 MVP non-goals

Do not include in MVP:

- hotel booking
- flight booking
- train booking
- payment gateway
- marketplace payouts
- complex social network
- direct DMs between users
- mass scraping Instagram/TikTok comments
- fully automated event publishing without admin review
- full public transport route optimization
- dynamic pricing
- native AR features
- complex leaderboard economy
- NFT/blockchain stamp ownership

### 5.3 Success hypothesis

Users will be more likely to visit cultural places and events when those experiences are bundled into quests with visible progress, rewards, and shareable stamps.

---
