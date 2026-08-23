# RealEST Referral, Waitlist, and Rewards Implementation Spec

## Purpose

This document is the implementation source of truth for the RealEST pre-launch waitlist, referral, reward, and segmentation system.

It formalizes the separation between:

1. `waitlist_cohort_rewards`
2. `referral_milestone_rewards`

It also defines how waitlist intent influences role assignment, email targeting, reward eligibility, queue position, and premium/supply-side conversion.

## Product Principles

1. Anyone can join the waitlist.
2. Anyone can refer anyone.
3. Waitlist intent determines candidate role and downstream reward eligibility.
4. Listing-related benefits are redeemable only by eligible supply-side personas.
5. Referral rewards and waitlist patience rewards are separate systems.
6. Reward fulfillment must be event-driven, idempotent, and auditable.
7. The system must optimize for qualified demand, qualified supply, and long-term conversion tracking.

## Canonical Personas

The waitlist must collect a required `persona` field at the point of entry.

Allowed values:

- `buyer_renter`
- `owner_landlord`
- `agent`
- `investor`
- `developer_agency`
- `bank_mortgage`

These personas are the canonical segmentation layer for:

- email journeys
- poll questions
- referral messaging
- candidate role assignment
- reward qualification
- early access prioritization

## Role Assignment Model

Persona is not identical to final platform role, but it determines role candidacy.

Role mapping:

- `buyer_renter` -> `user`
- `investor` -> `user`
- `bank_mortgage` -> `user`
- `owner_landlord` -> `owner` candidate
- `agent` -> `agent` candidate
- `developer_agency` -> `owner` or admin-defined supply role candidate

Rules:

1. Candidate role is established from the waitlist record at signup conversion.
2. Final listing privileges are only granted after account completion and any required verification steps.
3. Listing-fee waivers and listing-specific rewards are redeemable only by eligible roles.

## Reward System Separation

### Waitlist Cohort Rewards

Purpose:

- reward early commitment
- compensate for launch delay
- incentivize qualified supply-side onboarding

Current approved waitlist reward:

- users who joined the waitlist with persona `owner_landlord` or `agent` receive:
  - `first_listing_fee_waiver`
  - valid for the first eligible listing only
  - valid for 6 months after launch

Redemption conditions:

1. user must have converted to a platform account
2. user must have an eligible role (`owner` or `agent`)
3. user must submit an eligible first listing
4. reward must still be inside the 6-month launch window
5. reward must not already be redeemed

Non-eligible personas do not receive this listing reward.

### Referral Milestone Rewards

Purpose:

- drive viral waitlist growth
- create status and exclusivity
- support queue progression and early-access prioritization

Canonical ladder:

- `3` referrals -> `early_sneak_peek`
- `5` referrals -> `move_up_waitlist`
- `10` referrals -> `early_access`
- `20` referrals -> `realest_insider_badge`
- `50` referrals -> `vip_launch_access`
- `100` referrals -> `realest_ambassador`

These rewards are not listing-fee waivers unless explicitly added later as supply-side incentives.

## Event Model

The reward system must be event-driven.

Core events:

- `waitlist_joined`
- `waitlist_profile_completed`
- `poll_completed`
- `referral_link_clicked`
- `referral_attributed`
- `referral_count_incremented`
- `waitlist_rank_recomputed`
- `account_created_from_waitlist`
- `role_candidate_assigned`
- `role_activated`
- `first_listing_submitted`
- `first_listing_fee_waiver_redeemed`
- `reward_entitlement_granted`
- `reward_entitlement_redeemed`

Every reward grant must be traceable to one or more events.

## Data Model

### Existing Tables To Extend

`waitlist`

Add fields:

- `persona text not null`
- `persona_details jsonb null`
- `queue_score integer not null default 0`
- `queue_rank integer null`
- `candidate_role text null`
- `poll_completion_count integer not null default 0`
- `waitlist_reward_eligible boolean not null default false`

`profiles`

Add fields:

- `waitlist_persona text null`
- `candidate_role text null`
- `role_activated_at timestamptz null`
- `launch_reward_window_ends_at timestamptz null`

### New Tables

`reward_catalog`

- `id`
- `key`
- `name`
- `reward_system` (`waitlist_cohort` | `referral_milestone`)
- `description`
- `is_redeemable`
- `metadata jsonb`

`reward_entitlements`

- `id`
- `user_email` or `profile_id` depending on lifecycle stage
- `waitlist_id null`
- `profile_id null`
- `reward_key`
- `source_event`
- `source_referral_count null`
- `status` (`active` | `redeemed` | `expired` | `revoked`)
- `granted_at`
- `expires_at null`
- `metadata jsonb`

`reward_redemptions`

- `id`
- `entitlement_id`
- `profile_id`
- `redemption_context`
- `redemption_reference_id null`
- `redeemed_at`
- `metadata jsonb`

`referral_events`

- `id`
- `referrer_waitlist_id null`
- `referrer_profile_id null`
- `referred_waitlist_id null`
- `referred_profile_id null`
- `referral_code`
- `event_type`
- `metadata jsonb`
- `created_at`

`waitlist_rank_history`

- `id`
- `waitlist_id`
- `rank`
- `score`
- `reason`
- `created_at`

## Queue Score and Ranking Model

Queue position must be score-driven rather than manually mutated.

Initial model:

- base join order score
- referral milestone boosts
- poll completion boosts
- supply-side persona bonus

Illustrative weighting:

- waitlist join: `100`
- complete required persona profile: `25`
- complete first poll: `20`
- each valid referral: `15`
- `owner_landlord` persona bonus: `15`
- `agent` persona bonus: `20`
- `developer_agency` persona bonus: `25`
- milestone `move_up_waitlist`: additional `40`

These values are operational defaults and may be tuned later.

## API Surface

### Waitlist

`POST /api/waitlist`

Required request body:

- `email`
- `firstName`
- `persona`

Optional request body:

- `lastName`
- `phone`
- `source`
- `ref`
- `location_preference`
- `property_type_preference`
- `budget_range`
- `interests`
- `utm_source`
- `utm_medium`
- `utm_campaign`

Server responsibilities:

- validate persona
- create/update waitlist record
- preserve referral attribution
- compute candidate role
- assign waitlist cohort reward eligibility
- enqueue/send confirmation email variant

`GET /api/waitlist?email=...`

Should return:

- existence
- active status
- queue rank
- queue score
- persona
- milestone progress summary

### Referral

`GET /api/referral/resolve?code=...`

Returns safe public inviter context:

- inviter first name
- referral code
- public badge/milestone state if available

`GET /api/referral/me`

Returns:

- referral code
- valid referral count
- current milestone
- next milestone
- queue rank
- queue score
- active entitlements
- share url

`POST /api/referral/invite`

Body:

- `name`
- `email`
- `referralCode`

Responsibilities:

- validate sender eligibility
- dedupe outbound invitations
- rate limit abuse
- send referral invite email

### Rewards

`POST /api/rewards/recompute`

Internal/admin use.

Responsibilities:

- recalculate entitlements from current state
- backfill rewards safely

`POST /api/rewards/redeem-first-listing-waiver`

Internal or service-side hook during listing creation.

Responsibilities:

- verify active entitlement
- verify role eligibility
- verify 6-month window
- mark entitlement redeemed atomically

## Email Segmentation

### LaunchWindowEmail

Must become persona-aware.

Version A: supply-side (`owner_landlord`, `agent`)

Message:

- your first listing as an agent or property owner within 6 months of launch will be free

Version B: general (`buyer_renter`, `investor`, `bank_mortgage`)

Message:

- progress update, trust narrative, and launch transparency only
- no listing reward promise

Version C: optional developer/agency version

- supply-focused but may use a different premium/partnership offer later

### Referral Emails

Referral emails must communicate only referral milestone rewards and leaderboard/status mechanics.

They must not communicate waitlist patience rewards.

## UI Surfaces

### Refer Page

`app/(email-links)/refer/page.tsx`

Required changes:

- show inviter first name when arriving with a valid code
- show code confirmation state
- provide share actions for X, Facebook, LinkedIn, WhatsApp, Telegram, and copy-link
- provide direct refer-by-name-and-email form
- display referral ladder progress and next milestone copy

### Waitlist Modal

Required changes:

- persona selection is mandatory
- progressive fields are persona-aware
- copy changes based on selected persona
- supply-side personas receive explicit explanation of listing-fee waiver eligibility

### Profile Dashboard

Required changes:

- add rewards/referrals module to profile page
- show current waitlist reward entitlement state
- show referral milestone progress
- show badges and leaderboard state
- show role activation requirements when reward exists but is not yet redeemable

## Abuse Controls

1. no self-referrals by same user id
2. no duplicate reward grants for same milestone
3. invite endpoint rate-limited per sender and per IP
4. referral credit only for valid new joins
5. suspicious referral clusters can be soft-flagged for review

## Rollout Strategy

### Phase 1

- schema changes
- waitlist persona capture
- LaunchWindowEmail segmentation
- reward entitlement tables

### Phase 2

- referral milestone engine
- refer page rebuild
- profile rewards module

### Phase 3

- listing waiver redemption
- leaderboard and rank history
- analytics and admin tools

## Acceptance Criteria

The implementation is complete when:

1. every waitlist signup requires persona selection
2. supply-side personas receive the correct waitlist reward entitlement
3. LaunchWindowEmail sends persona-correct reward copy
4. referrals grant only referral ladder rewards
5. queue rank and score are queryable and visible to the user
6. refer page supports social sharing and direct invite flow
7. profile page shows entitlements, milestone progress, and redemption state
8. first listing fee waiver redeems once, only for eligible roles, only within 6 months of launch

## Open Policy Questions

These must be locked before implementation completes:

1. whether `developer_agency` receives the same first-listing waiver as owner/agent
2. whether referral credit occurs at waitlist join only or after email verification
3. whether launch week referral multipliers will ship in v1
4. whether leaderboard is public, private, or top-N only
5. whether early access rollout is strictly top-rank or segmented by persona quotas

[FINAL ANALYSIS]

Core Answer: This spec defines the end-to-end architecture for a persona-aware waitlist and referral system with separate waitlist cohort rewards and referral milestone rewards, explicit role mapping, event-driven entitlements, segmented emails, and redeemable supply-side benefits.
Confidence Level: 0.94
Key Caveats: Final implementation depends on policy constants for persona treatment, referral validity, leaderboard exposure, and launch cohort logic.
Logic Path: Decomposed the system into persona capture, reward separation, event model, data model, API surface, email segmentation, UI surfaces, and rollout phases, then synthesized them into an implementable repository spec.