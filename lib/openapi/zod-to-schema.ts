/**
 * Utility to convert Zod schemas to OpenAPI 3.0.0 JSON Schema format
 *
 * This ensures that Zod schemas are the single source of truth,
 * and OpenAPI documentation automatically stays in sync.
 *
 * @see docs/copilot-instructions/07-api-documentation.md
 */

import { z } from 'zod'

/**
 * Convert a Zod schema to OpenAPI 3.0.0 JSON Schema format
 *
 * @param schema - Zod schema to convert
 * @param description - Optional description for the schema
 * @returns OpenAPI-compatible JSON Schema
 *
 * @example
 * ```typescript
 * const propertySchema = zodToSchema(propertyListingSchema, 'Property listing for API')
 * ```
 */
export function zodToSchema(schema: z.ZodType<any>, description?: string): Record<string, any> {
  const jsonSchema = schema instanceof z.ZodObject ? (schema as z.ZodObject<any>).shape : {}

  // Basic mapping from Zod to JSON Schema
  const convert = (schema: any): any => {
    if (schema instanceof z.ZodString) {
      return { type: 'string' }
    }
    if (schema instanceof z.ZodNumber) {
      return { type: 'number' }
    }
    if (schema instanceof z.ZodBoolean) {
      return { type: 'boolean' }
    }
    if (schema instanceof z.ZodArray) {
      return {
        type: 'array',
        items: convert((schema as any)._def.type),
      }
    }
    if (schema instanceof z.ZodObject) {
      const props: Record<string, any> = {}
      Object.entries((schema as any).shape).forEach(([key, val]) => {
        props[key] = convert(val)
      })
      return {
        type: 'object',
        properties: props,
      }
    }
    if (schema instanceof z.ZodEnum) {
      return {
        type: 'string',
        enum: (schema as any)._def.values,
      }
    }
    return { type: 'object' }
  }

  const result = convert(schema)
  if (description) {
    result.description = description
  }
  return result
}

/**
 * Document that a schema is imported from a source file
 * This helps maintain the connection between OpenAPI docs and source code
 *
 * @param sourcePath - Path to the source file
 * @param schemaName - Name of the exported schema
 *
 * @example
 * ```typescript
 * // In spec.ts:
 * schemas: {
 *   PropertyListing: {
 *     ...sourceReference('@/lib/validations/property', 'propertyListingSchema'),
 *     // ... OpenAPI schema ...
 *   }
 * }
 * ```
 */
export function sourceReference(sourcePath: string, schemaName: string) {
  return {
    'x-source': {
      file: sourcePath,
      export: schemaName,
      note: 'This schema is imported from the source file. Update the source, not this definition.',
    },
  }
}
