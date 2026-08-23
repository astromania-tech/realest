/**
 * Zod-to-OpenAPI Schema Converter
 *
 * Converts Zod schemas to OpenAPI 3.0.0 JSON Schema format
 * This is the bridge between our Zod validation and OpenAPI documentation
 *
 * @see https://github.com/asteasolutions/zod-to-openapi
 */

import { z } from 'zod'

/**
 * Convert Zod schema to OpenAPI 3.0.0 JSON Schema
 * Handles complex nested types, enums, descriptions, etc.
 */
export function zodToOpenAPISchema(schema: z.ZodType<any>, description?: string): Record<string, any> {
  const result = parseZodType(schema)
  if (description && result && typeof result === 'object') {
    result.description = description
  }
  return result
}

/**
 * Parse a Zod type recursively
 */
function parseZodType(schema: any): any {
  // Handle optional/nullable
  if (schema instanceof z.ZodOptional) {
    return parseZodType(schema._def.innerType)
  }

  if (schema instanceof z.ZodNullable) {
    const inner = parseZodType(schema._def.innerType)
    return inner ? { ...inner, nullable: true } : { nullable: true }
  }

  // Handle basic types
  if (schema instanceof z.ZodString) {
    const result: any = { type: 'string' }
    if (schema._def.checks) {
      schema._def.checks.forEach((check: any) => {
        if (check.kind === 'min') result.minLength = check.value
        if (check.kind === 'max') result.maxLength = check.value
        if (check.kind === 'email') result.format = 'email'
        if (check.kind === 'url') result.format = 'uri'
        if (check.kind === 'uuid') result.format = 'uuid'
        if (check.kind === 'regex') result.pattern = check.regex.source
      })
    }
    return result
  }

  if (schema instanceof z.ZodNumber) {
    const result: any = { type: 'number' }
    if (schema._def.checks) {
      schema._def.checks.forEach((check: any) => {
        if (check.kind === 'min') result.minimum = check.value
        if (check.kind === 'max') result.maximum = check.value
        if (check.kind === 'int') result.type = 'integer'
      })
    }
    return result
  }

  if (schema instanceof z.ZodBoolean) {
    return { type: 'boolean' }
  }

  if (schema instanceof z.ZodDate) {
    return { type: 'string', format: 'date-time' }
  }

  // Handle enums
  if (schema instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: schema._def.values,
    }
  }

  if (schema instanceof z.ZodNativeEnum) {
    const values = Object.values(schema._def.values)
    return {
      type: typeof values[0],
      enum: values,
    }
  }

  // Handle array
  if (schema instanceof z.ZodArray) {
    const result: any = { type: 'array' }
    const itemSchema = parseZodType(schema._def.type)
    if (itemSchema) result.items = itemSchema
    if (schema._def.minLength) result.minItems = schema._def.minLength.value
    if (schema._def.maxLength) result.maxItems = schema._def.maxLength.value
    return result
  }

  // Handle object
  if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape()
    const properties: Record<string, any> = {}
    const required: string[] = []

    Object.entries(shape).forEach(([key, field]: [string, any]) => {
      const parsed = parseZodType(field)
      if (parsed) {
        properties[key] = parsed

        // Check if required (not optional/nullable)
        if (
          !(field instanceof z.ZodOptional) &&
          !(field instanceof z.ZodNullable) &&
          field._def.description !== undefined
        ) {
          required.push(key)
        }
      }
    })

    return {
      type: 'object',
      properties,
      ...(required.length > 0 && { required }),
    }
  }

  // Handle union/discriminated union
  if (schema instanceof z.ZodUnion) {
    const options = schema._def.options.map((s: any) => parseZodType(s))
    return { oneOf: options }
  }

  if (schema instanceof z.ZodDiscriminatedUnion) {
    const options = schema._def.options.map((s: any) => parseZodType(s))
    return { oneOf: options }
  }

  // Fallback
  return { type: 'object' }
}

/**
 * Extract description from Zod schema if available
 */
export function extractZodDescription(schema: any): string | undefined {
  if (schema._def?.description) {
    return schema._def.description
  }
  return undefined
}

/**
 * Build a reference to a schema component
 * Used in OpenAPI paths to reference defined schemas
 */
export function schemaRef(name: string): { $ref: string } {
  return { $ref: `#/components/schemas/${name}` }
}

/**
 * Get TypeScript type from Zod schema for runtime type inference
 */
export function getZodType<T>(schema: z.ZodType<T>): T {
  return schema.parse({} as any)
}

/**
 * Validate runtime value against Zod schema and return typed value
 * Throws if validation fails
 */
export function validateAndType<T>(schema: z.ZodType<T>, value: unknown): T {
  return schema.parse(value)
}

/**
 * Safe validation - returns result object instead of throwing
 */
export function safeValidate<T>(
  schema: z.ZodType<T>,
  value: unknown
): { success: boolean; data?: T; error?: string } {
  try {
    return { success: true, data: schema.parse(value) }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Validation failed' }
  }
}
