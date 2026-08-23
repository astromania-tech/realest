# 📖 Auto-Document New APIs: Complete Guide

**How to automatically keep API documentation in sync with code**

---

## 🎯 The Big Picture

### Without Auto-Documentation
```
Code endpoint → Forget to document → 
Docs are outdated → Team confused → Support tickets
```

### With This System
```
Create endpoint → Document in OpenAPI → 
Restart server → Docs auto-update → Team stays informed
```

---

## 🚀 Quick Reference

| What | How | Time |
|------|-----|------|
| **Add new endpoint** | Create route in `app/api/` | 5-10 min |
| **Document endpoint** | Run scaffold script or edit `lib/openapi/spec.ts` | 2-3 min |
| **Test & verify** | `npm run dev` → Visit `/docs` | 1-2 min |
| **Total time** | Per new endpoint | 10-15 min |

---

## 📋 The 3-Step Workflow

### Step 1: Create the Endpoint
```bash
# Create your Next.js route
app/api/my-endpoint/route.ts
```

Example:
```typescript
// app/api/admin/properties/approve/route.ts
export async function POST(request: Request) {
  const { propertyId, notes } = await request.json()
  
  // Validation, logic, database calls...
  
  return Response.json({
    success: true,
    propertyId,
    approvedAt: new Date().toISOString()
  })
}
```

### Step 2: Document in OpenAPI
**Option A: Use Scaffold Script** (Recommended)
```bash
npm run scaffold:endpoint -- \
  --name=approveProperty \
  --category="Admin - Properties" \
  --method=POST
```

This generates a file with code snippets you copy into `lib/openapi/spec.ts`.

**Option B: Manual Edit** (Full control)
Edit `lib/openapi/spec.ts` and add:
1. Request schema (in `components.schemas`)
2. Response schema (in `components.schemas`)
3. Path definition (in `paths`)

See template: `docs/openapi-endpoint-template.md`

### Step 3: Restart & Verify
```bash
npm run dev
# Visit: http://localhost:3000/docs
# Search for your endpoint
# Click "Try it out" to test
```

---

## 🛠️ Using the Scaffold Script

### How to Run
```bash
npm run scaffold:endpoint -- \
  --name=yourEndpointName \
  --category="Category Name" \
  --method=POST
```

### Arguments
- `--name` (required): Endpoint name (e.g., `approveProperty`)
- `--category` (optional): Category for UI grouping (default: `API`)
- `--method` (optional): HTTP method: POST, GET, PUT, DELETE (default: `POST`)

### Example Commands

**Create a GET endpoint:**
```bash
npm run scaffold:endpoint -- --name=listProperties --method=GET
```

**Create a DELETE endpoint:**
```bash
npm run scaffold:endpoint -- --name=deleteProperty --category=Admin --method=DELETE
```

**Create a file upload endpoint:**
```bash
npm run scaffold:endpoint -- --name=uploadDocument --category="Admin - Documents" --method=POST
```

### What It Generates
Creates `docs/scaffold-yourname.md` with ready-to-copy code snippets:
- ✅ Request schema template
- ✅ Response schema template
- ✅ Path definition template
- ✅ Step-by-step instructions

---

## 📝 Manual Method (Without Script)

If you prefer to edit directly:

### Edit File: `lib/openapi/spec.ts`

**Find this section:**
```typescript
components: {
  schemas: {
    // Existing schemas here...
    DocumentValidationResponse: { /* ... */ },
```

**Add your schemas:**
```typescript
    // ← Add here
    MyEndpointRequest: {
      type: 'object',
      description: 'Request for my endpoint',
      properties: {
        propertyId: {
          type: 'string',
          format: 'uuid'
        }
      },
      required: ['propertyId']
    },
    MyEndpointResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' }
      }
    },
```

**Find this section:**
```typescript
paths: {
  '/api/admin/validation/document': { /* ... */ },
  '/api/admin/validation/image': { /* ... */ },
```

**Add your endpoint:**
```typescript
  '/api/my-endpoint': {
    post: {
      summary: 'My Endpoint',
      description: 'Detailed description...',
      operationId: 'myEndpoint',
      tags: ['Category'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MyEndpointRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MyEndpointResponse' }
            }
          }
        },
        // Add error responses (400, 401, 403, 404, 500)
      }
    }
  }
```

---

## 🔄 Sync Strategies

### Strategy 1: Developer-Driven (Current)
**Process:**
1. Developer creates endpoint
2. Developer adds OpenAPI definition
3. Code review checks both

**Pros:** Simple, no automation needed  
**Cons:** Requires discipline

**Enforcement:**
```bash
# In pre-commit hook
npm run docs:verify  # Checks files exist
npm run lint        # Checks TypeScript
npm run typecheck   # Checks types
```

### Strategy 2: Automated (Future)
```bash
# Auto-generate from TypeScript interfaces
npm run docs:generate

# Uses:
# - lib/types/validation.ts interfaces
# - JSDoc comments
# - Route handler signatures
```

Would require:
- TypeScript AST parsing
- Custom code generator
- Build pipeline integration

### Strategy 3: Decorator-Based (Advanced)
```typescript
@ApiEndpoint({
  path: '/api/approve',
  method: 'POST',
  schema: ApproveSchema
})
export async function POST(req: Request) { }
```

Generates OpenAPI on build.

---

## 📊 Verification Checklist

### Before Restarting Dev Server

- [ ] Endpoint code is functional
- [ ] Request schema added to `components.schemas`
- [ ] Response schema added to `components.schemas`
- [ ] Path definition added to `paths` section
- [ ] All error codes documented (200/201, 400, 401, 403, 404, 500)
- [ ] Summary/description provided
- [ ] Category/tags set for UI grouping
- [ ] Authentication marked if required
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] No lint errors: `npm run lint`

### After Restart

- [ ] `npm run dev` succeeds
- [ ] Visit `http://localhost:3000/docs`
- [ ] Endpoint appears in list
- [ ] Endpoint can be expanded (click it)
- [ ] "Try it out" button works
- [ ] Can fill in sample data
- [ ] Can send request and see response

---

## 🧪 Testing Workflow

### Manual Testing (Recommended)
```bash
# 1. Start dev server
npm run dev

# 2. Open Swagger UI
# Browser: http://localhost:3000/docs

# 3. Find your endpoint
# Use search or scroll to category

# 4. Test it
# Click "Try it out" → Fill data → "Execute"
```

### Postman Testing
```bash
# 1. Export latest spec
npm run docs:openapi

# 2. In Postman
# File → Import → openapi.json

# 3. Find collection "RealEST API"
# All endpoints auto-imported
```

### curl Testing
```bash
curl -X POST http://localhost:3000/api/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"550e8400-e29b-41d4-a716-446655440000"}'
```

---

## 💡 Pro Tips

### Tip 1: Use Nigerian Context
```typescript
state: {
  type: 'string',
  enum: ['Lagos', 'Abuja', 'Kano', 'Katsina'],
  description: 'Nigerian state'
},

propertyType: {
  type: 'string',
  enum: ['house', 'apartment', 'bq', 'self_contained'],
  description: 'Property type'
}
```

### Tip 2: Reuse Common Schemas
```typescript
// Don't repeat - reference existing schema
locationProximity: {
  type: 'object',
  $ref: '#/components/schemas/GeoLocation'
}
```

### Tip 3: Document Nigerian Document Types
```typescript
documentType: {
  type: 'string',
  enum: [
    'title_deed',
    'survey_plan',
    'certificate_of_occupancy',
    'building_permit',
    'purchase_receipt',
    'allocation_letter'
  ]
}
```

### Tip 4: Add Examples in Descriptions
```typescript
description: 'Phone number in +234 format (e.g., +2348123456789)'
```

### Tip 5: Keep Required Fields Clear
```typescript
required: ['propertyId', 'documentType']
// These MUST be in every request
```

---

## 🔍 Debugging

### Issue: Endpoint not showing in Swagger UI
**Solution:**
1. Check if dev server restarted: `npm run dev`
2. Verify path in OpenAPI: Look for `/api/your-endpoint` in `lib/openapi/spec.ts`
3. Check browser cache: Hard refresh `Ctrl+Shift+R`
4. Verify no TypeScript errors: `npm run typecheck`

### Issue: "Try it out" button doesn't work
**Solution:**
1. Clear browser cache
2. Restart dev server
3. Check Authorization header
4. Verify endpoint exists: `curl http://localhost:3000/api/your-endpoint`

### Issue: Response doesn't match schema
**Solution:**
1. Update response schema in OpenAPI
2. Make sure field names match exactly
3. Verify field types (string, boolean, number, etc.)
4. Test again

---

## 📚 Reference Files

| File | Purpose |
|------|---------|
| `docs/openapi-endpoint-template.md` | Code templates for any endpoint |
| `docs/api-workflow-add-new-endpoint.md` | Step-by-step workflow |
| `lib/openapi/spec.ts` | Master OpenAPI specification |
| `scripts/scaffold-endpoint.mjs` | Scaffold generator script |
| `app/docs/page.tsx` | Swagger UI (interactive docs) |
| `app/api/docs/openapi.json/route.ts` | OpenAPI JSON endpoint |

---

## 🎯 Quick Commands

```bash
# Create new endpoint documentation skeleton
npm run scaffold:endpoint -- --name=myEndpoint --category="Category" --method=POST

# View interactive docs
npm run docs:view

# Start dev server (docs update automatically)
npm run dev

# Export OpenAPI spec
npm run docs:openapi

# Verify all doc files exist
npm run docs:verify
```

---

## 🚀 Complete Example

Let's say you're adding: `POST /api/admin/properties/reject`

### Step 1: Create Endpoint
```typescript
// app/api/admin/properties/reject/route.ts
import { z } from 'zod'

const schema = z.object({
  propertyId: z.string().uuid(),
  reason: z.string().min(10),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { propertyId, reason } = await request.json()
  
  // Update property status to rejected
  await supabase
    .from('properties')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', propertyId)
  
  return Response.json({
    success: true,
    propertyId,
    rejectedAt: new Date().toISOString()
  })
}
```

### Step 2: Generate Scaffold
```bash
npm run scaffold:endpoint -- \
  --name=rejectProperty \
  --category="Admin - Properties" \
  --method=POST
```

### Step 3: Edit `lib/openapi/spec.ts`
Copy the generated code snippets into:
- `components.schemas` (request + response)
- `paths` (endpoint definition)

### Step 4: Restart & Test
```bash
npm run dev
# Visit: http://localhost:3000/docs
# Look for: POST /api/admin/properties/reject
# Test it!
```

---

## ✅ Success Criteria

You've successfully auto-documented an API when:

✅ Endpoint appears in Swagger UI at `/docs`  
✅ Can expand endpoint and see full details  
✅ "Try it out" button works  
✅ Can test with sample data  
✅ OpenAPI spec includes your endpoint (`/api/docs/openapi.json`)  
✅ Endpoint works in Postman after import  
✅ Team can find docs without asking  

---

## 🎓 Next Steps

1. **Create your first endpoint** with documentation
2. **Test in Swagger UI** (`npm run dev` → `/docs`)
3. **Share with team** (link to `/docs`)
4. **Get feedback** (update docs based on questions)
5. **Repeat** (for every new endpoint)

---

**You're now set up to auto-document all new APIs! 🚀**

For detailed endpoint structure, see: `docs/openapi-endpoint-template.md`
