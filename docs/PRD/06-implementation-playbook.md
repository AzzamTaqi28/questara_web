# Questara Implementation Playbook

This document turns the PRD into a build order that agents can follow without guessing.

## How to use this playbook

1. Build in phase order unless a later task is strictly documentation-only.
2. Keep each change small and scoped to one phase.
3. Do not implement AI, check-in, or admin workflows before the data model and auth foundations exist.
4. Prefer mock data and deterministic logic before wiring external services.
5. Update the checklist and status doc as work lands.

## Delivery model

Use these parallel work lanes when multiple agents are available:

- Lane A: repo scaffold, shared packages, tooling, env setup
- Lane B: database schema, migrations, seed data, RLS, Edge Functions
- Lane C: mobile app browse flow, passport, check-in UX, itinerary UX
- Lane D: admin CMS, quest builder, submissions review
- Lane E: AI provider abstraction, itinerary generation, parsers, validation
- Lane F: QA, tests, demo data, release polish

## Phase 0 - Foundation

Goal: make the repo runnable and ready for parallel feature work.

Deliverables:

- Monorepo structure
- Mobile app scaffold
- Admin app scaffold
- Shared package scaffolds
- Supabase project files
- Env examples
- Lint, typecheck, test scripts

Do not start:

- production UI polish
- real AI integration
- check-in rewards logic

## Phase 1 - Data and Auth

Goal: establish the source of truth.

Deliverables:

- Supabase migrations for all PRD entities
- Auth and profile flow
- RLS baseline
- Seed city and sample content
- Shared database types

Done when:

- a user can sign up and get a profile row
- published queries return only public content
- the seed data supports the first demo city

## Phase 2 - Mobile Browse Flow

Goal: let users discover the product before any advanced mechanics.

Deliverables:

- login and register screens
- city selector
- home screen
- quest list
- quest detail
- place detail

Done when:

- a user can browse the seeded city
- quest stops render in order
- empty and loading states exist

## Phase 3 - Check-in and Passport

Goal: turn browsing into a playable loop.

Deliverables:

- location permission flow
- server-authoritative GPS check-in
- stamp awarding
- XP updates
- passport screen

Done when:

- valid check-ins award rewards once
- invalid check-ins do not award rewards
- passport shows collected stamps

## Phase 4 - Admin CMS

Goal: give the team a way to manage content without code changes.

Deliverables:

- admin login
- dashboard
- CRUD for cities, places, events, quests, stamps
- quest builder
- submissions review

Done when:

- admin can create and publish a quest
- mobile app can read the published quest

## Phase 5 - AI Itinerary

Goal: add planning support without letting AI invent data.

Deliverables:

- AI provider abstraction
- mock provider
- itinerary generation edge function
- itinerary screens
- schema validation

Done when:

- output is strict JSON
- every referenced place exists in the database context
- fallback works when AI is unavailable

## Phase 6 - Submissions and Operations

Goal: create the ingestion workflow for new places and events.

Deliverables:

- submission form
- submissions table
- parser support for source text / links
- admin review workflow

Done when:

- users can submit an event or place
- admins can approve, reject, or convert to a draft

## Phase 7 - QA and Launch

Goal: make the MVP demo-ready.

Deliverables:

- tests for distance, rewards, quest progress, itinerary validation
- analytics events
- error states
- share card
- beta deployment

Done when:

- the demo script runs end-to-end
- the app is stable enough for internal beta users

## Agent rules

- Do not merge a phase out of order without an explicit dependency reason.
- If a task touches shared contracts, update both mobile and admin callers.
- If a task changes database shape, update migrations and types together.
- If a task depends on external APIs, provide a mock path first.
