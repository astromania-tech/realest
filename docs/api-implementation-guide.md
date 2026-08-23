# API OpenAPI Documentation Implementation Guide

**Total Endpoints: 85**
**Currently Documented: 13 (15%)**
**Target: 100% (85/85)**

---

## Quick Summary

You now have a working foundation:
- ✅ 13 endpoints with openApi metadata exports
- ✅ TypeScript types defined (`lib/openapi/route-metadata.ts`)
- ✅ Inventory document listing all 85 endpoints
- ✅ Complete spec template (`lib/openapi/complete-spec.ts`)
- ✅ Generator script ready (`scripts/generate-api-spec-dynamic.mjs`)

**Current Blocker**: Generator needs TypeScript runtime enhancement to load .ts files. But this doesn't block documentation!

---

## Implementation Strategy: Three Tiers

### TIER 1: Core Features (30 endpoints) - HIGH IMPACT
These are the most critical, most-used APIs. Document these first.

**Properties (20 endpoints)**
```
app/api/properties/route.ts ✅ DONE
  ├─ GET: Search properties ✅
  └─ POST: Create property ✅

app/api/properties/[id]/route.ts ✅ DONE
  ├─ GET: Get property details ✅
  ├─ PUT: Update property ✅
  └─ DELETE: Delete property ✅

app/api/properties/[id]/media/route.ts ❌ TODO
  ├─ GET: Get media
  └─ POST: Upload media

app/api/properties/[id]/documents/route.ts ❌ TODO
  ├─ GET: Get documents
  └─ POST: Upload documents

app/api/properties/[id]/reviews/route.ts ❌ TODO
  ├─ GET: Get reviews
  └─ POST: Create review

app/api/properties/[id]/favorites/route.ts ❌ TODO
  ├─ POST: Add to favorites
  └─ DELETE: Remove from favorites

app/api/properties/[id]/duplicate-check/route.ts ❌ TODO
  └─ POST: Check duplicates

app/api/properties/[id]/public/route.ts ❌ TODO
  └─ GET: Public property view

app/api/properties/owner/route.ts ❌ TODO
  └─ GET: Get user's properties

app/api/properties/explore/route.ts ❌ TODO
  └─ GET: Featured properties

app/api/search/properties/route.ts ✅ DONE
  └─ GET: Advanced search ✅

app/api/saved-properties/route.ts ✅ DONE
  ├─ GET: Get saved properties ✅
  ├─ POST: Save property ✅
  └─ DELETE: Remove saved ✅
```

**Inquiries (5 endpoints)**
```
app/api/inquiries/route.ts ✅ DONE
  ├─ GET: List inquiries ✅
  └─ POST: Create inquiry ✅

app/api/inquiries/[id]/route.ts ❌ TODO
  ├─ GET: Get inquiry
  └─ PUT: Update inquiry

app/api/inquiries/guest/route.ts ❌ TODO
  └─ POST: Guest inquiry
```

**Profile & Auth (5 endpoints)**
```
app/api/profile/route.ts ✅ DONE
  ├─ GET: Get profile ✅
  └─ PUT: Update profile ✅

app/api/auth/forgot-password/route.ts ❌ TODO
  └─ POST

app/api/auth/verify-reset-otp/route.ts ❌ TODO
  └─ POST

app/api/auth/password-changed/route.ts ❌ TODO
  └─ POST

app/api/auth/sync-waitlist-context/route.ts ❌ TODO
  └─ POST
```

---

## Batch Implementation Plan

### Batch 1: Properties Media & Documents (4 files = 8 endpoints)
**Time: ~20 minutes**
- [ ] `/api/properties/[id]/media/route.ts` - GET, POST
- [ ] `/api/properties/[id]/documents/route.ts` - GET, POST  
- [ ] `/api/properties/[id]/reviews/route.ts` - GET, POST
- [ ] `/api/properties/[id]/favorites/route.ts` - POST, DELETE
- [ ] `/api/properties/[id]/duplicate-check/route.ts` - POST
- [ ] `/api/properties/[id]/public/route.ts` - GET
- [ ] `/api/properties/owner/route.ts` - GET
- [ ] `/api/properties/explore/route.ts` - GET

**Template for each:**
```typescript
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'

/**
 * OpenAPI metadata for [METHOD] [PATH]
 * Documented endpoint: [DESCRIPTION]
 */
export const openApi[METHOD]: OpenApiMetadata = {
  method: '[get|post|put|patch|delete]',
  summary: 'One-line summary',
  description: 'Longer description of what this does',
  tags: ['Category'],
  security: [{ bearerAuth: [] }], // if auth required
  parameters: [...], // if needed
  requestBody: { ... }, // if POST/PUT
  responses: {
    '200': { description: 'Success', content: { ... } },
    '400': { description: 'Bad request' },
    '401': { description: 'Unauthorized' },
  },
}

// [METHOD] /path
export async function [METHOD](request: NextRequest) {
  // ...existing code...
}
```

### Batch 2: Inquiries & Auth (3 files = 7 endpoints)
**Time: ~15 minutes**
- [ ] `/api/inquiries/[id]/route.ts` - GET, PUT
- [ ] `/api/inquiries/guest/route.ts` - POST
- [ ] Auth endpoints

### Batch 3: Dashboard (5 files = 9 endpoints)
**Time: ~25 minutes**
- [ ] `/api/dashboard/listings/route.ts` - GET, POST
- [ ] `/api/dashboard/listings/[id]/route.ts` - GET, PUT, DELETE
- [ ] `/api/dashboard/listings/[id]/media/route.ts` - GET, POST
- [ ] `/api/dashboard/listings/[id]/documents/route.ts` - GET, POST
- [ ] `/api/dashboard/owner/inquiries/route.ts` - GET
- Plus other dashboard endpoints

### Batch 4-6: TIER 2 & 3
Continue with Admin, Agents, System endpoints

---

## After Adding Metadata

### 1. Verify TypeScript
```bash
npm run typecheck
# or
npx tsc --noEmit
```

### 2. Generate Spec
```bash
npm run generate:api-spec
```

**Expected Output:**
```
🔄 Generating OpenAPI specification...
✅ OpenAPI spec generated successfully!
📄 Saved to: lib\openapi\generated.json
📊 Endpoints: [number should increase from 4]
🏷️  Schemas: [number of unique schemas]
```

### 3. Test in Swagger UI
```bash
npm run dev
# Visit: http://localhost:3000/api-docs
```

Look for:
- ✅ All endpoints appear in list
- ✅ Correct HTTP method (GET, POST, etc.)
- ✅ Parameters and request bodies shown
- ✅ "Try it out" buttons work
- ✅ Responses match definition

---

## Recommended Order (Priority)

1. **TIER 1 Properties** (Batches 1-3) - HIGH VALUE, most-used
2. **Admin Validation** - ML validation endpoints, important for platform
3. **System Endpoints** - Health, status, amenities
4. **Everything Else** - Referral, polls, webhooks, etc.

---

## Tips & Tricks

### Finding What Parameters/Schema to Use

**Look at the route code:**
```typescript
// 1. Existing validation schemas
const updatePropertySchema = propertyListingSchema.partial()

// 2. Extract parameter info
const { searchParams } = new URL(request.url)
const propertyId = searchParams.get("property_id")  // → parameter

// 3. Look at Prisma includes
where: { id: property_id, status: "live" }  // → helps document filters
```

### Response Codes to Always Include

- `200` - Success
- `201` - Created (for POST)
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (duplicate, already saved, etc.)
- `500` - Server error

### Security Rules

- Auth required: Add `security: [{ bearerAuth: [] }]`
- Public endpoints: Omit security field
- Admin only: Add in description AND note in security

---

## Generator Next Steps (Optional)

To make the generator fully automatic:

1. Install `tsx` as dev dependency: `npm install -D tsx`
2. Modify `scripts/generate-api-spec-dynamic.mjs` to use tsx for TypeScript loading
3. Generator will then auto-discover ALL openApi exports
4. You won't need to manually register endpoints

But even without this, you can manually build a complete spec by:
1. Adding metadata to each route
2. Running generator
3. Checking spec output

---

## Success Criteria

- [ ] All 85 endpoints have openApi metadata exports
- [ ] `npm run generate:api-spec` runs without errors
- [ ] Generated spec contains all 85 endpoints
- [ ] `/api-docs` Swagger UI loads and shows all endpoints
- [ ] "Try it out" works for authenticated endpoints
- [ ] Response schemas match actual response structure

---

## Files Modified So Far

```
✅ app/api/properties/route.ts
✅ app/api/properties/[id]/route.ts
✅ app/api/saved-properties/route.ts
✅ app/api/search/properties/route.ts
✅ app/api/inquiries/route.ts
✅ app/api/profile/route.ts

📄 docs/api-endpoint-inventory.md (NEW - reference doc)
📄 lib/openapi/complete-spec.ts (NEW - spec template)
📄 docs/api-auto-documentation.md (reference for patterns)
```

---

## Current Status Dashboard

| Metric | Value |
|--------|-------|
| Total Endpoints | 85 |
| With Metadata | 13 (15%) |
| TypeScript Errors | 0 |
| Generator Status | ✅ Works (shows 4 pre-defined) |
| Swagger UI | ✅ Renders at /api-docs |
| Next Action | Add metadata to TIER 1 remaining endpoints |

---

## Questions?

- **How do I format parameters?** See `docs/api-auto-documentation.md` - complete reference
- **What schema should I use for response?** Check route code for Prisma queries
- **How do I handle multiple response types?** Use `oneOf` in OpenAPI
- **Should I document internal errors?** Yes - include 4xx and 5xx codes
