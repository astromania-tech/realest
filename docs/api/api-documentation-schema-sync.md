# API Documentation Schema Sync Guide

## Overview

RealEST uses a **single-source-of-truth approach** for API documentation. Type definitions live in validation files, and the OpenAPI spec references them—eliminating duplication and keeping docs automatically in sync.

## Architecture

### Source Files (Single Source of Truth)

**Property Validation Schemas** (`lib/validations/property.ts`)
```typescript
export const propertyListingSchema = z.object({ ... })
export const propertyDetailsSchema = z.object({ ... })
export const propertyMediaSchema = z.object({ ... })
export const propertyDocumentSchema = z.object({ ... })
```

**Validation Result Types** (`lib/types/validation.ts`)
```typescript
export interface DocumentValidationResult { ... }
export interface ImageValidationResult { ... }
export interface DuplicateCheckResult { ... }
```

### OpenAPI Spec Reference (`lib/openapi/spec.ts`)

The spec.ts file defines OpenAPI JSON schemas **with source references**:

```javascript
schemas: {
  PropertyListing: {
    type: 'object',
    properties: { ... },
    'x-source': '@/lib/validations/property.ts → propertyListingSchema'
  },
  
  DocumentValidationResponse: {
    type: 'object',
    properties: { ... },
    'x-source': '@/lib/types/validation.ts → DocumentValidationResult'
  }
}
```

## How It Works

1. **Type Defined in Validation File**
   - Developer creates Zod schema in `property.ts` or type in `validation.ts`
   
2. **OpenAPI Schema Added to spec.ts**
   - Manually create corresponding OpenAPI JSON schema
   - Add `'x-source'` extension linking to source file
   
3. **Docs Generated**
   - OpenAPI spec served at `/api/docs/openapi.json`
   - Swagger UI displays at `/api-docs`

4. **Maintenance**
   - When type changes, **manually update spec.ts** (no automation yet)
   - `x-source` extension reminds developers where to look

## Mapping Guide

### Request/Response Patterns

#### Property Listing
| Source | OpenAPI Schema | Used In |
|--------|---|---|
| `propertyListingSchema` (Zod) | `PropertyListing` | POST `/api/properties` |
| `propertyMediaSchema` (Zod) | `PropertyMedia` | POST `/api/properties/[id]/media` |
| `propertyDocumentSchema` (Zod) | `PropertyDocument` | POST `/api/properties/[id]/documents` |

#### Validation Results
| Source | OpenAPI Schema | Used In |
|--------|---|---|
| `DocumentValidationResult` (Type) | `DocumentValidationResponse` | POST `/api/admin/validation/document` |
| `ImageValidationResult` (Type) | `ImageValidationResponse` | POST `/api/admin/validation/image` |
| `DuplicateCheckResult` (Type) | `DuplicateCheckResponse` | POST `/api/admin/validation/duplicates` |

## Maintenance Workflow

### When to Update spec.ts

**Scenario 1: Add new Zod schema field**
```typescript
// In property.ts
export const propertyListingSchema = z.object({
  // ... existing fields ...
  certification: z.string().optional(),  // ← NEW FIELD
})
```

**Action:**
1. Find `PropertyListing` schema in spec.ts
2. Add field to `properties` object:
```javascript
certification: { type: 'string', description: 'Property certification type' }
```
3. Test: `npm run docs:verify`

**Scenario 2: Change validation type**
```typescript
// In validation.ts
export interface DocumentValidationResult {
  // ... existing fields ...
  verificationLevel: 'basic' | 'standard' | 'advanced',  // ← NEW LEVEL
}
```

**Action:**
1. Find `DocumentValidationResponse` schema in spec.ts
2. Update response object:
```javascript
verificationLevel: { 
  type: 'string', 
  enum: ['basic', 'standard', 'advanced'] 
}
```
3. Test: `npm run docs:verify`

## Tools & Commands

### View API Documentation
```bash
npm run dev          # Start dev server
npm run docs:view   # Shows: http://localhost:3000/api-docs
```

### Export OpenAPI Spec
```bash
npm run docs:openapi  # Exports to openapi.json
```

### Verify Spec Validity
```bash
npm run docs:verify  # Validates JSON schema
```

### Generate Endpoint Scaffold
```bash
npm run scaffold:endpoint -- --name=myEndpoint --category="Feature" --method=POST
```

## Best Practices

### ✅ DO

- **Link source files**: Always add `'x-source'` extension
- **Document fields**: Use `description` for each property
- **Keep enums in sync**: If enum changes in source, update spec
- **Test before commit**: Run `npm run typecheck && npm run docs:verify`
- **Use semantic names**: `DocumentValidationResponse` not `Response1`

### ❌ DON'T

- **Duplicate type definitions**: Never define type in spec.ts AND source file
- **Forget x-source**: Always indicate where schema comes from
- **Hardcode values**: Reference source file enums/values
- **Leave comments in code**: Use spec.ts comments instead
- **Create new summary files**: Update existing docs per consolidation rules

## Future Improvements

### Planned (Not Yet Implemented)

1. **Automated Sync**
   - Scan property.ts for changes
   - Auto-generate spec.ts updates
   - Alert developers on type mismatch

2. **Zod-to-OpenAPI Integration**
   - Use `zod-to-openapi` library
   - Convert Zod schemas → OpenAPI JSON directly
   - Eliminates manual OpenAPI schema definitions

3. **Type-Safe Response Builders**
   - Use Zod inference to create type-safe response DTOs
   - Automatic schema generation from runtime types

## Troubleshooting

### Issue: Spec doesn't match validation schema

**Check:**
1. Open source file (e.g., `property.ts`)
2. Open spec.ts
3. Compare field names, types, enums
4. Update spec.ts to match

**Validate:**
```bash
npm run docs:verify
```

### Issue: New endpoint docs missing

**Check:**
1. Is route created? (`app/api/path/route.ts`)
2. Is endpoint defined in spec.ts paths?
3. Are request/response schemas defined?

**Add:**
```javascript
paths: {
  '/api/your/endpoint': {
    post: {
      requestBody: { schema: { $ref: '#/components/schemas/YourRequest' } },
      responses: { 200: { schema: { $ref: '#/components/schemas/YourResponse' } } }
    }
  }
}
```

## References

- **OpenAPI 3.0.0 Spec**: [openapis.org](https://spec.openapis.org/oas/v3.0.0)
- **Zod Documentation**: [zod.dev](https://zod.dev)
- **API Documentation Rules**: `copilot-instructions/07-api-documentation.md`
- **Documentation Consolidation**: `copilot-instructions/07-documentation-and-summary-rules.md`

---

**Last Updated:** May 24, 2026  
**Maintainers:** RealEST Engineering Team
