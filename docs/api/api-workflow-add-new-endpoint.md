# 🚀 Workflow: Auto-Documenting New APIs

**How to add a new endpoint AND its documentation**

---

## 📋 Quick Reference

### The 3-Step Process

```
Step 1: CREATE ENDPOINT    → app/api/my-endpoint/route.ts
            ↓
Step 2: DOCUMENT IN SPEC   → lib/openapi/spec.ts (3 additions)
            ↓
Step 3: RESTART & VERIFY   → npm run dev → /docs
```

**Time investment:** 2-3 minutes per endpoint

---

## 🎯 Example Workflow

Let's say you're adding a new endpoint: `POST /api/admin/properties/approve`

### STEP 1: Create the Endpoint

**File:** `app/api/admin/properties/approve/route.ts`

```typescript
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  propertyId: z.string().uuid(),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  
  // Auth check, validation, business logic...
  
  return Response.json({
    success: true,
    propertyId: propertyId,
    approvedAt: new Date().toISOString()
  })
}
```

### STEP 2: Document in OpenAPI Spec

**File:** `lib/openapi/spec.ts`

**Add 3 things:**

#### 2a. Request Schema (in `components.schemas`)

```typescript
PropertyApproveRequest: {
  type: 'object',
  description: 'Request to approve a property listing',
  properties: {
    propertyId: {
      type: 'string',
      format: 'uuid',
      description: 'Property UUID to approve'
    },
    notes: {
      type: 'string',
      description: 'Optional approval notes'
    }
  },
  required: ['propertyId']
}
```

#### 2b. Response Schema (in `components.schemas`)

```typescript
PropertyApproveResponse: {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      description: 'Whether approval succeeded'
    },
    propertyId: {
      type: 'string',
      format: 'uuid'
    },
    approvedAt: {
      type: 'string',
      format: 'date-time'
    }
  },
  required: ['success', 'propertyId', 'approvedAt']
}
```

#### 2c. Path Definition (in `paths`)

```typescript
'/api/admin/properties/approve': {
  post: {
    summary: 'Approve a property listing',
    description: 'Marks a property as approved after verification',
    operationId: 'approveProperty',
    tags: ['Admin - Properties'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/PropertyApproveRequest' }
        }
      }
    },
    responses: {
      200: {
        description: 'Property approved successfully',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/PropertyApproveResponse' }
          }
        }
      },
      400: {
        description: 'Invalid request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      401: {
        description: 'Unauthorized - authentication required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      403: {
        description: 'Forbidden - admin access required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      404: {
        description: 'Property not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      }
    }
  }
}
```

### STEP 3: Restart & Test

```bash
# Restart dev server
npm run dev

# Visit docs page
# http://localhost:3000/docs
```

**Your endpoint now appears in Swagger UI!** ✅

---

## 🎨 Template Patterns

### JSON Request/Response
```typescript
// In components.schemas
MyRequest: {
  type: 'object',
  properties: {
    fieldName: { type: 'string' }
  },
  required: ['fieldName']
}

// In paths
'/api/endpoint': {
  post: {
    requestBody: {
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/MyRequest' }
        }
      }
    },
    responses: { /* ... */ }
  }
}
```

### File Upload (Multipart)
```typescript
// In components.schemas
FileUploadRequest: {
  type: 'object',
  properties: {
    file: {
      type: 'string',
      format: 'binary',
      description: 'File to upload'
    },
    propertyId: {
      type: 'string',
      format: 'uuid'
    }
  },
  required: ['file', 'propertyId']
}

// In paths
'/api/upload': {
  post: {
    requestBody: {
      content: {
        'multipart/form-data': {
          schema: { $ref: '#/components/schemas/FileUploadRequest' }
        }
      }
    },
    responses: { /* ... */ }
  }
}
```

### Path Parameters (GET by ID)
```typescript
// In paths
'/api/resource/{id}': {
  get: {
    summary: 'Get resource by ID',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Resource ID'
      }
    ],
    responses: { /* ... */ }
  }
}
```

### Query Parameters (Filtering)
```typescript
// In paths
'/api/properties': {
  get: {
    summary: 'List properties',
    parameters: [
      {
        name: 'state',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        description: 'Filter by state'
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: { type: 'integer', default: 10 },
        description: 'Number of results'
      }
    ],
    responses: { /* ... */ }
  }
}
```

---

## ✅ Checklist for New Endpoint

Before restarting dev server:

- [ ] Endpoint code created and tested
- [ ] Request schema added to `components.schemas`
- [ ] Response schema added to `components.schemas`
- [ ] Path added to `paths` section
- [ ] All error responses documented (400, 401, 403, 404, 500)
- [ ] Authentication marked if required (`security: [{ bearerAuth: [] }]`)
- [ ] Category/tags added for UI grouping
- [ ] Summary and description provided
- [ ] Nigerian context added if applicable

---

## 🔄 Integration Options

### Option 1: Manual (Recommended for small teams)
1. Developer creates endpoint
2. Developer adds OpenAPI definition
3. Docs auto-update on restart

**Pros:** Full control, simple  
**Cons:** Requires developer discipline

### Option 2: Code Generation (For large teams)
```bash
# Generate OpenAPI from TypeScript interfaces
npx ts-to-openapi lib/types/*.ts > lib/openapi/auto-spec.ts
```

**Pros:** Automatic, always in sync  
**Cons:** More setup required

### Option 3: Decorator Pattern (Advanced)
```typescript
// Use decorators to generate specs from code
@ApiEndpoint({
  path: '/api/approve',
  method: 'POST',
  auth: 'admin',
  request: PropertyApproveRequest,
  response: PropertyApproveResponse
})
export async function POST(request: Request) {
  // ...
}
```

**Pros:** Single source of truth  
**Cons:** Requires decorator library

---

## 🧪 Testing New Endpoint

### In Swagger UI
1. `npm run dev`
2. Go to `http://localhost:3000/docs`
3. Find your endpoint in the list
4. Click "Try it out"
5. Fill in parameters
6. Click "Execute"
7. See live response

### Postman Collection Update
```bash
# Export latest spec
npm run docs:openapi

# In Postman:
# File → Import → openapi.json
# All endpoints auto-imported
```

---

## 📊 Status Dashboard

### How to Know Docs Are Updated

**File:** `lib/openapi/spec.ts`  
**Lines to check:**
- `components.schemas` - Has all request/response types
- `paths` - Has all endpoint definitions
- No `TODO` comments or incomplete definitions

**Access points:**
- Browser: `http://localhost:3000/docs` (should show endpoint)
- JSON: `http://localhost:3000/api/docs/openapi.json` (should include path)

---

## ⚡ Pro Tips

### Tip 1: Copy-Paste from Existing Endpoints
Use an existing endpoint as template, modify for new one.

**Example:** Copy document validation endpoint structure, adapt for image validation.

### Tip 2: Use Nigerian Market Enums
```typescript
propertyType: {
  type: 'string',
  enum: ['house', 'apartment', 'bq', 'self_contained', 'face_me_i_face_you'],
  description: 'Property type'
}

state: {
  type: 'string',
  enum: ['Lagos', 'Abuja', 'Kano', /* ... */],
  description: 'Nigerian state'
}
```

### Tip 3: Document Required Fields
```typescript
required: ['propertyId', 'documentType']
// These MUST be in request body
```

### Tip 4: Add Examples in Description
```typescript
description: 'Date of transaction (e.g., 2026-05-24T10:30:00Z)',
format: 'date-time'
```

### Tip 5: Use Descriptive Error Messages
```typescript
400: {
  description: 'Invalid request - missing required fields: propertyId, documentType'
}
```

---

## 🤖 Automation Script (Optional)

If you want to auto-scaffold new endpoints:

```bash
# Run: npm run scaffold:api -- --name=myEndpoint --method=POST
# Generates:
# - app/api/my-endpoint/route.ts (skeleton)
# - docs/openapi-endpoint-template.md (reminder)

# Coming soon...
```

---

## 📞 Common Questions

**Q: Do I HAVE to document in OpenAPI?**  
A: No, but highly recommended. Without it:
- No interactive testing in browser
- Can't auto-generate clients
- Team can't see spec in Postman
- Harder to maintain

**Q: Can I update docs later?**  
A: Yes, but do it immediately. Docs drift happens easily.

**Q: What if I forget to document an endpoint?**  
A: Run `npm run docs:verify` to check for orphaned routes.

**Q: Do I need to restart dev server?**  
A: Yes, to see docs update. Takes 2-3 seconds.

**Q: Can docs auto-generate from code?**  
A: Yes, but requires code comments + decorator library. Manual is simpler for now.

---

## 🎯 Best Practices

1. **Document WHILE coding**  
   Add OpenAPI definition as you build the endpoint

2. **Test in Swagger UI immediately**  
   Catch mistakes before code review

3. **Keep schemas reusable**  
   If multiple endpoints use same request, reuse schema

4. **Version your API**  
   Add `/api/v2/endpoint` for breaking changes

5. **Add Nigerian context**  
   Property types, states, document types already defined

6. **Commit together**  
   Endpoint code + documentation in same commit

---

## 📚 Reference Files

- **Template:** `docs/openapi-endpoint-template.md`
- **Spec Definition:** `lib/openapi/spec.ts`
- **Swagger UI:** `app/docs/page.tsx`
- **Full Guide:** `docs/api-documentation-setup.md`

---

**Status:** ✅ Ready to document your first new endpoint!

Next: Pick an endpoint → Follow workflow → Visit `/docs` → Test
