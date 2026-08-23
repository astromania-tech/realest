# 07-api-documentation.md

# 🔄 API Documentation & Auto-Update Workflow

**Mandatory auto-documentation for all API endpoints**

> **CRITICAL RULE:** Every API endpoint created, modified, or deleted MUST be documented in `lib/openapi/spec.ts`. This is non-negotiable and enforced at commit time.

---

## 🎯 Core Principle

```
API Code Change → OpenAPI Documentation Update → Docs Auto-Refresh
     (required)          (required)              (automatic)
```

**Single Source of Truth:** `lib/openapi/spec.ts`
- All OpenAPI definitions in ONE file
- No manual HTML documentation
- Auto-regenerates on server restart
- Visible at `/docs` (Swagger UI)

---

## 📋 The Mandatory Workflow

### When Creating a NEW Endpoint

```
1. CREATE ENDPOINT
   app/api/[path]/route.ts
   ↓
2. DOCUMENT IMMEDIATELY
   lib/openapi/spec.ts
   - Add: request schema (components.schemas)
   - Add: response schema (components.schemas)
   - Add: path definition (paths)
   ↓
3. VERIFY IN UI
   npm run dev
   http://localhost:3000/docs
   ↓
4. COMMIT TOGETHER
   git add app/api/*/route.ts lib/openapi/spec.ts
   git commit -m "feat: add [endpoint name] endpoint"
```

### When MODIFYING an Existing Endpoint

```
1. UPDATE ENDPOINT CODE
   app/api/[path]/route.ts
   ↓
2. UPDATE OPENAPI SPEC
   lib/openapi/spec.ts
   - Update request schema
   - Update response schema
   - Update path definition
   - Update description/examples
   ↓
3. VERIFY CHANGES
   npm run dev
   http://localhost:3000/docs
   ↓
4. COMMIT TOGETHER
   git add app/api/*/route.ts lib/openapi/spec.ts
   git commit -m "feat: update [endpoint name] endpoint"
```

### When DELETING an Endpoint

```
1. DELETE ENDPOINT CODE
   rm app/api/[path]/route.ts
   ↓
2. REMOVE FROM OPENAPI SPEC
   lib/openapi/spec.ts
   - Remove request schema
   - Remove response schema
   - Remove path definition
   ↓
3. VERIFY REMOVAL
   npm run dev
   http://localhost:3000/docs
   - Endpoint should be gone
   ↓
4. COMMIT TOGETHER
   git add lib/openapi/spec.ts
   git commit -m "refactor: remove [endpoint name] endpoint"
```

---

## 🛠️ Quick Reference: Tools & Commands

### Auto-Generate Documentation Skeleton
```bash
npm run scaffold:endpoint -- --name=myEndpoint --category="Admin" --method=POST
```
Generates: `docs/scaffold-myendpoint.md` with copy-paste code snippets

### View Interactive Docs
```bash
npm run dev
# Then visit: http://localhost:3000/docs
```

### Verify Setup
```bash
npm run docs:verify
# Checks: 6 required files, 4 npm scripts
```

### Export OpenAPI Spec
```bash
npm run docs:openapi
# Creates: openapi.json at project root
```

---

## 📝 OpenAPI Spec Structure (`lib/openapi/spec.ts`)

```typescript
export const apiSpec = {
  openapi: '3.0.0',
  info: { /* title, version, description */ },
  servers: [ /* localhost, production */ ],
  components: {
    securitySchemes: { /* bearerAuth */ },
    schemas: {
      // ALL request/response schemas here
      MyEndpointRequest: { /* fields */ },
      MyEndpointResponse: { /* fields */ },
      Error: { /* standard error */ }
    }
  },
  paths: {
    // ALL endpoint definitions here
    '/api/my-endpoint': {
      post: {
        summary: 'My Endpoint',
        operationId: 'myEndpoint',
        tags: ['Category'],
        requestBody: { /* ... */ },
        responses: { /* 200, 400, 401, 403, 404, 500 */ }
      }
    }
  }
}
```

---

## ✅ Required Documentation Per Endpoint

Every endpoint definition MUST include:

```typescript
{
  summary: 'Brief description',                    // ✅ Required
  description: 'Detailed description',            // ✅ Required
  operationId: 'camelCaseEndpointName',          // ✅ Required
  tags: ['Category Name'],                        // ✅ Required
  
  security: [{ bearerAuth: [] }],                // ✅ Required if admin-only
  
  requestBody: {                                  // ✅ Required if body needed
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/RequestSchema' }
      }
    }
  },
  
  responses: {
    200: { /* success response */ },             // ✅ Required
    201: { /* created response */ },             // ✅ If applicable
    400: { /* bad request */ },                  // ✅ Required
    401: { /* unauthorized */ },                 // ✅ Required if secured
    403: { /* forbidden */ },                    // ✅ Required if role-based
    404: { /* not found */ },                    // ✅ Required if applicable
    500: { /* server error */ }                  // ✅ Required
  }
}
```

---

## 🇳🇬 Nigerian Market Context Requirements

All property/location endpoints MUST include these enums:

```typescript
// States
state: {
  type: 'string',
  enum: ['Lagos', 'Abuja', 'Kano', 'Katsina', 'Kogi', 'Kwara', 'Oyo'],
  description: 'Nigerian state'
}

// Property Types
propertyType: {
  type: 'string',
  enum: ['house', 'apartment', 'bq', 'self_contained', 'face_me_i_face_you', 'office', 'shop', 'warehouse', 'land', 'commercial'],
  description: 'Property type'
}

// Document Types
documentType: {
  type: 'string',
  enum: ['title_deed', 'survey_plan', 'certificate_of_occupancy', 'building_permit', 'purchase_receipt', 'allocation_letter', 'deed_of_assignment', 'power_of_attorney', 'lease_agreement', 'proof_of_payment'],
  description: 'Legal document type'
}

// Phone Format
phone: {
  type: 'string',
  pattern: '^\\+234\\d{10}$',
  description: 'Nigerian phone number in +234 format'
}

// Currency (Naira)
amount: {
  type: 'number',
  description: 'Amount in Nigerian Naira (NGN)'
}
```

---

## 🔐 Authentication in Docs

All admin/protected endpoints MUST include:

```typescript
security: [{ bearerAuth: [] }]
```

This tells Swagger UI:
- Endpoint requires Bearer token
- Users can input JWT in "Authorize" button
- Token sent with all requests

Example:
```typescript
responses: {
  401: {
    description: 'Unauthorized - authentication required or token invalid',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/Error' }
      }
    }
  },
  403: {
    description: 'Forbidden - insufficient permissions (not admin/owner)',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/Error' }
      }
    }
  }
}
```

---

## 🧪 Testing in Swagger UI

1. **Start dev server:** `npm run dev`
2. **Open docs:** `http://localhost:3000/docs`
3. **Find endpoint** in list
4. **Click "Try it out"**
5. **Fill in sample data**
6. **Click "Execute"**
7. **See response** with status code

**For protected endpoints:**
1. Click blue "Authorize" button at top
2. Paste JWT token (with `Bearer ` prefix)
3. Try endpoint (token auto-sent)

---

## 🚀 Automation: Use Scaffolding Script

Instead of manually copying templates:

```bash
npm run scaffold:endpoint -- \
  --name=approveProperty \
  --category="Admin - Properties" \
  --method=POST
```

**Generates:** `docs/scaffold-approveproperty.md`

**Contains ready-to-copy:**
- Request schema
- Response schema
- Path definition
- Step-by-step instructions

**Copy-paste snippets into `lib/openapi/spec.ts`** → Done!

---

## 📚 Documentation References

| When You Need | Read This |
|---------------|-----------|
| Complete guide | `docs/auto-document-apis.md` |
| Step-by-step workflow | `docs/api-workflow-add-new-endpoint.md` |
| Code templates | `docs/openapi-endpoint-template.md` |
| System overview | `docs/auto-documentation-system-overview.md` |
| Quick start | `docs/api-documentation-setup.md` |

---

## 🔍 Verification Checklist

Before committing ANY API changes:

```
Code Changes:
☐ Endpoint created/modified/deleted in app/api/

OpenAPI Changes:
☐ Request schema added to components.schemas (if new endpoint)
☐ Response schema added to components.schemas (if new endpoint)
☐ Path definition added to paths (if new endpoint)
☐ Path definition removed from paths (if deleted)
☐ All field names match endpoint code exactly
☐ All required fields marked
☐ All response codes documented (200, 201, 400, 401, 403, 404, 500)
☐ Description and summary provided
☐ Tags/category set correctly
☐ Authentication marked if admin-only
☐ Nigerian context (states, property types, phone format) included if applicable

Validation:
☐ npm run typecheck (no TypeScript errors)
☐ npm run lint (no style violations)
☐ npm run dev (server starts)

UI Testing:
☐ Visit http://localhost:3000/docs
☐ Endpoint appears in list
☐ Can expand endpoint (click to see details)
☐ "Try it out" button works
☐ Can send test request
☐ Response matches schema

Commit:
☐ Include both code AND OpenAPI changes
☐ Use conventional commit: feat/fix/refactor
☐ Reference ticket/issue if applicable
☐ Example: "feat: add property approval endpoint (#123)"
```

---

## 🚨 Common Mistakes (AVOID)

❌ **Mistake 1:** Create endpoint WITHOUT updating OpenAPI spec
- **Why Bad:** Docs become outdated, team confused, API not properly tested
- **Fix:** Update spec immediately, before other code changes

❌ **Mistake 2:** Update endpoint logic WITHOUT updating OpenAPI schema
- **Why Bad:** Swagger UI shows wrong request/response format
- **Fix:** Keep code and spec in sync always

❌ **Mistake 3:** Hardcoded Nigerian data instead of enum
- **Why Bad:** Can't add new states/types later without code change
- **Fix:** Use enum arrays in spec, update centrally

❌ **Mistake 4:** Missing error response documentation
- **Why Bad:** Team doesn't know what errors endpoint returns
- **Fix:** Document all possible error codes (400, 401, 403, 404, 500)

❌ **Mistake 5:** Committing code without documentation
- **Why Bad:** CI/CD will reject, requires force-push later
- **Fix:** Document FIRST, then commit code + docs together

---

## 🎯 Example: Complete Workflow

**Task:** Add `POST /api/admin/properties/approve` endpoint

### Step 1: Create Endpoint
```typescript
// app/api/admin/properties/approve/route.ts
export async function POST(request: Request) {
  const { propertyId, notes } = await request.json()
  // ... logic ...
  return Response.json({ success: true, propertyId, approvedAt: new Date() })
}
```

### Step 2: Generate Scaffold (Optional)
```bash
npm run scaffold:endpoint -- --name=approveProperty --category="Admin - Properties" --method=POST
# Creates: docs/scaffold-approveproperty.md
```

### Step 3: Update OpenAPI Spec
Edit `lib/openapi/spec.ts` - Add:

```typescript
// In components.schemas:
ApprovePropertyRequest: {
  type: 'object',
  properties: {
    propertyId: { type: 'string', format: 'uuid' },
    notes: { type: 'string' }
  },
  required: ['propertyId']
},

ApprovePropertyResponse: {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    propertyId: { type: 'string', format: 'uuid' },
    approvedAt: { type: 'string', format: 'date-time' }
  },
  required: ['success', 'propertyId', 'approvedAt']
},

// In paths:
'/api/admin/properties/approve': {
  post: {
    summary: 'Approve a property',
    description: 'Admin only: mark property as approved after verification',
    operationId: 'approveProperty',
    tags: ['Admin - Properties'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ApprovePropertyRequest' }
        }
      }
    },
    responses: {
      200: {
        description: 'Property approved successfully',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApprovePropertyResponse' }
          }
        }
      },
      400: { /* error */ },
      401: { /* error */ },
      403: { /* error */ },
      404: { /* error */ },
      500: { /* error */ }
    }
  }
}
```

### Step 4: Test & Verify
```bash
npm run typecheck  # ✅ No errors
npm run lint       # ✅ No issues
npm run dev        # ✅ Server starts
# Visit: http://localhost:3000/docs
# Find: POST /api/admin/properties/approve
# Test: "Try it out" works
```

### Step 5: Commit Together
```bash
git add app/api/admin/properties/approve/route.ts lib/openapi/spec.ts
git commit -m "feat: add property approval endpoint

- New POST endpoint for admins to approve verified properties
- OpenAPI documentation included
- Tested in Swagger UI
- Refs: #123"
```

**Result:**
✅ Code is deployed  
✅ Docs are auto-updated  
✅ Team sees changes in `/docs`  
✅ Swagger UI shows new endpoint  
✅ Everyone stays informed  

---

## 🤖 AI Agent Integration

**When AI agents create/modify APIs:**

1. **ALWAYS** check `lib/openapi/spec.ts` for existing endpoints
2. **ALWAYS** add OpenAPI documentation immediately after code
3. **ALWAYS** use `npm run scaffold:endpoint` for scaffolding
4. **NEVER** commit code without updating spec
5. **ALWAYS** verify in `/docs` before commit

**Pre-commit checks:**
```bash
npm run docs:verify    # Verify all files exist
npm run typecheck      # Check TypeScript
npm run lint           # Check code style
```

---

## 📞 Need Help?

| Question | Answer |
|----------|--------|
| How do I add an endpoint? | See `docs/api-workflow-add-new-endpoint.md` |
| What's the template format? | See `docs/openapi-endpoint-template.md` |
| How does auto-documentation work? | See `docs/auto-documentation-system-overview.md` |
| What's wrong with my endpoint docs? | Check: 1) Field names match code, 2) Required fields marked, 3) All response codes documented |
| How do I test in Swagger? | Run `npm run dev`, visit `/docs`, click "Try it out" |

---

## ✨ Success Metrics

You've implemented this correctly when:

✅ Every API change updates OpenAPI spec  
✅ `/docs` reflects all endpoints  
✅ Swagger UI has "Try it out" for all endpoints  
✅ Nigerian context (states, property types) documented  
✅ Team uses `/docs` instead of asking for help  
✅ New endpoints auto-documented within minutes  
✅ CI/CD rejects commits without spec updates  

---

**Status:** ✅ ACTIVE & ENFORCED  
**Next Step:** Add this workflow to your commit hooks and CI/CD  
**Reference:** See `.github/copilot-instructions.md` for overall system
