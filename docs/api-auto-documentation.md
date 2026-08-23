<!-- ignore -->

# Automatic API Documentation with OpenAPI

This guide explains how to add automatic OpenAPI/Swagger documentation to your API routes without manually editing `spec.ts`.

## Quick Start

### 1. Add metadata export to your route file

In any `app/api/**/route.ts` file, export an `openApi` constant:

```typescript
// app/api/properties/route.ts

import { propertyListingSchema } from '@/lib/validations/property'
import { zodToSchema } from '@/lib/openapi/zod-to-schema'
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'

export const openApi: OpenApiMetadata = {
  method: 'post',
  summary: 'Create property listing',
  description: 'Create a new property listing with media and documents',
  tags: ['Properties'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: zodToSchema(propertyListingSchema, 'Property listing request'),
      },
    },
  },
  responses: {
    '201': {
      description: 'Property created successfully',
      content: {
        'application/json': {
          schema: zodToSchema(propertyListingSchema, 'Created property'),
        },
      },
    },
    '400': {
      description: 'Validation error',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '401': {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },
}

export async function POST(req: Request) {
  // ... your handler implementation
}
```

### 2. Generate the OpenAPI spec

Run:

```bash
npm run generate:api-spec
```

This generates `lib/openapi/generated.json` with your auto-documented endpoints.

### 3. View in Swagger UI

Start the dev server:

```bash
npm run dev
```

Then open:

```
http://localhost:3000/api-docs
```

You'll see all endpoints with their documentation, request/response schemas, and interactive "Try it out" buttons.

---

## Metadata Reference

### OpenApiMetadata Interface

```typescript
interface OpenApiMetadata {
  // HTTP method (required)
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options'

  // Short summary (required)
  summary: string

  // Long description (optional)
  description?: string

  // OpenAPI tags for organizing endpoints
  tags?: string[]

  // Security schemes required for this endpoint
  security?: { [name: string]: string[] }[]

  // Path, query, header parameters
  parameters?: OpenApiParameter[]

  // Request body schema
  requestBody?: OpenApiRequestBody

  // Response schemas by HTTP status code (required)
  responses: {
    [statusCode: string]: OpenApiResponse
  }
}
```

---

## Common Examples

### GET endpoint with path parameter

```typescript
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata'

export const openApi: OpenApiMetadata = {
  method: 'get',
  summary: 'Get property by ID',
  tags: ['Properties'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Property ID',
    },
  ],
  responses: {
    '200': {
      description: 'Property details',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/PropertyListing' },
        },
      },
    },
    '404': {
      description: 'Property not found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // ... implementation
}
```

### GET endpoint with query parameters

```typescript
export const openApi: OpenApiMetadata = {
  method: 'get',
  summary: 'Search properties',
  tags: ['Properties'],
  parameters: [
    {
      name: 'city',
      in: 'query',
      schema: { type: 'string' },
      description: 'Filter by city',
    },
    {
      name: 'state',
      in: 'query',
      schema: { type: 'string' },
      description: 'Filter by state',
    },
    {
      name: 'property_type',
      in: 'query',
      schema: { type: 'string' },
      description: 'Filter by property type',
    },
    {
      name: 'page',
      in: 'query',
      schema: { type: 'integer', minimum: 1 },
      description: 'Page number',
    },
  ],
  responses: {
    '200': {
      description: 'Properties matching search criteria',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              properties: {
                type: 'array',
                items: { $ref: '#/components/schemas/PropertyListing' },
              },
              total: { type: 'number' },
              page: { type: 'number' },
            },
          },
        },
      },
    },
  },
}

export async function GET(req: Request) {
  // ... implementation
}
```

### POST with authentication

```typescript
export const openApi: OpenApiMetadata = {
  method: 'post',
  summary: 'Validate property document',
  tags: ['Admin - Validation'],
  security: [{ bearerAuth: [] }], // Requires auth token
  requestBody: {
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            propertyId: { type: 'string', format: 'uuid' },
            document: { type: 'string', format: 'binary' },
            documentType: { type: 'string' },
          },
          required: ['propertyId', 'document', 'documentType'],
        },
      },
    },
  },
  responses: {
    '200': {
      description: 'Validation result',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/DocumentValidationResponse' },
        },
      },
    },
    '401': {
      description: 'Unauthorized - Auth token required',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },
}

export async function POST(req: Request) {
  // ... implementation
}
```

---

## Using Zod Schemas

If your endpoint uses a Zod schema, convert it to OpenAPI format with `zodToSchema()`:

```typescript
import { propertyListingSchema } from '@/lib/validations/property'
import { zodToSchema } from '@/lib/openapi/zod-to-schema'

export const openApi: OpenApiMetadata = {
  method: 'post',
  summary: 'Create property',
  requestBody: {
    required: true,
    content: {
      'application/json': {
        // Automatically converts Zod schema to OpenAPI JSON Schema
        schema: zodToSchema(propertyListingSchema, 'New property listing'),
      },
    },
  },
  responses: {
    '201': {
      description: 'Created',
      content: {
        'application/json': {
          schema: zodToSchema(propertyListingSchema),
        },
      },
    },
  },
}
```

---

## Best Practices

### ✅ DO

- **Use TypeScript types** for `openApi` to catch schema errors at compile time
- **Reference shared schemas** with `$ref: '#/components/schemas/PropertyListing'`
- **Add descriptions** to all endpoints and parameters
- **Include error responses** (400, 401, 404, 500)
- **Use Zod schemas** to avoid duplication with validation code
- **Group endpoints with tags** for organization in Swagger UI

### ❌ DON'T

- **Hardcode JSON schemas** - use `zodToSchema()` instead
- **Create new endpoint files without openApi metadata** - docs will be incomplete
- **Repeat property definitions** - always use `$ref` to reference existing schemas
- **Forget 400/401/404 responses** - document all error cases
- **Leave descriptions empty** - future developers need context

---

## Working with the Generator

### Run the generator

```bash
npm run generate:api-spec
```

This:
1. Scans `app/api/**/route.ts` files
2. Extracts `openApi` metadata exports
3. Builds `lib/openapi/generated.json`
4. Serves it via `/api/docs/openapi.json`

### View the result

```bash
npm run dev
# Then visit http://localhost:3000/api-docs
```

### Regenerate after changes

The generator runs automatically before every build:

```bash
npm run build
```

Or regenerate manually anytime:

```bash
npm run generate:api-spec
```

---

## Troubleshooting

### "Route file has no openApi export"

Add the `openApi` export to the route file:

```typescript
export const openApi: OpenApiMetadata = {
  method: 'get',
  summary: 'Your endpoint summary',
  responses: {
    '200': { description: 'Success' },
  },
}
```

### "Schema not found in components"

If you reference a schema with `$ref`, make sure it's defined in the generator's `components.schemas`.

For custom schemas, either:
1. Define them in the generator script
2. Use inline schemas with `zodToSchema()`

### Swagger UI shows empty spec

1. Verify `npm run generate:api-spec` ran successfully
2. Check that `lib/openapi/generated.json` was created
3. Restart the dev server: `npm run dev`
4. Visit `http://localhost:3000/api-docs`

---

## Next Steps

1. ✅ Add `openApi` metadata to all route files
2. ✅ Run `npm run generate:api-spec`
3. ✅ View in Swagger UI at `/api-docs`
4. ✅ Use "Try it out" to test endpoints interactively
5. ✅ Share the API docs link with frontend/mobile teams

---

## See Also

- [OpenAPI 3.0.0 Specification](https://spec.openapis.org/oas/v3.0.0)
- [Zod Documentation](https://zod.dev)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
