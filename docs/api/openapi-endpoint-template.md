/**
 * TEMPLATE: How to Document a New API Endpoint
 * 
 * When you create a new endpoint, follow these 3 steps:
 * 
 * 1. Define Request Schema
 * 2. Define Response Schema  
 * 3. Add Path Definition
 * 
 * Then restart dev server - docs auto-update!
 */

// ============================================================================
// STEP 1: ADD REQUEST SCHEMA
// ============================================================================
// Location: lib/openapi/spec.ts → components.schemas

// Example: MyEndpointRequest
MyEndpointRequest: {
  type: 'object',
  description: 'Request body for my endpoint',
  properties: {
    propertyId: {
      type: 'string',
      format: 'uuid',
      description: 'Property UUID'
    },
    name: {
      type: 'string',
      minLength: 3,
      description: 'Name of the item'
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'Email address'
    },
    // Add more properties as needed
  },
  required: ['propertyId', 'name'] // Fields that must be included
}

// ============================================================================
// STEP 2: ADD RESPONSE SCHEMA
// ============================================================================
// Location: lib/openapi/spec.ts → components.schemas

// Example: MyEndpointResponse (Success)
MyEndpointResponse: {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      description: 'Whether operation succeeded'
    },
    data: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    },
    message: { type: 'string' }
  },
  required: ['success', 'data']
}

// ============================================================================
// STEP 3: ADD PATH DEFINITION
// ============================================================================
// Location: lib/openapi/spec.ts → paths

'/api/my-category/my-endpoint': {
  post: {
    // What it does in short
    summary: 'Create or update something',
    
    // Detailed explanation
    description: 'Long description of what this endpoint does and why.',
    
    // Unique ID for code generation
    operationId: 'myEndpointOperation',
    
    // Category in UI
    tags: ['My Category'],
    
    // Authentication required?
    security: [{ bearerAuth: [] }], // or remove if public
    
    // Request body
    requestBody: {
      required: true,
      content: {
        // For JSON
        'application/json': {
          schema: { $ref: '#/components/schemas/MyEndpointRequest' }
        },
        
        // OR for multipart (file upload)
        // 'multipart/form-data': {
        //   schema: { $ref: '#/components/schemas/MyEndpointRequest' }
        // }
      }
    },
    
    // Responses
    responses: {
      200: {
        description: 'Success - operation completed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MyEndpointResponse' }
          }
        }
      },
      400: {
        description: 'Bad request - invalid input',
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
        description: 'Forbidden - insufficient permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      404: {
        description: 'Not found - resource does not exist',
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

// ============================================================================
// REAL EXAMPLE: Document Validation Endpoint
// ============================================================================

/*
// STEP 1: Request Schema
DocumentValidationRequest: {
  type: 'object',
  description: 'Request for document validation',
  properties: {
    file: {
      type: 'string',
      format: 'binary',
      description: 'Document file (PDF, JPEG, PNG)'
    },
    propertyId: {
      type: 'string',
      format: 'uuid',
      description: 'Property UUID'
    },
    documentType: {
      type: 'string',
      enum: ['title_deed', 'survey_plan', 'certificate_of_occupancy'],
      description: 'Type of document'
    }
  },
  required: ['file', 'propertyId', 'documentType']
}

// STEP 2: Response Schema
DocumentValidationResponse: {
  type: 'object',
  properties: {
    isValid: { type: 'boolean' },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    issues: { type: 'array', items: { type: 'string' } },
    checks: { type: 'object' },
    metadata: { type: 'object' }
  },
  required: ['isValid', 'confidence', 'issues', 'checks', 'metadata']
}

// STEP 3: Path Definition
'/api/admin/validation/document': {
  post: {
    summary: 'Validate a property document',
    description: 'Validates legal documents using ML...',
    operationId: 'validateDocument',
    tags: ['Admin - Validation'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: { $ref: '#/components/schemas/DocumentValidationRequest' }
        }
      }
    },
    responses: {
      200: {
        description: 'Validation completed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/DocumentValidationResponse' }
          }
        }
      },
      // ... error responses ...
    }
  }
}
*/

// ============================================================================
// COMMON PATTERNS
// ============================================================================

// Pattern 1: GET endpoint (retrieve resource)
'/api/resource/{id}': {
  get: {
    summary: 'Get a resource by ID',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' }
      }
    ],
    responses: {
      200: { /* ... */ },
      404: { /* ... */ }
    }
  }
}

// Pattern 2: POST endpoint (create resource)
'/api/resource': {
  post: {
    summary: 'Create a new resource',
    requestBody: { /* ... */ },
    responses: {
      201: { /* ... */ },
      400: { /* ... */ }
    }
  }
}

// Pattern 3: PUT endpoint (update resource)
'/api/resource/{id}': {
  put: {
    summary: 'Update a resource',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' }
      }
    ],
    requestBody: { /* ... */ },
    responses: {
      200: { /* ... */ },
      404: { /* ... */ }
    }
  }
}

// Pattern 4: DELETE endpoint (remove resource)
'/api/resource/{id}': {
  delete: {
    summary: 'Delete a resource',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' }
      }
    ],
    responses: {
      204: { description: 'Deleted' },
      404: { /* ... */ }
    }
  }
}

// ============================================================================
// QUICK CHECKLIST
// ============================================================================

/*
When documenting a new endpoint:

☐ Add request schema in components.schemas
☐ Add response schema in components.schemas
☐ Add path in paths section
☐ Include summary (short description)
☐ Include description (detailed explanation)
☐ Set operationId (unique name)
☐ Add tags (for UI grouping)
☐ Set security if admin/auth required
☐ Define all response codes (200, 400, 401, 403, 404, 500)
☐ Include example values for properties
☐ Add Nigerian context if applicable (states, property types, etc.)
☐ Restart dev server
☐ Verify at http://localhost:3000/docs
*/

// ============================================================================
// HOW TO KEEP IT IN SYNC
// ============================================================================

/*
3-Step Process for New Endpoints:

1. WRITE CODE
   Create your endpoint: app/api/my-endpoint/route.ts
   Define request/response types: lib/types/my-types.ts

2. DOCUMENT IN OPENAPI
   Edit: lib/openapi/spec.ts
   Copy template above
   Fill in your endpoint details
   Add to paths section

3. RESTART & TEST
   npm run dev
   Visit: http://localhost:3000/docs
   Test the endpoint directly in Swagger UI

That's it! Your API is now:
✅ Documented
✅ Testable
✅ Shareable
✅ Type-safe
*/
