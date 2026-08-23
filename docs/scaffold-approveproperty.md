
## 🎯 ApproveProperty Endpoint

### Step 1: Add Request Schema
Add to `lib/openapi/spec.ts` → `components.schemas`:

```typescript
  ApprovePropertyRequest: {
    type: 'object',
    description: 'Request body for approveproperty',
    properties: {
      // Add your properties here
      // Example:
      // propertyId: {
      //   type: 'string',
      //   format: 'uuid',
      //   description: 'Property UUID'
      // }
    },
    required: [] // Add required field names
  },
```

### Step 2: Add Response Schema
Add to `lib/openapi/spec.ts` → `components.schemas`:

```typescript
  ApprovePropertyResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Whether operation succeeded'
      },
      data: {
        type: 'object',
        description: 'Response data'
      },
      message: {
        type: 'string',
        description: 'Response message'
      }
    },
    required: ['success']
  },
```

### Step 3: Add Path Definition
Add to `lib/openapi/spec.ts` → `paths`:

```typescript
  '/api/approveproperty': {
    post: {
      summary: 'ApproveProperty',
      description: 'Detailed description of what this endpoint does',
      operationId: 'approveproperty',
      tags: ['Admin - Properties'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { \$ref: '#/components/schemas/${pascalCase}Request' }
          }
        }
      },
      responses: {
        201: {
          description: '${camelCase} created successfully',
          content: {
            'application/json': {
              schema: { \$ref: '#/components/schemas/${pascalCase}Response' }
            }
          }
        },
        200: {
          description: '${camelCase} updated successfully',
          content: {
            'application/json': {
              schema: { \$ref: '#/components/schemas/${pascalCase}Response' }
            }
          }
        },
        400: {
          description: 'Invalid request',
          content: {
            'application/json': {
              schema: { \$ref: '#/components/schemas/Error' }
            }
          }
        },
        401: {
          description: 'Unauthorized - authentication required',
          content: {
            'application/json': {
              schema: { \$ref: '#/components/schemas/Error' }
            }
          }
        },
        403: {
          description: 'Forbidden - insufficient permissions',
          content: {
            'application/json': {
              schema: { \$ref: '#/components/schemas/Error' }
            }
          }
        },
        404: {
          description: 'Not found',
          content: {
            'application/json': {
              schema: { \$ref: '#/components/schemas/Error' }
            }
          }
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: { \$ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  }
```

### Step 4: Test
1. Restart dev server: `npm run dev`
2. Visit: `http://localhost:3000/docs`
3. Look for `POST /api/approveproperty` under "Admin - Properties" category
4. Click "Try it out" to test

---

**Don't forget to:**
- [ ] Add property definitions in RequestSchema
- [ ] Add security if admin-only: `security: [{ bearerAuth: [] }]`
- [ ] Update description with details
- [ ] Test in Swagger UI
- [ ] Commit changes together

