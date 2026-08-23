/**
 * Automated OpenAPI Spec Generator
 *
 * Generates complete OpenAPI 3.0.0 specification from:
 * - Zod schemas (auto-converted)
 * - Schema registry (auto-discovered)
 * - Route metadata (auto-scanned)
 *
 * This replaces manual spec.ts maintenance with automatic generation
 *
 * @example
 * ```typescript
 * // Initialize and generate
 * const generator = new OpenAPISpecGenerator()
 * const spec = generator.generate()
 *
 * // Or use CLI script
 * node scripts/generate-api-spec.mjs
 * ```
 */

import { z } from 'zod'
import { zodToOpenAPISchema } from './zod-converter'
import { globalSchemaRegistry, SchemaRegistry } from './schema-registry'

/**
 * Endpoint metadata
 */
export interface EndpointMetadata {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'
  path: string
  summary: string
  description?: string
  tags?: string[]
  requestSchema?: string // Schema name from registry
  responseSchema?: string // Schema name from registry
  authRequired?: boolean
  deprecated?: boolean
  externalDocs?: {
    url: string
    description?: string
  }
}

/**
 * Automatic OpenAPI Spec Generator
 */
export class OpenAPISpecGenerator {
  private registry: SchemaRegistry
  private endpoints: Map<string, EndpointMetadata> = new Map()
  private baseInfo = {
    title: 'RealEST Property Marketplace API',
    description: 'Nigerian property marketplace API with ML validation, geospatial search, and intelligent matching',
    version: '2.0.0',
    contact: {
      name: 'RealEST Support',
      email: 'support@realest.ng',
    },
    license: {
      name: 'Proprietary',
    },
  }

  constructor(registry?: SchemaRegistry) {
    this.registry = registry || globalSchemaRegistry
  }

  /**
   * Register an endpoint
   */
  registerEndpoint(metadata: EndpointMetadata): this {
    const key = `${metadata.method} ${metadata.path}`
    this.endpoints.set(key, metadata)
    return this
  }

  /**
   * Register multiple endpoints
   */
  registerEndpoints(endpoints: EndpointMetadata[]): this {
    endpoints.forEach((ep) => this.registerEndpoint(ep))
    return this
  }

  /**
   * Generate complete OpenAPI spec
   */
  generate() {
    const schemas = this.generateSchemas()
    const paths = this.generatePaths()

    return {
      openapi: '3.0.0',
      info: this.baseInfo,
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
        {
          url: 'https://realest.ng',
          description: 'Production server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Supabase JWT Auth token',
          },
        },
        schemas,
      },
      paths,
      tags: this.generateTags(),
    }
  }

  /**
   * Generate components/schemas from registry
   */
  private generateSchemas() {
    const schemas: Record<string, any> = {}

    // Error schema (always included)
    schemas['Error'] = {
      type: 'object',
      properties: {
        success: { type: 'boolean', const: false },
        error: { type: 'string', description: 'Error message' },
        code: { type: 'string', description: 'Error code' },
        details: { type: 'object', description: 'Error details' },
        timestamp: { type: 'string', format: 'date-time' },
      },
      required: ['success', 'error', 'timestamp'],
    }

    // Generate schemas from registry
    this.registry.getAll().forEach((entry) => {
      schemas[entry.name] = {
        ...zodToOpenAPISchema(entry.schema),
        'x-source': `${entry.metadata.path} → ${entry.name}`,
        'x-type': entry.metadata.type,
      }
    })

    return schemas
  }

  /**
   * Generate paths from registered endpoints
   */
  private generatePaths() {
    const paths: Record<string, any> = {}

    this.endpoints.forEach((metadata, key) => {
      const pathKey = metadata.path
      const method = metadata.method.toLowerCase()

      if (!paths[pathKey]) {
        paths[pathKey] = {}
      }

      const operation: any = {
        summary: metadata.summary,
        operationId: this.generateOperationId(metadata),
        tags: metadata.tags || ['General'],
      }

      if (metadata.description) {
        operation.description = metadata.description
      }

      if (metadata.authRequired !== false) {
        operation.security = [{ bearerAuth: [] }]
      }

      if (metadata.deprecated) {
        operation.deprecated = true
      }

      // Request body
      if (metadata.requestSchema) {
        operation.requestBody = {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${metadata.requestSchema}` },
            },
          },
        }
      }

      // Response
      operation.responses = {
        200: {
          description: metadata.responseSchema ? 'Success' : 'Operation successful',
          ...(metadata.responseSchema && {
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${metadata.responseSchema}` },
              },
            },
          }),
        },
        400: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      }

      paths[pathKey][method] = operation
    })

    return paths
  }

  /**
   * Generate unique operation ID from endpoint metadata
   */
  private generateOperationId(metadata: EndpointMetadata): string {
    const method = metadata.method.toLowerCase()
    const parts = metadata.path
      .split('/')
      .filter((p) => p && !p.startsWith('['))
      .join('_')

    return `${method}_${parts}`.replace(/[^a-zA-Z0-9_]/g, '_')
  }

  /**
   * Generate tags from registered endpoints
   */
  private generateTags() {
    const tags: Record<string, string> = {}
    const tagDocs: Array<{ name: string; description: string }> = []

    this.endpoints.forEach((metadata) => {
      metadata.tags?.forEach((tag) => {
        if (!tags[tag]) {
          tags[tag] = tag
        }
      })
    })

    Object.keys(tags).forEach((tag) => {
      tagDocs.push({
        name: tag,
        description: this.getTagDescription(tag),
      })
    })

    return tagDocs
  }

  /**
   * Get description for a tag
   */
  private getTagDescription(tag: string): string {
    const tagDescriptions: Record<string, string> = {
      // Authentication & Access
      'Auth': 'Authentication and account management',
      'Authentication': 'Authentication and account management',

      // Properties & Listings
      'Properties': 'Property search, browse, and detail endpoints',
      'Listings': 'Property listing management (create, update, publish)',
      'Search': 'Search and discovery features (geospatial, filters, sorting)',

      // Media & Documents
      'Media': 'Property media (images, videos) management',
      'Documents': 'Property document upload and verification',

      // Inquiries & Communication
      'Inquiries': 'Property inquiry and contact management',

      // User / Owner Dashboards
      'User Dashboard': 'User-specific features and dashboard',
      'Owner Dashboard': 'Owner listing management and analytics',

      // Admin Groupings
      'Admin - Validation': 'Admin endpoints for property validation (document, image, duplicate detection)',
      'Admin - Vetting': 'Admin endpoints for human vetting and approval workflows',
      'Admin - Properties': 'Admin endpoints for property management and ML updates',
      'Admin - User Management': 'Admin endpoints for user and account management',
      'Admin - Analytics': 'Admin endpoints for analytics and reporting',

      // Utilities & System
      'Utilities': 'Utility endpoints and helpers (states, property-types, lookups)',
      'System': 'System health, status, and API documentation endpoints',
      'Health': 'System health and readiness checks',

      // Legacy / Generic
      'Validation': 'Document and image validation',
    }

    // Provide sensible fallbacks by normalizing common variants
    const normalized = tag.replace(/[:\-]/g, ' ').trim()
    if (tagDescriptions[tag]) return tagDescriptions[tag]
    if (tagDescriptions[normalized]) return tagDescriptions[normalized]

    return tag
  }

  /**
   * Export spec as JSON file content
   */
  exportAsJSON(): string {
    return JSON.stringify(this.generate(), null, 2)
  }

  /**
   * Get registry statistics
   */
  getStats() {
    return {
      registeredSchemas: this.registry.getStats(),
      registeredEndpoints: this.endpoints.size,
      endpointsByMethod: this.getEndpointsByMethod(),
    }
  }

  /**
   * Get endpoints grouped by HTTP method
   */
  private getEndpointsByMethod() {
    const methods: Record<string, number> = {}
    this.endpoints.forEach((ep) => {
      methods[ep.method] = (methods[ep.method] || 0) + 1
    })
    return methods
  }
}

/**
 * Create a generator with all default endpoints
 */
export function createDefaultGenerator(): OpenAPISpecGenerator {
  const generator = new OpenAPISpecGenerator(globalSchemaRegistry)

  // Register property endpoints
  generator
    .registerEndpoints([
      {
        method: 'POST',
        path: '/api/properties',
        summary: 'Create new property listing',
        description: 'Create a new property listing with all details, images, and documents',
        tags: ['Properties'],
        requestSchema: 'PropertyListing',
        responseSchema: 'PropertyListing',
        authRequired: true,
      },
      {
        method: 'GET',
        path: '/api/properties',
        summary: 'Search and browse properties',
        description: 'Search properties with filters, geospatial queries, and sorting',
        tags: ['Properties'],
        responseSchema: 'PropertyListing',
      },
      {
        method: 'GET',
        path: '/api/properties/{id}',
        summary: 'Get property details',
        description: 'Get complete details of a specific property',
        tags: ['Properties'],
        responseSchema: 'PropertyListing',
      },
      {
        method: 'POST',
        path: '/api/properties/{id}/media',
        summary: 'Upload property media',
        description: 'Upload images or videos for a property',
        tags: ['Media'],
        requestSchema: 'PropertyMedia',
        responseSchema: 'PropertyMedia',
        authRequired: true,
      },
      {
        method: 'POST',
        path: '/api/properties/{id}/documents',
        summary: 'Upload property documents',
        description: 'Upload legal documents (title, survey, etc)',
        tags: ['Documents'],
        requestSchema: 'PropertyDocument',
        responseSchema: 'PropertyDocument',
        authRequired: true,
      },
      {
        method: 'POST',
        path: '/api/admin/validation/document',
        summary: 'Validate property document',
        description: 'ML validation of legal documents for authenticity and completeness',
        tags: ['Admin - Validation'],
        authRequired: true,
      },
      {
        method: 'POST',
        path: '/api/admin/validation/image',
        summary: 'Validate property image',
        description: 'ML validation of property images for deepfakes, manipulation, quality',
        tags: ['Admin - Validation'],
        authRequired: true,
      },
      {
        method: 'POST',
        path: '/api/admin/validation/duplicates',
        summary: 'Check for duplicate properties',
        description: 'Detect duplicate or similar property listings',
        tags: ['Admin - Validation'],
        authRequired: true,
      },
    ])

  return generator
}
