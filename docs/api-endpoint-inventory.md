# RealEST API Endpoint Inventory & OpenAPI Documentation Plan

**Total Endpoints: 85**  
**Status: 0 with openApi exports, 85 pending**  
**Target: Document all 85 endpoints with Swagger/OpenAPI**

---

## API Endpoint Breakdown by Category

### 1. PROPERTIES (20 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 1 | `/api/properties` | GET | List/search properties with filters | ❌ |
| 2 | `/api/properties` | POST | Create new property listing | ❌ |
| 3 | `/api/properties/[id]` | GET | Get single property full details | ❌ |
| 4 | `/api/properties/[id]` | PUT | Update property (owner only) | ❌ |
| 5 | `/api/properties/[id]` | DELETE | Delete property (owner only) | ❌ |
| 6 | `/api/properties/[id]/public` | GET | Get public property view | ❌ |
| 7 | `/api/properties/[id]/media` | GET | Get property media (images/videos) | ❌ |
| 8 | `/api/properties/[id]/media` | POST | Upload media for property | ❌ |
| 9 | `/api/properties/[id]/documents` | GET | Get property documents | ❌ |
| 10 | `/api/properties/[id]/documents` | POST | Upload documents for property | ❌ |
| 11 | `/api/properties/[id]/reviews` | GET | Get property reviews | ❌ |
| 12 | `/api/properties/[id]/reviews` | POST | Create property review | ❌ |
| 13 | `/api/properties/[id]/favorites` | POST | Save property to favorites | ❌ |
| 14 | `/api/properties/[id]/favorites` | DELETE | Remove property from favorites | ❌ |
| 15 | `/api/properties/[id]/duplicate-check` | POST | Check for duplicate properties | ❌ |
| 16 | `/api/properties/owner` | GET | Get current user's properties | ❌ |
| 17 | `/api/properties/explore` | GET | Get featured/explore properties | ❌ |
| 18 | `/api/search/properties` | GET | Advanced property search (geospatial) | ❌ |
| 19 | `/api/saved-properties` | GET | Get user's saved/favorite properties | ❌ |
| 20 | `/api/saved-properties` | POST/DELETE | Add/remove saved properties | ❌ |

### 2. INQUIRIES (5 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 21 | `/api/inquiries` | GET | Get user's inquiries | ❌ |
| 22 | `/api/inquiries` | POST | Create new inquiry | ❌ |
| 23 | `/api/inquiries/[id]` | GET | Get single inquiry details | ❌ |
| 24 | `/api/inquiries/[id]` | PUT | Update inquiry status/response | ❌ |
| 25 | `/api/inquiries/guest` | POST | Guest inquiry (no auth required) | ❌ |

### 3. AUTHENTICATION (6 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 26 | `/api/auth/forgot-password` | POST | Initiate password reset flow | ❌ |
| 27 | `/api/auth/verify-reset-otp` | POST | Verify OTP for password reset | ❌ |
| 28 | `/api/auth/password-changed` | POST | Confirm password change | ❌ |
| 29 | `/api/auth/attribute-referral` | POST | Attribute signup to referral code | ❌ |
| 30 | `/api/auth/sync-waitlist-context` | POST | Sync waitlist context on auth | ❌ |
| 31 | `/api/profile` | GET | Get current user profile | ❌ |
| 32 | `/api/profile` | PUT | Update current user profile | ❌ |

### 4. DASHBOARD - OWNER (6 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 33 | `/api/dashboard/listings` | GET | Get owner's property listings | ❌ |
| 34 | `/api/dashboard/listings` | POST | Create new listing (owner) | ❌ |
| 35 | `/api/dashboard/listings/[id]` | GET | Get listing details (owner view) | ❌ |
| 36 | `/api/dashboard/listings/[id]` | PUT | Update listing (owner) | ❌ |
| 37 | `/api/dashboard/listings/[id]` | DELETE | Delete listing (owner) | ❌ |
| 38 | `/api/dashboard/listings/[id]/renew` | POST | Renew listing (owner) | ❌ |
| 39 | `/api/dashboard/listings/[id]/media` | GET/POST | Manage listing media (owner) | ❌ |
| 40 | `/api/dashboard/listings/[id]/documents` | GET/POST | Manage listing documents (owner) | ❌ |
| 41 | `/api/dashboard/listings/[id]/duplicate-check` | GET | Check for duplicates (owner) | ❌ |
| 42 | `/api/dashboard/owner/inquiries` | GET | Get owner's inquiries received | ❌ |
| 43 | `/api/dashboard/owner/inquiries/[id]` | GET | Get single inquiry (owner) | ❌ |
| 44 | `/api/dashboard/owner/inquiries/[id]` | PUT | Update inquiry (owner) | ❌ |
| 45 | `/api/dashboard/owner/inquiries/[id]/respond` | POST | Respond to inquiry (owner) | ❌ |
| 46 | `/api/dashboard/owner/inquiries/[id]/close` | POST | Close inquiry (owner) | ❌ |

### 5. AGENTS (3 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 47 | `/api/agents` | GET | List verified agents | ❌ |
| 48 | `/api/agents/[id]` | GET | Get agent profile details | ❌ |
| 49 | `/api/agents/[id]/properties` | GET | Get agent's listed properties | ❌ |

### 6. ADMIN - PROPERTIES (4 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 50 | `/api/admin/properties` | GET | Get properties pending admin review | ❌ |
| 51 | `/api/admin/properties` | PUT | Approve/reject property | ❌ |
| 52 | `/api/admin/properties/[id]/vet` | PUT | Admin property vetting | ❌ |
| 53 | `/api/admin/properties/[id]/ml-update` | PUT | Admin ML validation update | ❌ |

### 7. ADMIN - VALIDATION (ML) (6 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 54 | `/api/admin/validation/document` | POST | Validate property document (ML) | ❌ |
| 55 | `/api/admin/validation/image` | POST | Validate property image (ML) | ❌ |
| 56 | `/api/admin/validation/duplicates` | POST | Check for duplicate properties | ❌ |
| 57 | `/api/admin/validation/vetting` | GET | Get vetting tasks | ❌ |
| 58 | `/api/admin/validation/vetting/[id]` | POST | Complete vetting task | ❌ |
| 59 | `/api/admin/validation/ml` | GET | Get ML validation results | ❌ |
| 60 | `/api/admin/validation/ml/[id]` | POST | Update ML validation result | ❌ |

### 8. ADMIN - DUPLICATES (1 endpoint)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 61 | `/api/admin/duplicates/[id]/resolve` | PUT | Resolve duplicate detection | ❌ |

### 9. ADMIN - USERS (3 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 62 | `/api/admin/users` | GET | Get all users (admin) | ❌ |
| 63 | `/api/admin/users/[id]` | GET | Get user details (admin) | ❌ |
| 64 | `/api/admin/users/[id]/suspend` | POST | Suspend/unsuspend user | ❌ |

### 10. ADMIN - EMAILS (7 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 65 | `/api/admin/emails/send-test` | POST | Send test email | ❌ |
| 66 | `/api/admin/emails/render` | GET | Render email template | ❌ |
| 67 | `/api/admin/emails/campaigns` | GET | Get email campaigns | ❌ |
| 68 | `/api/admin/emails/campaigns` | POST | Create email campaign | ❌ |
| 69 | `/api/admin/emails/campaigns/[id]` | GET | Get campaign details | ❌ |
| 70 | `/api/admin/emails/campaigns/[id]` | PATCH | Update campaign | ❌ |
| 71 | `/api/admin/emails/campaigns/[id]` | DELETE | Delete campaign | ❌ |
| 72 | `/api/admin/emails/campaigns/[id]/send` | POST | Send campaign | ❌ |
| 73 | `/api/admin/emails/campaigns/[id]/recipients` | GET | Get campaign recipients | ❌ |
| 74 | `/api/admin/emails/campaigns/[id]/preview` | GET | Preview campaign | ❌ |
| 75 | `/api/admin/emails/audiences` | GET | Get email audiences | ❌ |

### 11. ADMIN - ANALYTICS (4 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 76 | `/api/admin/analytics/overview` | GET | Analytics overview | ❌ |
| 77 | `/api/admin/analytics/[metric]` | GET | Get specific metric | ❌ |
| 78 | `/api/admin/analytics/referrals` | GET | Referral analytics | ❌ |
| 79 | `/api/admin/analytics/polls` | GET | Poll analytics | ❌ |

### 12. ADMIN - OTHER (4 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 80 | `/api/admin/reports/vetting` | GET | Vetting reports | ❌ |
| 81 | `/api/admin/waitlist/[id]` | DELETE | Delete waitlist entry | ❌ |
| 82 | `/api/admin/waitlist/[id]/email` | POST | Send email to waitlist | ❌ |
| 83 | `/api/admin/verify-agent` | POST | Verify agent (admin) | ❌ |
| 84 | `/api/admin/subadmins` | POST | Create sub-admin | ❌ |

### 13. REFERRAL & REWARDS (3 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 85 | `/api/referral/me` | GET | Get user's referral data | ❌ |
| 86 | `/api/referral/invite` | POST | Generate referral invite | ❌ |
| 87 | `/api/referral/resolve` | GET | Resolve referral code | ❌ |
| 88 | `/api/rewards/redeem-first-listing-waiver` | POST | Redeem listing waiver | ❌ |

### 14. WAITLIST (3 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 89 | `/api/waitlist` | GET | Get waitlist entries | ❌ |
| 90 | `/api/waitlist` | POST | Add to waitlist | ❌ |
| 91 | `/api/waitlist` | DELETE | Remove from waitlist | ❌ |

### 15. POLLS (4 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 92 | `/api/poll/catalog` | GET | Get poll catalog | ❌ |
| 93 | `/api/poll/city` | POST | Submit city poll | ❌ |
| 94 | `/api/poll/submit` | POST | Submit poll response | ❌ |
| 95 | `/api/poll/submission/[id]` | GET | Get poll submission | ❌ |

### 16. UPLOAD & FILES (1 endpoint)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 96 | `/api/upload/signed-url` | POST | Generate S3 signed URL | ❌ |

### 17. GEOLOCATION (2 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 97 | `/api/geocode` | GET/POST | Geocode address/coordinates | ❌ |
| 98 | `/api/system/geocode` | GET | System geocode endpoint | ❌ |

### 18. NOTIFICATIONS (1 endpoint)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 99 | `/api/notifications` | GET/POST | Get/manage notifications | ❌ |

### 19. SYSTEM/HEALTH (3 endpoints)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 100 | `/api/system/health` | GET | System health check | ❌ |
| 101 | `/api/system/status` | GET | System status | ❌ |
| 102 | `/api/system/amenities` | GET | Get available amenities | ❌ |

### 20. EMAIL (1 endpoint)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 103 | `/api/email/welcome` | POST | Send welcome email | ❌ |

### 21. WEBHOOKS (1 endpoint)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 104 | `/api/webhooks/audience-sync` | POST | Webhook: audience sync (Resend) | ❌ |

### 22. DOCS (1 endpoint)

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 105 | `/api/docs/openapi.json` | GET | OpenAPI spec (auto-generated) | ❌ |

---

## Documentation Priority Tiers

### TIER 1 - HIGH PRIORITY (Must have, core features)
These 30 endpoints are most used and should be documented first:

1. **Properties (20)**
   - `/api/properties` GET/POST
   - `/api/properties/[id]` GET/PUT/DELETE
   - `/api/properties/[id]/media` GET/POST
   - `/api/properties/[id]/documents` GET/POST
   - `/api/search/properties` GET
   - `/api/saved-properties` GET/POST/DELETE

2. **Inquiries (5)**
   - All inquiry endpoints (core user feature)

3. **Profile (2)**
   - `/api/profile` GET/PUT

4. **Dashboard Listings (3)**
   - `/api/dashboard/listings` GET/POST/[id] GET/PUT

### TIER 2 - MEDIUM PRIORITY (Important but less used)
20 endpoints for admin/secondary features:

1. **Admin Properties (4)**
   - All admin property endpoints

2. **Admin Validation (6)**
   - Document, image, duplicate checking

3. **Agents (3)**
   - List agents, agent profiles

4. **Dashboard Owner Inquiries (4)**
   - Owner inquiry management

5. **Auth (3)**
   - Password reset, profile updates

### TIER 3 - LOW PRIORITY (Support/utility endpoints)
35 endpoints for edge cases:

1. Admin users, emails, analytics
2. Waitlist, polls, referral
3. System health, webhooks
4. Geolocation, notifications

---

## OpenAPI Export Structure Pattern

Every route needs this export:

```typescript
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'

export const openApi: OpenApiMetadata = {
  method: 'post',              // get, post, put, patch, delete
  summary: 'Short summary',
  description: 'Longer description',
  tags: ['Properties'],         // For grouping in Swagger UI
  security: [{ bearerAuth: [] }], // If auth required
  parameters: [],              // Query, path, header params
  requestBody: {               // For POST/PUT
    required: true,
    content: {
      'application/json': {
        schema: { /* ... */ }
      }
    }
  },
  responses: {
    '200': { description: 'Success', content: { /* ... */ } },
    '400': { description: 'Bad request' },
    '401': { description: 'Unauthorized' }
  }
}
```

---

## Documentation Task Checklist

### ✅ PHASE 1 - TIER 1 (30 endpoints) - Week 1
- [ ] Properties endpoints (1-20)
- [ ] Inquiries endpoints (21-25)
- [ ] Profile endpoints (31-32)
- [ ] Dashboard listings (33-39)
- [ ] Verify all openApi exports are valid TypeScript
- [ ] Run `npm run generate:api-spec`
- [ ] Test Swagger UI at `/api-docs`

### ⏳ PHASE 2 - TIER 2 (20 endpoints) - Week 2
- [ ] Admin properties (50-53)
- [ ] Admin validation (54-60)
- [ ] Agents (47-49)
- [ ] Dashboard owner inquiries (42-46)
- [ ] Auth endpoints (26-30)

### ⏳ PHASE 3 - TIER 3 (35 endpoints) - Week 3
- [ ] Admin users/emails/analytics
- [ ] Waitlist, polls, referral
- [ ] System utilities
- [ ] Complete coverage of all 85 endpoints

---

## Next Immediate Action

**Start with TIER 1 endpoints and work systematically:**

1. Open `/app/api/properties/route.ts`
2. Add the `openApi` export (copy pattern from guide)
3. Move to next file
4. Run `npm run generate:api-spec` after every 5-10 files
5. Test at `/api-docs` to verify docs appear

---

## Tools & Files

- **Guide**: `docs/api-auto-documentation.md` (complete examples)
- **Metadata Interface**: `lib/openapi/route-metadata.ts` (types)
- **Zod Converter**: `lib/openapi/zod-to-schema.ts` (for converting schemas)
- **Generator**: `scripts/generate-api-spec-dynamic.mjs` (builds spec)
- **Route Contract**: Export `openApi: OpenApiMetadata` from each route

**Result**: Every route becomes self-documenting. Swagger UI auto-updates as you add metadata exports.
