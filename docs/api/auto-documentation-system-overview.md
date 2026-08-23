# 🎯 Auto-Documentation System - Complete Overview

**RealEST API Documentation** - How it all works together

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR NEW ENDPOINT                             │
│         (create in app/api/your-endpoint/route.ts)              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│        DOCUMENT IN OPENAPI SPEC                                  │
│        (edit lib/openapi/spec.ts)                                │
│        ├─ Add request schema                                     │
│        ├─ Add response schema                                    │
│        └─ Add path definition                                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│        RESTART DEV SERVER                                        │
│        (npm run dev)                                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
    SWAGGER UI         OPENAPI JSON      POSTMAN
    /docs              /api/docs/        Import
                       openapi.json      Collection
```

---

## 📁 File Structure

```
realest/
├─ app/
│  ├─ api/
│  │  └─ [ENDPOINTS HERE]
│  │     └─ your-endpoint/route.ts  ← CREATE HERE
│  │
│  └─ docs/
│     ├─ page.tsx                    ← Swagger UI
│     └─ layout.tsx                  ← Theme styling
│
├─ lib/
│  └─ openapi/
│     └─ spec.ts                     ← DOCUMENT HERE
│
├─ docs/
│  ├─ auto-document-apis.md          ← Read this
│  ├─ api-workflow-add-new-endpoint.md
│  ├─ openapi-endpoint-template.md   ← Copy from this
│  ├─ api-documentation-setup.md
│  └─ RealEST-API-Validation.postman_collection.json
│
└─ scripts/
   ├─ scaffold-endpoint.mjs          ← RUN THIS
   └─ verify-api-docs.js

ENDPOINTS SERVED AT:
  • Interactive: http://localhost:3000/docs (Swagger UI)
  • JSON Spec: http://localhost:3000/api/docs/openapi.json
  • Verification: npm run docs:verify
```

---

## 🚀 The Workflow in 3 Steps

### ① CREATE ENDPOINT
```bash
# Create your endpoint
app/api/my-endpoint/route.ts
```

### ② DOCUMENT IT (Choose One)

**Option A: Auto-Scaffold** ⭐ RECOMMENDED
```bash
npm run scaffold:endpoint -- --name=myEndpoint --category="Category" --method=POST
# Generates: docs/scaffold-myendpoint.md
# Copy snippets into: lib/openapi/spec.ts
```

**Option B: Manual Edit**
```
Edit: lib/openapi/spec.ts
Add:
  - Request schema (components.schemas)
  - Response schema (components.schemas)
  - Path definition (paths)
```

### ③ RESTART & VERIFY
```bash
npm run dev
# Visit: http://localhost:3000/docs
# Test your endpoint!
```

---

## 🛠️ Quick Commands Reference

```bash
# ✨ NEW ENDPOINTS
npm run scaffold:endpoint -- --name=approveProperty --method=POST
# Generates documentation skeleton

# 📖 DOCUMENTATION
npm run dev                           # Start server, docs at /docs
npm run docs:openapi                 # Export spec to openapi.json
npm run docs:verify                  # Check all files in place
npm run docs:view                    # Print docs info

# 🔍 VERIFICATION
npm run typecheck                    # Check TypeScript
npm run lint                         # Check code style
npm run precommit                    # Full pre-commit check
```

---

## 📋 Auto-Documentation Checklist

When adding a new endpoint:

```
BEFORE CODING:
☐ Plan endpoint: method, path, inputs, outputs

WHILE CODING:
☐ Create app/api/your-endpoint/route.ts
☐ Test endpoint locally (curl, Postman, etc.)
☐ Ensure request/response are well-defined

DOCUMENTATION:
☐ Run: npm run scaffold:endpoint -- --name=yourName --method=POST
☐ Copy snippets from generated docs/scaffold-*.md
☐ Edit lib/openapi/spec.ts, add:
   ☐ Request schema in components.schemas
   ☐ Response schema in components.schemas
   ☐ Path definition in paths
☐ Include description with details
☐ Add security if admin-only
☐ Document all error codes (400, 401, 403, 404, 500)

VERIFICATION:
☐ npm run typecheck (no errors)
☐ npm run lint (no style issues)
☐ npm run dev (restart)
☐ Visit http://localhost:3000/docs
☐ Find your endpoint in list
☐ Click "Try it out" and test
☐ Send a request, verify response

COMMIT:
☐ Endpoint code + OpenAPI definition together
☐ Use conventional commits: feat: add approve endpoint
☐ Reference docs in commit message
```

---

## 🧠 How It Works Automatically

### On Every Dev Server Restart

1. **Next.js reads `app/docs/page.tsx`**
   - This is the Swagger UI component
   - Auto-loads from `/api/docs/openapi.json`

2. **Next.js serves `/api/docs/openapi.json`**
   - Route handler reads from `lib/openapi/spec.ts`
   - Returns JSON spec (cached for 1 hour)

3. **Swagger UI renders interactive docs**
   - Parses OpenAPI spec
   - Creates UI for testing
   - Shows all endpoints from spec

4. **You visit `/docs`**
   - Swagger UI loads spec from `/api/docs/openapi.json`
   - All your endpoints are visible and testable

### What This Means

✅ **Auto-Update:** Change spec → Restart → Docs update  
✅ **Always in Sync:** One source of truth (lib/openapi/spec.ts)  
✅ **No Manual HTML:** No need to write documentation HTML  
✅ **Interactive:** Test endpoints directly from browser  
✅ **Shareable:** Link to /docs for whole team  

---

## 📊 Example Workflow: Complete

Let's add endpoint: `POST /api/admin/verify/approve-property`

### Step 1: Create Endpoint
```typescript
// app/api/admin/verify/approve-property/route.ts
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  propertyId: z.string().uuid(),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { propertyId, notes } = schema.parse(await request.json())
  
  const { error } = await supabase
    .from('properties')
    .update({
      status: 'verified',
      verified_at: new Date().toISOString(),
      verification_notes: notes
    })
    .eq('id', propertyId)
  
  if (error) throw error
  
  return Response.json({
    success: true,
    propertyId,
    verifiedAt: new Date().toISOString()
  }, { status: 200 })
}
```

### Step 2: Generate Scaffold
```bash
npm run scaffold:endpoint -- \
  --name=approveProperty \
  --category="Admin - Property Verification" \
  --method=POST
```

Output: `docs/scaffold-approveproperty.md` with code to copy

### Step 3: Document in OpenAPI
Edit `lib/openapi/spec.ts`:

**Add request schema:**
```typescript
ApprovePropertyRequest: {
  type: 'object',
  properties: {
    propertyId: {
      type: 'string',
      format: 'uuid',
      description: 'Property UUID'
    },
    notes: {
      type: 'string',
      description: 'Optional verification notes'
    }
  },
  required: ['propertyId']
}
```

**Add response schema:**
```typescript
ApprovePropertyResponse: {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    propertyId: { type: 'string', format: 'uuid' },
    verifiedAt: { type: 'string', format: 'date-time' }
  },
  required: ['success', 'propertyId', 'verifiedAt']
}
```

**Add path:**
```typescript
'/api/admin/verify/approve-property': {
  post: {
    summary: 'Approve a property after verification',
    description: 'Admin endpoint to mark property as verified and approved',
    operationId: 'approveProperty',
    tags: ['Admin - Property Verification'],
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
      400: { /* error response */ },
      401: { /* error response */ },
      403: { /* error response */ },
      404: { /* error response */ },
      500: { /* error response */ }
    }
  }
}
```

### Step 4: Restart & Test
```bash
npm run dev

# In browser:
# Visit: http://localhost:3000/docs
# Scroll to: Admin - Property Verification
# Find: POST /api/admin/verify/approve-property
# Click: "Try it out"
# Fill: propertyId = 550e8400-e29b-41d4-a716-446655440000
# Click: "Execute"
# See: {"success": true, "propertyId": "...", "verifiedAt": "2026-05-24T..."}
```

**✅ Done!** Your endpoint is now:
- Documented ✓
- Testable in Swagger ✓
- In OpenAPI spec ✓
- Importable to Postman ✓
- Shareable with team ✓

---

## 🎨 Customization Options

### Add Your Own Schemas
```typescript
// In components.schemas
MyCustomType: {
  type: 'object',
  properties: {
    /* your fields */
  }
}

// Reference in your endpoint:
schema: { $ref: '#/components/schemas/MyCustomType' }
```

### Create Endpoint Categories
```typescript
tags: ['Your Category Name']
// Groups endpoints in UI sidebar
```

### Add Nigerian Market Fields
```typescript
state: {
  type: 'string',
  enum: ['Lagos', 'Abuja', 'Kano', 'Katsina', 'Kogi', 'Kwara'],
  description: 'Nigerian state'
}

propertyType: {
  type: 'string',
  enum: ['house', 'apartment', 'bq', 'self_contained', 'face_me_i_face_you', 'office', 'shop'],
  description: 'Property type'
}

documentType: {
  type: 'string',
  enum: ['title_deed', 'survey_plan', 'certificate_of_occupancy', 'building_permit'],
  description: 'Legal document type'
}
```

---

## 🚨 Common Gotchas

| Problem | Solution |
|---------|----------|
| Endpoint not showing in Swagger | Restarted dev server? Reloaded browser? |
| "Try it out" greyed out | Check authentication - use Bearer token |
| Response doesn't match schema | Check field names match exactly |
| Get CORS error | Should not happen (same origin) - check network tab |
| Postman import fails | Use openapi.json, not collection JSON |
| Docs showing old endpoint | Clear browser cache: Ctrl+Shift+R |

---

## 📚 Documentation Files

| File | Purpose | Read When |
|------|---------|-----------|
| `auto-document-apis.md` | Complete auto-doc system | First time setup |
| `api-workflow-add-new-endpoint.md` | Step-by-step workflow | Adding new endpoint |
| `openapi-endpoint-template.md` | Code templates | Need template |
| `api-documentation-setup.md` | Initial setup guide | Troubleshooting setup |
| `api-documentation-complete.md` | Quick reference | Need quick info |

---

## ✅ Success Metrics

You've successfully implemented auto-documentation when:

✅ New endpoint appears in Swagger UI  
✅ Can test endpoint from browser  
✅ OpenAPI spec is valid JSON  
✅ Postman can import spec  
✅ Team doesn't ask "how do I use this endpoint?"  
✅ Documentation always matches code  

---

## 🎯 Next Steps

1. **Create your first endpoint**
   ```bash
   npm run scaffold:endpoint -- --name=firstEndpoint
   ```

2. **Add documentation**
   - Copy snippets from generated file
   - Edit `lib/openapi/spec.ts`

3. **Restart and test**
   ```bash
   npm run dev
   # Visit: http://localhost:3000/docs
   ```

4. **Celebrate!** 🎉
   - Your API is now auto-documented
   - Team has interactive documentation
   - New endpoints stay documented

---

## 📞 Support

**Need help?**
- See: `docs/auto-document-apis.md`
- See: `docs/api-workflow-add-new-endpoint.md`
- See: `docs/openapi-endpoint-template.md`
- Ask: Anyone on the team!

**Questions?**
- "How do I add an endpoint?" → `api-workflow-add-new-endpoint.md`
- "What's the template?" → `openapi-endpoint-template.md`
- "How does it work?" → `auto-document-apis.md`

---

**Status:** ✅ ACTIVE & READY  
**Last Updated:** May 24, 2026  
**Endpoints Documented:** 3 (expandable)  
**Team Visibility:** ✅ 100% (via Swagger UI)
