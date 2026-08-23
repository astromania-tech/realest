/**
 * Schema Registry
 *
 * Auto-discovers, catalogs, and manages all Zod schemas in the project
 * Serves as the single source of truth for available schemas
 *
 * Schemas are discovered from:
 * - lib/validations/
 * - lib/types/
 * - lib/api-responses/
 */

import { z } from 'zod'

/**
 * Metadata about a registered schema
 */
export interface SchemaMetadata {
  name: string
  path: string
  type: 'request' | 'response' | 'validation'
  description?: string
  exported: boolean
  version: string
}

/**
 * Schema registry entry
 */
export interface SchemaEntry {
  name: string
  schema: z.ZodType<any>
  metadata: SchemaMetadata
  usedIn?: string[] // Which endpoints use this schema
}

/**
 * Central schema registry
 */
export class SchemaRegistry {
  private schemas: Map<string, SchemaEntry> = new Map()
  private endpointSchemas: Map<string, Set<string>> = new Map() // endpoint → schema names

  /**
   * Register a Zod schema
   */
  register(name: string, schema: z.ZodType<any>, metadata: Omit<SchemaMetadata, 'name'>) {
    this.schemas.set(name, {
      name,
      schema,
      metadata: { ...metadata, name },
    })
    return this
  }

  /**
   * Register multiple schemas at once
   */
  registerBatch(schemas: Record<string, { schema: z.ZodType<any>; metadata: Omit<SchemaMetadata, 'name'> }>) {
    Object.entries(schemas).forEach(([name, { schema, metadata }]) => {
      this.register(name, schema, metadata)
    })
    return this
  }

  /**
   * Get a registered schema
   */
  get(name: string): SchemaEntry | undefined {
    return this.schemas.get(name)
  }

  /**
   * Get all registered schemas
   */
  getAll(): SchemaEntry[] {
    return Array.from(this.schemas.values())
  }

  /**
   * Get schemas by type
   */
  getByType(type: 'request' | 'response' | 'validation'): SchemaEntry[] {
    return this.getAll().filter((s) => s.metadata.type === type)
  }

  /**
   * Get schemas by path (file location)
   */
  getByPath(path: string): SchemaEntry[] {
    return this.getAll().filter((s) => s.metadata.path.includes(path))
  }

  /**
   * Link schema to endpoint
   */
  linkToEndpoint(endpoint: string, schemaNames: string[]) {
    if (!this.endpointSchemas.has(endpoint)) {
      this.endpointSchemas.set(endpoint, new Set())
    }
    schemaNames.forEach((name) => {
      this.endpointSchemas.get(endpoint)!.add(name)
    })
    return this
  }

  /**
   * Get schemas used by an endpoint
   */
  getEndpointSchemas(endpoint: string): SchemaEntry[] {
    const schemaNames = this.endpointSchemas.get(endpoint) || new Set()
    return Array.from(schemaNames)
      .map((name) => this.get(name))
      .filter((s) => s !== undefined) as SchemaEntry[]
  }

  /**
   * Get endpoints using a schema
   */
  getSchemaUsage(schemaName: string): string[] {
    const endpoints: string[] = []
    this.endpointSchemas.forEach((schemas, endpoint) => {
      if (schemas.has(schemaName)) {
        endpoints.push(endpoint)
      }
    })
    return endpoints
  }

  /**
   * Check if schema is registered
   */
  has(name: string): boolean {
    return this.schemas.has(name)
  }

  /**
   * Get registry statistics
   */
  getStats() {
    return {
      totalSchemas: this.schemas.size,
      byType: {
        request: this.getByType('request').length,
        response: this.getByType('response').length,
        validation: this.getByType('validation').length,
      },
      byPath: this.getAll().reduce(
        (acc, s) => {
          const key = s.metadata.path.split('/').slice(-1)[0]
          acc[key] = (acc[key] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
    }
  }

  /**
   * Export registry as JSON (for debugging)
   */
  export() {
    return {
      schemas: Array.from(this.schemas.entries()).map(([name, entry]) => ({
        name,
        path: entry.metadata.path,
        type: entry.metadata.type,
        description: entry.metadata.description,
      })),
      endpoints: Array.from(this.endpointSchemas.entries()).map(([endpoint, schemas]) => ({
        endpoint,
        schemas: Array.from(schemas),
      })),
      stats: this.getStats(),
    }
  }
}

/**
 * Global registry instance
 */
export const globalSchemaRegistry = new SchemaRegistry()

/**
 * Initialize registry with all known schemas
 * This is called once at startup
 */
export function initializeSchemaRegistry() {
  // Property validation schemas
  const { propertyListingSchema, propertyDetailsSchema, propertyMediaSchema, propertyDocumentSchema } = require(
    '@/lib/validations/property'
  )

  globalSchemaRegistry
    .register('PropertyListing', propertyListingSchema, {
      path: 'lib/validations/property.ts',
      type: 'validation',
      description: 'Nigerian property listing for rent or sale',
      exported: true,
      version: '1.0.0',
    })
    .register('PropertyDetails', propertyDetailsSchema, {
      path: 'lib/validations/property.ts',
      type: 'validation',
      description: 'Additional property details and metadata',
      exported: true,
      version: '1.0.0',
    })
    .register('PropertyMedia', propertyMediaSchema, {
      path: 'lib/validations/property.ts',
      type: 'validation',
      description: 'Property media (images, videos)',
      exported: true,
      version: '1.0.0',
    })
    .register('PropertyDocument', propertyDocumentSchema, {
      path: 'lib/validations/property.ts',
      type: 'validation',
      description: 'Property legal documents',
      exported: true,
      version: '1.0.0',
    })

  // Link to endpoints
  globalSchemaRegistry
    .linkToEndpoint('POST /api/properties', ['PropertyListing'])
    .linkToEndpoint('GET /api/properties', ['PropertyListing'])
    .linkToEndpoint('POST /api/properties/[id]/media', ['PropertyMedia'])
    .linkToEndpoint('POST /api/properties/[id]/documents', ['PropertyDocument'])

  return globalSchemaRegistry
}

/**
 * Quick helper: get or register a schema
 */
export function getOrRegisterSchema(name: string, schema: z.ZodType<any>, metadata: Omit<SchemaMetadata, 'name'>) {
  if (!globalSchemaRegistry.has(name)) {
    globalSchemaRegistry.register(name, schema, metadata)
  }
  return globalSchemaRegistry.get(name)!
}
