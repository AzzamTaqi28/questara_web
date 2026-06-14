# Questara Implementation Checklist

Use this checklist as the source of truth for build progress.

## Phase 0 - Foundation

- [ ] Create monorepo structure
- [ ] Add mobile app scaffold
- [ ] Add admin app scaffold
- [ ] Add shared `types`, `utils`, `ui`, and `ai` packages
- [ ] Add Supabase folder structure
- [ ] Add env examples
- [ ] Add lint, typecheck, and test scripts
- [ ] Add local mock-data mode

## Phase 1 - Data and Auth

- [ ] Create `profiles` table
- [ ] Create `cities` table
- [ ] Create `places` table
- [ ] Create `events` table
- [ ] Create `quests` table
- [ ] Create `quest_stops` table
- [ ] Create `stamps` table
- [ ] Create `check_ins` table
- [ ] Create `user_stamps` table
- [ ] Create `itineraries` table
- [ ] Create `submissions` table
- [ ] Add indexes
- [ ] Add baseline RLS
- [ ] Add admin helper function
- [ ] Add seed data for one city
- [ ] Generate shared database types

## Phase 2 - Mobile Browse Flow

- [ ] Build login screen
- [ ] Build register screen
- [ ] Build city selector
- [ ] Build home screen
- [ ] Build quest list
- [ ] Build quest detail
- [ ] Build place detail
- [ ] Add published-quest filtering
- [ ] Add loading states
- [ ] Add empty states

## Phase 3 - Check-in and Passport

- [ ] Request location permission on demand
- [ ] Implement GPS distance check
- [ ] Create `check-in` edge function
- [ ] Award stamp on valid check-in
- [ ] Award XP on valid check-in
- [ ] Prevent duplicate reward issuance
- [ ] Build passport screen
- [ ] Show collected and locked stamps

## Phase 4 - Admin CMS

- [ ] Build admin login
- [ ] Build admin dashboard
- [ ] Build CRUD for cities
- [ ] Build CRUD for places
- [ ] Build CRUD for events
- [ ] Build CRUD for quests
- [ ] Build quest builder
- [ ] Build CRUD for stamps
- [ ] Build submissions review
- [ ] Enforce admin-only access

## Phase 5 - AI Itinerary

- [ ] Add AI provider interface
- [ ] Add mock AI provider
- [ ] Implement `generate-itinerary` edge function
- [ ] Validate itinerary JSON schema
- [ ] Reject invented place IDs
- [ ] Save itineraries
- [ ] Build itinerary generator screen
- [ ] Build itinerary result screen

## Phase 6 - Submissions and Operations

- [ ] Build submission form
- [ ] Save submissions to database
- [ ] Add parser for source text / link
- [ ] Show extracted fields to admin
- [ ] Approve or reject submissions
- [ ] Convert approved submissions to drafts

## Phase 7 - QA and Launch

- [ ] Add distance tests
- [ ] Add stamp-awarding tests
- [ ] Add quest-progress tests
- [ ] Add itinerary validation tests
- [ ] Add integration tests for check-in
- [ ] Add integration tests for itinerary generation
- [ ] Add analytics events
- [ ] Add demo share card
- [ ] Run beta release checklist

## Current completion rule

- Mark each item only when the repo contains the corresponding working implementation.
- Keep this file updated as the project moves forward.
