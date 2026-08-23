/**
 * Complete OpenAPI 3.0.0 Specification for RealEST API
 * 
 * This file serves as the central registry for all API endpoints.
 * Each endpoint should have an openApi metadata export in its route file.
 * This spec combines all metadata exports into a complete OpenAPI document.
 * 
 * WORKFLOW:
 * 1. Add `export const openApi[METHOD]: OpenApiMetadata` to each route file
 * 2. Generator scans and collects all exports
 * 3. This spec is built dynamically at build time
 * 4. Swagger UI consumes the generated spec
 */

export const completeSpec = {
  openapi: '3.0.0',
  info: {
    title: 'RealEST Property Marketplace API',
    description: 'Nigerian property marketplace API with ML validation, geospatial search, and comprehensive property management',
    version: '2.0.0',
    contact: {
      name: 'RealEST Support',
      email: 'support@realest.ng',
      url: 'https://realest.ng',
    },
    license: {
      name: 'Proprietary',
      url: 'https://realest.ng/license',
    },
    'x-status': 'Production',
    'x-endpoints-documented': '13/85', // Update as we add more metadata
  },
  
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
      variables: {},
    },
    {
      url: 'https://realest.ng/api',
      description: 'Production server',
      variables: {},
    },
  ],
  
  tags: [
    { name: 'Properties', description: 'Property CRUD and search operations' },
    { name: 'Inquiries', description: 'Property inquiry management' },
    { name: 'Profile', description: 'User profile management' },
    { name: 'Authentication', description: 'User authentication and password management' },
    { name: 'Dashboard', description: 'Owner/Agent dashboard operations' },
    { name: 'Agents', description: 'Agent directory and profiles' },
    { name: 'Admin', description: 'Administrative operations' },
    { name: 'Search', description: 'Advanced search capabilities' },
    { name: 'User', description: 'User operations' },
    { name: 'System', description: 'System health and information' },
    { name: 'Webhooks', description: 'Webhook endpoints' },
  ],
  
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Supabase JWT authentication token',
      },
    },
    
    schemas: {
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
          details: {
            type: 'object',
            description: 'Additional error details',
          },
          code: {
            type: 'string',
            description: 'Error code identifier',
          },
        },
      },
      
      Property: {
        type: 'object',
        description: 'Property listing',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'pending', 'live', 'archived'] },
        },
        'x-source': '@/lib/validations/property.ts → propertyListingSchema',
      },
      
      PropertyDetails: {
        type: 'object',
        description: 'Detailed property information',
        allOf: [
          { $ref: '#/components/schemas/Property' },
          {
            type: 'object',
            properties: {
              property_media: { type: 'array', items: { type: 'object' } },
              property_documents: { type: 'array', items: { type: 'object' } },
              inquiries: { type: 'array', items: { type: 'object' } },
            },
          },
        ],
      },
      
      Profile: {
        type: 'object',
        description: 'User profile',
        properties: {
          id: { type: 'string', format: 'uuid' },
          full_name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          bio: { type: 'string' },
          avatar_url: { type: 'string' },
        },
        'x-source': '@/lib/validations/profile.ts → profileSchema',
      },
      
      Inquiry: {
        type: 'object',
        description: 'Property inquiry',
        properties: {
          id: { type: 'string', format: 'uuid' },
          property_id: { type: 'string', format: 'uuid' },
          sender_id: { type: 'string', format: 'uuid' },
          owner_id: { type: 'string', format: 'uuid' },
          message: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'responded', 'closed'] },
          created_at: { type: 'string', format: 'date-time' },
        },
        'x-source': '@/lib/validations/inquiry.ts → createInquirySchema',
      },
    },
  },
  
  paths: {
    // Will be populated by generator from route metadata exports
    // Placeholder structure:
    '/api/properties': {
      get: {
        summary: 'List properties',
        tags: ['Properties'],
        operationId: 'listProperties',
      },
      post: {
        summary: 'Create property',
        tags: ['Properties'],
        operationId: 'createProperty',
      },
    },
  },
}

export const apiEndpoints = {
  TIER_1_PRIORITY: [
    '/api/properties',
    '/api/properties/{id}',
    '/api/properties/{id}/media',
    '/api/properties/{id}/documents',
    '/api/search/properties',
    '/api/saved-properties',
    '/api/inquiries',
    '/api/inquiries/{id}',
    '/api/profile',
    '/api/dashboard/listings',
    '/api/dashboard/listings/{id}',
  ],
  TIER_2_PRIORITY: [
    '/api/admin/properties',
    '/api/admin/properties/{id}/vet',
    '/api/admin/validation/document',
    '/api/admin/validation/image',
    '/api/agents',
    '/api/agents/{id}',
  ],
  TIER_3_PRIORITY: [
    '/api/system/health',
    '/api/system/status',
    '/api/notifications',
    '/api/referral/me',
    '/api/waitlist',
  ],
}
