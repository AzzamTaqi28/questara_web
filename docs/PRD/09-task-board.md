# Questara Task Board

This board is the working order for agents. It splits the PRD into dependency-gated tasks so implementation can happen in a safe sequence.

## Board rules

- Treat each row as a discrete deliverable.
- Do not start a blocked task until its dependencies exist.
- Prefer vertical slices that unlock other work.
- Keep docs, schema, and code in sync when a shared contract changes.

## Status labels

- `done`: implemented and verified in repo
- `in-progress`: currently being worked on
- `ready`: unblocked and safe to start
- `blocked`: waiting on dependencies or a decision

## Priority order

1. Repo scaffold and tooling
2. Database schema and auth
3. Mobile browse flow
4. Check-in and passport loop
5. Admin CMS
6. AI itinerary
7. Submissions workflow
8. Testing and launch polish

## Execution board

### Phase 0 - Foundation

| ID | Task | Depends on | Owner lane | Status | Done when |
|---|---|---|---|---|---|
| P0-1 | Create monorepo scaffold | none | Lane A | ready | workspace builds and app folders exist |
| P0-2 | Add mobile app shell | P0-1 | Lane A | ready | mobile app boots locally |
| P0-3 | Add admin app shell | P0-1 | Lane A | ready | admin app boots locally |
| P0-4 | Add shared packages | P0-1 | Lane A | ready | `types`, `utils`, `ui`, `ai` exist |
| P0-5 | Add env examples and scripts | P0-1 | Lane A | ready | dev, lint, typecheck, test scripts documented |
| P0-6 | Add mock-data mode | P0-1 | Lane A | ready | app can run without backend secrets |

### Phase 1 - Data and Auth

| ID | Task | Depends on | Owner lane | Status | Done when |
|---|---|---|---|---|---|
| P1-1 | Create `profiles` and `cities` tables | P0-1 | Lane B | ready | auth/profile base exists |
| P1-2 | Create `places`, `events`, `quests` tables | P1-1 | Lane B | ready | core content model exists |
| P1-3 | Create `quest_stops` and `stamps` tables | P1-2 | Lane B | ready | quest and reward model exists |
| P1-4 | Create `check_ins` and `user_stamps` tables | P1-3 | Lane B | ready | reward history can be stored |
| P1-5 | Create `itineraries` and `submissions` tables | P1-2 | Lane B | ready | planning and intake can be stored |
| P1-6 | Add RLS and admin helper | P1-1 | Lane B | ready | data access is enforced |
| P1-7 | Add seed data for one city | P1-2 | Lane B | ready | demo city can be browsed |
| P1-8 | Generate shared DB types | P1-2 | Lane B | ready | types match schema |

### Phase 2 - Mobile Browse Flow

| ID | Task | Depends on | Owner lane | Status | Done when |
|---|---|---|---|---|---|
| P2-1 | Auth screens | P0-2, P1-1 | Lane C | ready | sign up / login / logout works |
| P2-2 | City selector | P1-1, P1-7 | Lane C | ready | active city can be set |
| P2-3 | Home screen | P2-2, P1-7 | Lane C | ready | featured content renders |
| P2-4 | Quest list | P1-2, P1-7 | Lane C | ready | published quests show correctly |
| P2-5 | Quest detail | P2-4, P1-3 | Lane C | ready | ordered stops and metadata render |
| P2-6 | Place detail | P1-2 | Lane C | ready | place data renders and links open safely |

### Phase 3 - Check-in and Passport

| ID | Task | Depends on | Owner lane | Status | Done when |
|---|---|---|---|---|---|
| P3-1 | Location permission flow | P2-6 | Lane C | ready | permission requested only on demand |
| P3-2 | Distance utility and validation | P1-2 | Lane B | ready | Haversine logic is tested |
| P3-3 | Check-in edge function | P3-2, P1-4, P1-6 | Lane B | ready | server validates rewards |
| P3-4 | Check-in UI | P3-1, P3-3 | Lane C | ready | success and failure states work |
| P3-5 | Passport screen | P1-4, P2-2 | Lane C | ready | stamps and progress show correctly |
| P3-6 | XP update logic | P3-3 | Lane B | ready | duplicate rewards do not happen |

### Phase 4 - Admin CMS

| ID | Task | Depends on | Owner lane | Status | Done when |
|---|---|---|---|---|---|
| P4-1 | Admin auth gating | P0-3, P1-6 | Lane D | ready | admin-only access is enforced |
| P4-2 | Dashboard | P4-1, P1-7 | Lane D | ready | core counts and recent activity show |
| P4-3 | CRUD for cities/places/events | P4-1, P1-2 | Lane D | ready | content can be managed |
| P4-4 | CRUD for quests/stamps | P4-1, P1-3 | Lane D | ready | quests and rewards can be managed |
| P4-5 | Quest builder | P4-4, P1-2 | Lane D | ready | stops can be ordered and saved |
| P4-6 | Submissions review | P4-1, P1-5 | Lane D | ready | admin can approve/reject/convert |

### Phase 5 - AI Itinerary

| ID | Task | Depends on | Owner lane | Status | Done when |
|---|---|---|---|---|---|
| P5-1 | AI provider abstraction | P0-4 | Lane E | ready | mock and real providers share an interface |
| P5-2 | Mock itinerary provider | P5-1, P1-7 | Lane E | ready | deterministic demo output exists |
| P5-3 | Itinerary schema validation | P5-1, P1-5 | Lane E | ready | invalid JSON is rejected |
| P5-4 | Generate-itinerary edge function | P5-2, P5-3 | Lane E | ready | database-only context is enforced |
| P5-5 | Itinerary screens | P5-4 | Lane C | ready | generator and result flows work |

### Phase 6 - Submissions and Operations

| ID | Task | Depends on | Owner lane | Status | Done when |
|---|---|---|---|---|---|
| P6-1 | Submission form | P2-1, P1-5 | Lane C | ready | users can submit event/place ideas |
| P6-2 | Parse-submission edge function | P6-1, P5-1 | Lane E | ready | source text becomes structured data |
| P6-3 | Admin review workflow | P4-6, P6-2 | Lane D | ready | submissions can be processed safely |

### Phase 7 - QA and Launch

| ID | Task | Depends on | Owner lane | Status | Done when |
|---|---|---|---|---|---|
| P7-1 | Unit tests for core logic | P3-2, P3-6, P5-3 | Lane F | ready | critical logic is covered |
| P7-2 | Integration tests | P3-3, P5-4, P6-2 | Lane F | ready | edge functions are validated |
| P7-3 | Analytics events | P2-3, P3-4, P5-5 | Lane F | ready | funnel is measurable |
| P7-4 | Error/empty/loading states | P2-3, P3-4, P5-5 | Lane C | ready | app is demo-safe |
| P7-5 | Share card and beta polish | P3-5, P7-3 | Lane F | ready | demo script can run end-to-end |

## Current project summary

- Docs are complete enough for implementation kickoff.
- Runtime product work has not started.
- The true implementation status should be updated from the codebase as milestones land.

## Suggested reporting format for agents

When an agent finishes work, report:

- phase and task IDs completed
- files changed
- tests run
- blockers remaining
- updated estimate for project progress

## Suggested progress model

Use weighted phases for a more honest percentage:

- Phase 0: 10%
- Phase 1: 20%
- Phase 2: 15%
- Phase 3: 15%
- Phase 4: 15%
- Phase 5: 10%
- Phase 6: 10%
- Phase 7: 5%

Compute overall progress as:

`completed phase weight + partial task completion inside the current phase`

For the current repo state, product implementation remains `0%` because no runtime phase is complete yet.
