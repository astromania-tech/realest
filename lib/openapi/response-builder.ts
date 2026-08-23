/**
 * Type-Safe Response Builders
 *
 * Creates type-safe API responses that are automatically documented
 * and validated against Zod schemas. Ensures OpenAPI docs match runtime behavior.
 *
 * @example
 * ```typescript
 * // Define schema
 * const CreatePropertyResponse = z.object({
 *   id: z.string().uuid(),
 *   title: z.string(),
 *   created_at: z.string().datetime(),
 * })
 *
 * // Create builder
 * const propertyResponseBuilder = createResponseBuilder(
 *   CreatePropertyResponse,
 *   'Property created successfully'
 * )
 *
 * // Use in route
 * export async function POST(req: Request) {
 *   const property = await createProperty(data)
 *   return propertyResponseBuilder.success(property)
 * }
 * ```
 */

import { z } from 'zod'
import { zodToOpenAPISchema } from './zod-converter'

/**
 * Represents a successful API response
 */
export interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
  timestamp: string
}

/**
 * Represents an error API response
 */
export interface ErrorResponse {
  success: false
  error: string
  details?: Record<string, any>
  code?: string
  timestamp: string
}

/**
 * API Response (success or error)
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse

/**
 * Create a response builder for a specific Zod schema
 * Ensures type safety and automatic validation
 */
export function createResponseBuilder<T extends z.ZodType<any>>(
  schema: T,
  successMessage?: string
) {
  type ResponseType = z.infer<T>

  return {
    /**
     * Create a success response with validated data
     */
    success(data: ResponseType, message?: string): SuccessResponse<ResponseType> {
      // Validate data at runtime
      const validated = schema.parse(data)
      return {
        success: true,
        data: validated,
        message: message || successMessage,
        timestamp: new Date().toISOString(),
      }
    },

    /**
     * Create a JSON Response (Next.js compatible)
     */
    json(data: ResponseType, status = 200): Response {
      return Response.json(this.success(data), { status })
    },

    /**
     * Get the OpenAPI schema for this response
     */
    getSchema(description?: string) {
      return {
        ...zodToOpenAPISchema(schema, description),
        'x-type': 'response',
      }
    },

    /**
     * Get the Zod schema for runtime validation
     */
    getValidator() {
      return schema
    },
  }
}

/**
 * Create an error response builder
 */
export function createErrorResponseBuilder() {
  return {
    /**
     * Create a standard error response
     */
    error(
      message: string,
      code?: string,
      details?: Record<string, any>
    ): ErrorResponse {
      return {
        success: false,
        error: message,
        code,
        details,
        timestamp: new Date().toISOString(),
      }
    },

    /**
     * Create a JSON error response (Next.js compatible)
     */
    json(message: string, status = 400, code?: string): Response {
      return Response.json(this.error(message, code), { status })
    },

    /**
     * Validation error response
     */
    validationError(errors: Record<string, string[]>): ErrorResponse {
      return {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
        timestamp: new Date().toISOString(),
      }
    },

    /**
     * Unauthorized error
     */
    unauthorized(message = 'Unauthorized'): ErrorResponse {
      return {
        success: false,
        error: message,
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
      }
    },

    /**
     * Not found error
     */
    notFound(resource: string): ErrorResponse {
      return {
        success: false,
        error: `${resource} not found`,
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
      }
    },
  }
}

/**
 * Create a paginated response builder
 */
export function createPaginatedResponseBuilder<T extends z.ZodType<any>>(
  itemSchema: T,
  successMessage?: string
) {
  type ItemType = z.infer<T>

  const PaginatedSchema = z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      perPage: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  })

  return {
    /**
     * Create a paginated success response
     */
    success(
      items: ItemType[],
      page: number,
      perPage: number,
      total: number,
      message?: string
    ): SuccessResponse<{ data: ItemType[]; pagination: Record<string, any> }> {
      const totalPages = Math.ceil(total / perPage)
      const data = {
        data: items.map((item) => itemSchema.parse(item)),
        pagination: {
          page,
          perPage,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }

      return {
        success: true,
        data,
        message: message || successMessage,
        timestamp: new Date().toISOString(),
      }
    },

    /**
     * Create a JSON paginated response (Next.js compatible)
     */
    json(
      items: ItemType[],
      page: number,
      perPage: number,
      total: number,
      status = 200
    ): Response {
      return Response.json(this.success(items, page, perPage, total), { status })
    },

    /**
     * Get the OpenAPI schema for paginated response
     */
    getSchema(description?: string) {
      return zodToOpenAPISchema(PaginatedSchema, description)
    },
  }
}

/**
 * Helper: Convert Zod validation error to API error response
 */
export function zodErrorToApiError(error: z.ZodError): ErrorResponse {
  const details: Record<string, string[]> = {}
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    if (!details[path]) details[path] = []
    details[path].push(err.message)
  })

  return {
    success: false,
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Example: Complete typed endpoint using response builders
 *
 * @example
 * ```typescript
 * // In lib/api-responses/property.ts
 * export const createPropertyResponse = createResponseBuilder(
 *   propertyListingSchema,
 *   'Property created successfully'
 * )
 *
 * export const propertiesListResponse = createPaginatedResponseBuilder(
 *   propertyListingSchema,
 *   'Properties retrieved successfully'
 * )
 *
 * // In app/api/properties/route.ts
 * import { createPropertyResponse } from '@/lib/api-responses/property'
 * import { propertyListingSchema } from '@/lib/validations/property'
 *
 * export async function POST(req: Request) {
 *   try {
 *     const body = propertyListingSchema.parse(await req.json())
 *     const property = await db.properties.create(body)
 *     return createPropertyResponse.json(property, 201)
 *   } catch (err) {
 *     if (err instanceof z.ZodError) {
 *       return Response.json(zodErrorToApiError(err), { status: 400 })
 *     }
 *     return Response.json({ success: false, error: 'Server error' }, { status: 500 })
 *   }
 * }
 * ```
 */
