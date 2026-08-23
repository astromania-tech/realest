# Referral, Waitlist, and Rewards Development Tracker

## Purpose

This file tracks implementation progress for the RealEST waitlist, referral, reward, and launch-readiness system from design through delivery.

It is the persistent development context file for this workstream.

## Source Documents

- `docs/referral-waitlist-rewards-implementation-spec.md`
- `docs/referral-waitlist-rewards-e2e-checklist.md`
- `docs/realest-launch-strategy.md`
- `docs/realest-poll-and-referal-gamification.md`
- `docs/realest-premium-architecture.md`
- `docs/realest-premium-schema-and-evaluation.md`

## Locked Decisions

1. Reward systems are separated into `waitlist_cohort_rewards` and `referral_milestone_rewards`.
2. Everyone can join the waitlist.
3. Everyone can refer anyone.
4. Persona determines candidate role and reward eligibility.
5. The approved waitlist patience reward is:
   - first listing as an agent or property owner is free
   - valid within 6 months of launch
   - sent only to relevant personas in Launch Window messaging

## Current Repository Checkpoint

- Checkpoint commit created before build work begins
- Current checkpoint hash: `54de140`

## Phase Plan

### Phase 0: Baseline and Planning

Status: `completed`

Completed:

- clarified reward-system separation
- aligned launch-delay reward vs referral ladder
- restored repo lint to warning-only state
- checkpointed repository progress
- created implementation spec and tracker

### Phase 1: Schema and Types

Status: `completed`

Scope:

- extend waitlist schema with persona and ranking fields
- add reward entitlement tables
- add referral event tables
- regenerate Supabase types
- update Prisma schema if needed for typed app use

Exit criteria:

- schema merged
- generated types compile cleanly

### Phase 2: Waitlist Intake and Conversion

Status: `completed`

Scope:

- make persona mandatory in waitlist API and UI
- persist persona-aware lead fields
- derive candidate role on signup conversion
- preserve referral attribution across waitlist and registration

Exit criteria:

- user joins with persona
- signup conversion maps to candidate role correctly

### Phase 3: Reward Engine

Status: `completed`

Scope:

- grant waitlist cohort reward entitlements
- grant referral milestone entitlements idempotently
- compute queue score and queue rank
- add history and audit events

Exit criteria:

- reward entitlements are queryable and consistent

### Phase 4: Email Segmentation

Status: `completed`

Scope:

- split LaunchWindowEmail by persona
- align referral email copy to ladder rewards only
- update send orchestration to use persona targeting

Exit criteria:

- supply personas and non-supply personas receive correct Launch Window messaging

### Phase 5: Referral UX

Status: `completed`

Scope:

- revamp refer page
- add inviter resolution endpoint
- add social share tools
- add direct email invite workflow

Exit criteria:

- refer page works as a complete referral hub

### Phase 6: Profile Rewards UI

Status: `completed`

Scope:

- add rewards/referrals section to profile dashboard
- show entitlements, badges, milestones, rank, next steps

Exit criteria:

- user can inspect current reward state from profile

### Phase 7: Redemption and Launch Controls

Status: `completed`

Scope:

- redeem first-listing fee waiver during eligible listing flow
- respect 6-month window
- add early-access and leaderboard support hooks

Exit criteria:

- fee waiver is redeemable once and enforced correctly

## Change Log

### 2026-03-13

- created technical implementation spec
- created persistent development tracker
- confirmed reward-system separation
- confirmed persona-aware Launch Window segmentation requirement
- confirmed referral ladder remains separate from waitlist patience rewards
- completed migration `20260502000002_waitlist_persona_rewards.sql` for persona, ranking, and reward tables
- implemented shared persona and milestone helpers in `lib/referral-system.ts`
- implemented reward engine and event trail in `lib/reward-engine.ts`
- upgraded waitlist API and waitlist library to require/store persona and expose queue/reward context
- added role-sync and referral API endpoints:
   - `POST /api/auth/sync-waitlist-context`
   - `GET /api/referral/me`
   - `GET /api/referral/resolve`
   - `POST /api/referral/invite`
   - `POST /api/rewards/redeem-first-listing-waiver`
- integrated listing-waiver redemption in `app/api/dashboard/listings/route.ts`
- made `LaunchWindowEmail` persona-segmented for supply vs general messaging
- revamped `/refer` page into referral hub with inviter resolution, social sharing, copy-link, and direct email invite flow
- updated `WaitlistModal` to require persona and submit persona-aware payload fields
- integrated profile dashboard rewards panel in `app/(dashboard)/profile/page.tsx` using `GET /api/referral/me` with milestone, code sharing, invite, and entitlement visibility
- fixed referral invite payload typing in `app/api/referral/invite/route.ts` to match `ReferralInviteEmailData`
- validated implementation with `npm run typecheck` (pass) and `npm run lint` (0 errors, warning baseline unchanged)
- executed focused Phase 7 manual E2E checklist and recorded results in `docs/referral-waitlist-rewards-e2e-checklist.md`
- resolved E2E blocker by applying missing Supabase migration `20260502000002_waitlist_persona_rewards.sql` via `npx supabase db push`
- validated full flow after migration:
   - waitlist join (persona-aware, reward context returned)
   - referral attribution (referral count increment)
   - signup waitlist context sync (persona and candidate role copied to profile)
   - first-listing waiver redemption one-time enforcement (first redeem succeeds, second redeem blocked)

## Working Assumptions

1. `owner_landlord` and `agent` are the only currently approved personas for the launch-delay listing waiver.
2. Queue movement should be score-based, not direct manual position edits.
3. Referral milestone rewards should be idempotent and auditable.
4. Leaderboard mechanics may ship after core reward plumbing if needed.

## Risks

1. Existing waitlist rows may require backfill or migration defaults for persona.
2. Existing Launch Window audience may have received universal reward language that must be corrected prospectively.
3. Listing payment flow integration may surface additional schema dependencies.
4. Public leaderboard exposure may create privacy and abuse concerns.

## Next Execution Step

Run the same checklist in staging with a fresh, never-redeemed owner account and capture the evidence bundle for release sign-off.

[FINAL ANALYSIS]

Core Answer: This tracker is the durable execution log for the RealEST waitlist, referral, and reward build, preserving decisions, phase boundaries, risks, and checkpoint state from start to finish.
Confidence Level: 0.95
Key Caveats: It must be updated as each implementation phase lands or decisions change.
Logic Path: Converted the approved architecture into an execution tracker with locked decisions, phase gates, risk notes, and next-step continuity.