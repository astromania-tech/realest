import { z } from 'zod'

/**
 * OpenAPI 3.0.0 Specification for RealEST API
 *
 * ⚠️ IMPORTANT: This file is the SINGLE SOURCE OF TRUTH for API documentation.
 * 
 * Type References:
 * - Property schemas: Defined at @/lib/validations/property.ts
 * - Validation types: Defined at @/lib/types/validation.ts
 *
 * How to maintain sync:
 * 1. When you update a Zod schema in property.ts, update PropertyListing schema here
 * 2. When you update a type in validation.ts, update corresponding response schemas here
 * 3. Each schema has 'x-source' extension linking to its source file
 *
 * @see copilot-instructions/07-api-documentation.md
 * @see copilot-instructions/07-documentation-and-summary-rules.md
 */

export const apiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'RealEST Property Marketplace API',
    description: 'Nigerian property marketplace API with ML validation for documents, images, and duplicate detection',
    version: '1.0.0',
    contact: {
      name: 'RealEST Support',
      email: 'support@realest.ng',
    },
    license: {
      name: 'Proprietary',
    },
  },
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
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', description: 'Error message' },
          details: { type: 'string', description: 'Error details' },
          code: { type: 'string', description: 'Error code' },
        },
        required: ['error'],
        'x-source': '@/lib/types/validation.ts → ValidationErrorResponse',
      },

      /**
       * ✅ PropertyListing Schema
       *
       * SOURCE: @/lib/validations/property.ts → propertyListingSchema
       * 
       * When you update propertyListingSchema in property.ts,
       * you MUST update this schema as well to keep docs in sync.
       *
       * Fields: title, description, property_type, listing_type, listing_source,
       *         address, city, state, postal_code, country,
       *         latitude, longitude, bedrooms, bathrooms, toilets,
       *         square_feet, year_built, price, price_frequency,
       *         status, verification_status, images, documents, metadata
       */
      PropertyListing: {
        type: 'object',
        description: 'Nigerian property listing for rent or sale',
        properties: {
          title: { type: 'string', minLength: 10, maxLength: 100 },
          description: { type: 'string', minLength: 50 },
          property_type: {
            type: 'string',
            enum: [
              'house', 'apartment', 'land', 'commercial', 'event_center',
              'hotel', 'shop', 'office', 'duplex', 'bungalow', 'flat',
              'self_contained', 'mini_flat', 'room_and_parlor', 'single_room',
              'penthouse', 'terrace', 'detached_house', 'warehouse', 'showroom',
              'restaurant', 'residential_land', 'commercial_land', 'mixed_use_land', 'farmland',
            ],
          },
          listing_type: { type: 'string', enum: ['for_rent', 'for_sale', 'for_lease', 'short_let', 'location'] },
          listing_source: { type: 'string', enum: ['owner', 'agent'], default: 'owner' },
          address: { type: 'string', minLength: 5 },
          city: { type: 'string', minLength: 2 },
          state: { type: 'string', minLength: 2 },
          latitude: { type: 'number', minimum: -90, maximum: 90 },
          longitude: { type: 'number', minimum: -180, maximum: 180 },
          bedrooms: { type: 'number', minimum: 0 },
          bathrooms: { type: 'number', minimum: 0 },
          price: { type: 'number', minimum: 1000 },
          price_frequency: { type: 'string', enum: ['monthly', 'yearly', 'sale', 'nightly', 'daily'] },
          status: { type: 'string', enum: ['draft', 'active', 'inactive', 'sold', 'rented', 'pending_ml_validation'] },
          verification_status: { type: 'string', enum: ['pending', 'verified', 'rejected'] },
          images: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            maxItems: 20,
          },
        },
        required: ['title', 'description', 'property_type', 'listing_type', 'address', 'city', 'state', 'latitude', 'longitude', 'price'],
      },

      // Document Validation Schemas (based on @/lib/types/validation.ts → DocumentValidationResult)
      DocumentValidationRequest: {
        type: 'object',
        description: 'Request body for document validation',
        properties: {
          propertyId: {
            type: 'string',
            format: 'uuid',
            description: 'Property UUID',
          },
          documentType: {
            type: 'string',
            enum: [
              'title_deed',
              'survey_plan',
              'certificate_of_occupancy',
              'building_permit',
              'purchase_receipt',
              'allocation_letter',
              'deed_of_assignment',
              'power_of_attorney',
              'lease_agreement',
              'proof_of_payment',
            ],
            description: 'Type of document being validated',
          },
        },
        required: ['propertyId', 'documentType'],
        'x-source': '@/lib/types/validation.ts → DocumentValidationResult',
      },

      DocumentValidationResponse: {
        type: 'object',
        description: 'Document validation result from ML pipeline',
        properties: {
          isValid: { type: 'boolean', description: 'Whether document passed validation' },
          confidence: { type: 'number', minimum: 0, maximum: 1, description: 'Confidence score (0-1)' },
          documentType: { type: ['string', 'null'], description: 'Detected document type' },
          extractedText: { type: 'string', description: 'OCR-extracted text from document' },
          issues: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of validation issues found',
          },
          checks: {
            type: 'object',
            properties: {
              isAuthentic: { type: 'boolean', description: 'Authenticity verification result' },
              hasRequiredFields: { type: 'boolean', description: 'All required fields present' },
              matchesTemplate: { type: 'boolean', description: 'Matches Nigerian document template' },
              hasWatermark: { type: 'boolean', description: 'Watermark detection' },
              textQuality: { type: 'number', minimum: 0, maximum: 1 },
            },
          },
          metadata: {
            type: 'object',
            properties: {
              pageCount: { type: 'number' },
              size: { type: 'number', description: 'File size in bytes' },
              format: { type: 'string', description: 'Document format (PDF, JPEG, etc)' },
            },
          },
        },
        required: ['isValid', 'confidence', 'issues', 'checks', 'metadata'],
        'x-source': '@/lib/types/validation.ts → DocumentValidationResult',
      },

      // Image Validation Schemas (based on @/lib/types/validation.ts → ImageValidationResult)
      ImageValidationRequest: {
        type: 'object',
        description: 'Request body for image validation',
        properties: {
          propertyId: {
            type: 'string',
            format: 'uuid',
            description: 'Property UUID',
          },
          propertyType: {
            type: 'string',
            enum: [
              'house',
              'apartment',
              'bq',
              'self_contained',
              'face_me_i_face_you',
              'office',
              'shop',
              'warehouse',
              'land',
              'commercial',
            ],
            description: 'Type of property',
          },
        },
        required: ['propertyId', 'propertyType'],
        'x-source': '@/lib/types/validation.ts → ImageValidationResult',
      },

      ImageValidationResponse: {
        type: 'object',
        description: 'Image validation result from ML pipeline',
        properties: {
          isValid: { type: 'boolean', description: 'Whether image passed validation' },
          confidence: { type: 'number', minimum: 0, maximum: 1, description: 'Confidence score (0-1)' },
          issues: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of validation issues',
          },
          checks: {
            type: 'object',
            properties: {
              isRealPhoto: { type: 'boolean', description: 'Deepfake/AI detection' },
              isManipulated: { type: 'boolean', description: 'Image manipulation detection' },
              hasAdultContent: { type: 'boolean' },
              hasPropertyContent: { type: 'boolean' },
              qualityScore: { type: 'number', minimum: 0, maximum: 1 },
            },
          },
          metadata: {
            type: 'object',
            properties: {
              width: { type: 'number' },
              height: { type: 'number' },
              format: { type: 'string' },
              size: { type: 'number', description: 'File size in bytes' },
              hasExif: { type: 'boolean' },
              location: {
                type: ['object', 'null'],
                properties: {
                  lat: { type: 'number' },
                  lng: { type: 'number' },
                },
              },
            },
          },
        },
        required: ['isValid', 'confidence', 'issues', 'checks', 'metadata'],
        'x-source': '@/lib/types/validation.ts → ImageValidationResult',
      },

      // Duplicate Detection Schemas (based on @/lib/types/validation.ts → DuplicateCheckResult)
      DuplicateCheckRequest: {
        type: 'object',
        description: 'Request to check for duplicate properties',
        properties: {
          propertyId: {
            type: 'string',
            format: 'uuid',
            description: 'Property UUID to check',
          },
          address: {
            type: 'string',
            minLength: 5,
            description: 'Property address',
          },
          description: {
            type: 'string',
            minLength: 10,
            description: 'Property description',
          },
          location: {
            type: 'object',
            properties: {
              lat: { type: 'number', minimum: -90, maximum: 90 },
              lng: { type: 'number', minimum: -180, maximum: 180 },
            },
            required: ['lat', 'lng'],
            description: 'GPS coordinates',
          },
          propertyType: {
            type: 'string',
            enum: [
              'house',
              'apartment',
              'bq',
              'self_contained',
              'face_me_i_face_you',
              'office',
              'shop',
              'warehouse',
              'land',
              'commercial',
            ],
          },
          images: {
            type: 'array',
            items: { type: 'string' },
            description: 'Image URLs for comparison',
          },
        },
        required: ['propertyId', 'location', 'description', 'address', 'propertyType'],
        'x-source': '@/lib/types/validation.ts → DuplicateCheckResult',
      },

      DuplicateCheckResponse: {
        type: 'object',
        description: 'Duplicate detection result',
        properties: {
          isDuplicate: { type: 'boolean', description: 'Whether duplicates were found' },
          confidence: { type: 'number', minimum: 0, maximum: 1, description: 'Duplicate confidence' },
          matchedProperties: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
                address: { type: 'string' },
                similarityScore: { type: 'number', minimum: 0, maximum: 1 },
                matchType: { type: 'string', enum: ['image', 'location', 'description', 'combined'] },
                details: { type: 'string', description: 'Why this is a match' },
              },
            },
            description: 'Potentially matching properties',
          },
          checks: {
            type: 'object',
            properties: {
              imageSimilarity: { type: 'number', minimum: 0, maximum: 1 },
              locationProximity: { type: 'number', minimum: 0, maximum: 1 },
              textSimilarity: { type: 'number', minimum: 0, maximum: 1 },
              metadataSimilarity: { type: 'number', minimum: 0, maximum: 1 },
            },
            description: 'Individual similarity scores',
          },
        },
        required: ['isDuplicate', 'confidence', 'matchedProperties', 'checks'],
        'x-source': '@/lib/types/validation.ts → DuplicateCheckResult',
      },
    },
  },

  paths: {
    '/api/admin/validation/document': {
      post: {
        summary: 'Validate a property document',
        description:
          'Validates a property legal document (title deed, survey plan, etc.) using ML checks including OCR, authenticity, and template matching. Admin access required.',
        operationId: 'validateDocument',
        tags: ['Admin - Validation'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/DocumentValidationRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Document validation completed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DocumentValidationResponse' },
              },
            },
          },
          400: {
            description: 'Invalid request (missing fields, invalid file format, file too large)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          401: {
            description: 'Unauthorized - User not authenticated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          403: {
            description: 'Forbidden - Admin access required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          404: {
            description: 'Property not found',
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
        },
      },
    },

    '/api/admin/validation/image': {
      post: {
        summary: 'Validate a property image',
        description:
          'Validates a property photo for deepfakes, manipulation, adult content, and image quality. Admin access required.',
        operationId: 'validateImage',
        tags: ['Admin - Validation'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/ImageValidationRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Image validation completed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ImageValidationResponse' },
              },
            },
          },
          400: {
            description: 'Invalid request (missing fields, invalid file format, file too large)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          401: {
            description: 'Unauthorized - User not authenticated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          403: {
            description: 'Forbidden - Admin access required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          404: {
            description: 'Property not found',
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
        },
      },
    },

    '/api/admin/validation/duplicates': {
      post: {
        summary: 'Check for duplicate property listings',
        description:
          'Detects duplicate or similar property listings using image similarity, location proximity, text similarity, and metadata matching. Admin access required.',
        operationId: 'checkDuplicates',
        tags: ['Admin - Validation'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DuplicateCheckRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Duplicate check completed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DuplicateCheckResponse' },
              },
            },
          },
          400: {
            description: 'Invalid request (missing fields, invalid data)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          401: {
            description: 'Unauthorized - User not authenticated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          403: {
            description: 'Forbidden - Admin access required',
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
        },
      },
    },
  },

  tags: [
    {
      name: 'Admin - Validation',
      description: 'Admin endpoints for property validation (document, image, duplicate detection)',
    },
  ],
}

export type ApiSpec = typeof apiSpec
