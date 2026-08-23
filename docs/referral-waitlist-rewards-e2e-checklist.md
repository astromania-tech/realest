# Referral/Waitlist/Rewards E2E Checklist

## Scope

Focused manual verification for Phase 7:

1. waitlist join
2. referral attribution
3. signup waitlist-context sync
4. first-listing waiver redemption

## Execution Date

- 2026-03-13

## Environment

- app: local `next dev` server (`http://localhost:3000`)
- database: remote Supabase project `rzclzcermmfrbvvjegwg`

## Pre-Check

### Migration alignment

- Initial failure observed before migration:
  - `candidate_role` column missing
  - `queue_rank` column missing
- Resolution:
  - applied pending migration with `npx supabase db push`
  - migration applied: `20260502000002_waitlist_persona_rewards.sql`

## Checklist Results

### 1) Waitlist join (persona-aware)

Status: `pass`

Evidence:

- request persona: `owner_landlord`
- response included:
  - `candidateRole: owner`
  - `referralCode`
  - `waitlistReward` copy

Sample account:

- `e2e.ref.20260313020020@example.com`

### 2) Referral attribution

Status: `pass`

Evidence:

- referred user joined with `ref` from step 1
- referrer count incremented in waitlist lookup response
- server logs show referral attribution and referral success notification dispatch

Sample pair:

- referrer: `e2e.ref.20260313020020@example.com`
- referred: `e2e.referred.20260313020020@example.com`

### 3) Signup waitlist-context sync

Status: `pass`

Evidence:

- `POST /api/auth/sync-waitlist-context` returned `ok: true`
- profile context reflected waitlist state:
  - `waitlist_persona: owner_landlord`
  - `candidate_role: owner`
  - `launch_reward_window_ends_at` set

Sample account:

- `e2e.owner.20260313020127@example.com`
- profile id: `8a3e0f94-e257-4d6e-a1cf-61d1b2266ce1`

### 4) First-listing waiver redemption (one-time enforcement)

Status: `pass`

Evidence:

- first redemption returns `redeemed: true`
- second redemption returns:
  - `redeemed: false`
  - `reason: No active first-listing fee waiver found.`

Validated entitlement:

- `754d79ac-e1b1-4654-8e36-6b151fee4238`

Note:

- this check used a known E2E entitlement and confirmed one-time behavior at function level.

## Summary

Overall result: `pass` after schema migration alignment.

The Phase 7 flow is functioning as designed, including one-time redemption enforcement for the owner/agent first-listing waiver.

## Follow-Up

- Repeat the same checklist in staging using a fresh, never-redeemed owner account for release sign-off evidence.
