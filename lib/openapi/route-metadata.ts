/**
 * Route Metadata Contract for OpenAPI Generation
 *
 * Export an `openApi` constant from any Next.js route file to automatically
 * document the endpoint in the OpenAPI spec.
 *
 * @example
 * // app/api/properties/route.ts
 * import { propertyListingSchema } from '@/lib/validations/property'
 * import { zodToSchema } from '@/lib/openapi/zod-to-schema'
 *
 * export const openApi = {
 *   method: 'post',
 *   summary: 'Create property listing',
 *   tags: ['Properties'],
 *   requestBody: {
 *     content: {
 *       'application/json': {
 *         schema: zodToSchema(propertyListingSchema),
 *       },
 *     },
 *   },
 *   responses: {
 *     '201': {
 *       description: 'Created',
 *       content: {
 *         'application/json': {
 *           schema: zodToSchema(propertyListingSchema),
 *         },
 *       },
 *     },
 *   },
 * }
 *
 * export async function POST(req: Request) { ... }
 */

export interface OpenApiParameter {
  name: string
  in: 'query' | 'path' | 'header' | 'cookie'
  required?: boolean
  description?: string
  schema?: Record<string, any>
}

export interface OpenApiRequestBody {
  required?: boolean
  description?: string
  content: {
    [contentType: string]: {
      schema: Record<string, any>
    }
  }
}

export interface OpenApiResponse {
  description: string
  content?: {
    [contentType: string]: {
      schema: Record<string, any>
    }
  }
}

export interface OpenApiMetadata {
  /** HTTP method: get, post, put, patch, delete, etc. */
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options'

  /** Short summary of what the endpoint does */
  summary: string

  /** Longer description (optional) */
  description?: string

  /** OpenAPI tags for grouping endpoints */
  tags?: string[]

  /** Authentication/security schemes required */
  security?: { [name: string]: string[] }[]

  /** Path parameters, query parameters, etc. */
  parameters?: OpenApiParameter[]

  /** Request body schema */
  requestBody?: OpenApiRequestBody

  /** Response schemas by status code */
  responses: {
    [statusCode: string]: OpenApiResponse
  }

  /** Custom OpenAPI operation object extensions */
  [key: string]: any
}

/**
 * Type guard to check if a value is valid OpenAPI metadata
 */
export function isOpenApiMetadata(value: any): value is OpenApiMetadata {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.method === 'string' &&
    typeof value.summary === 'string' &&
    typeof value.responses === 'object'
  )
}
