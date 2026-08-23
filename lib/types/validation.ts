/**
 * ML Validation Type Definitions
 * 
 * Shared types for document, image, and duplicate validation endpoints
 * Used across admin validation API routes
 */

/**
 * Document Validation Result
 * Response from /api/admin/validation/document endpoint
 */
export interface DocumentValidationResult {
  isValid: boolean
  confidence: number
  documentType: string | null
  extractedText: string
  issues: string[]
  metadata: {
    pageCount?: number
    size: number
    format: string
    width?: number
    height?: number
    hasExif?: boolean
    location?: { lat: number; lng: number } | null
  }
  checks: {
    isAuthentic: boolean
    hasRequiredFields: boolean
    matchesTemplate: boolean
    hasWatermark: boolean
    textQuality: number
  }
}

/**
 * Image Validation Result
 * Response from /api/admin/validation/image endpoint
 */
export interface ImageValidationResult {
  isValid: boolean
  confidence: number
  issues: string[]
  metadata: {
    width?: number
    height?: number
    format?: string
    size?: number
    hasExif?: boolean
    location?: { lat: number; lng: number } | null
  }
  checks: {
    isRealPhoto: boolean
    isManipulated: boolean
    hasAdultContent: boolean
    hasPropertyContent: boolean
    qualityScore: number
  }
}

/**
 * Duplicate Check Result
 * Response from /api/admin/validation/duplicates endpoint
 */
export interface DuplicateCheckResult {
  isDuplicate: boolean
  confidence: number
  matchedProperties: Array<{
    id: string
    title: string
    address: string
    similarityScore: number
    matchType: 'image' | 'location' | 'description' | 'combined'
    details: string
  }>
  checks: {
    imageSimilarity: number
    locationProximity: number
    textSimilarity: number
    metadataSimilarity: number
  }
}

/**
 * ML Validation Status (from /api/admin/validation/ml)
 */
export interface MLValidationQueue {
  id: string
  title: string
  propertyType: string
  address: string
  state: string
  price: number
  priceFrequency: string
  createdAt: string
  owner: {
    fullName: string
    email: string
    phone: string
  } | null
  documentCount: number
  mediaCount: number
  mlStatus: 'pending' | 'processing' | 'completed'
  mlConfidenceScore: number | null
  hasMultipleDocuments: boolean
  isHighValue: boolean
}

/**
 * ML Validation Response (list)
 */
export interface MLValidationListResponse {
  data: MLValidationQueue[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  summary: {
    totalPending: number
    highPriority: number
    averageDocuments: number
  }
}

/**
 * ML Validation Update Request
 */
export interface MLValidationUpdateRequest {
  action: 'approve' | 'reject' | 'flag_duplicate'
  mlConfidenceScore?: number
  mlValidationNotes?: string
  adminNotes?: string
}

/**
 * ML Validation Update Response
 */
export interface MLValidationUpdateResponse {
  success: boolean
  data: {
    property: {
      id: string
      status: string
      title: string
    }
    actionTaken: string
    newStatus: string
    message: string
  }
}

/**
 * Validation Error Response
 */
export interface ValidationErrorResponse {
  error: string
  details?: string | Array<{
    code: string
    message: string
    path: string[]
  }>
}

/**
 * Audit Log Entry for validation actions
 */
export interface ValidationAuditLog {
  actorId: string
  action: 'document_validation' | 'image_validation' | 'duplicate_check' | 'ml_validation_update'
  targetId: string
  metadata: Record<string, any>
  createdAt: string
}

/**
 * Confidence Score Levels
 */
export const CONFIDENCE_LEVELS = {
  VERY_HIGH: 0.95,   // 95%+ confidence
  HIGH: 0.85,        // 85-95% confidence
  MODERATE: 0.65,    // 65-85% confidence
  LOW: 0.5,          // 50-65% confidence
  VERY_LOW: 0.0,     // 0-50% confidence
} as const

/**
 * Validation Status Enum
 */
export enum PropertyValidationStatus {
  PENDING_ML = 'pending_ml_validation',
  PENDING_VETTING = 'pending_vetting',
  PENDING_DUPLICATE_REVIEW = 'pending_duplicate_review',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

/**
 * Document Type Enum (Nigerian property documents)
 */
export enum DocumentType {
  TITLE_DEED = 'title_deed',
  SURVEY_PLAN = 'survey_plan',
  CERTIFICATE_OF_OCCUPANCY = 'certificate_of_occupancy',
  BUILDING_PERMIT = 'building_permit',
  PURCHASE_RECEIPT = 'purchase_receipt',
  ALLOCATION_LETTER = 'allocation_letter',
  DEED_OF_ASSIGNMENT = 'deed_of_assignment',
  POWER_OF_ATTORNEY = 'power_of_attorney',
  LEASE_AGREEMENT = 'lease_agreement',
  PROOF_OF_PAYMENT = 'proof_of_payment',
}

/**
 * Property Type Enum (Nigerian market)
 */
export enum PropertyType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  BQ = 'bq',  // Boys Quarters
  SELF_CONTAINED = 'self_contained',
  FACE_ME_I_FACE_YOU = 'face_me_i_face_you',
  OFFICE = 'office',
  SHOP = 'shop',
  WAREHOUSE = 'warehouse',
  LAND = 'land',
  COMMERCIAL = 'commercial',
}

/**
 * ML Service Response Interface (for integration)
 */
export interface MLServiceResponse<T> {
  success: boolean
  data: T
  error?: string
  processingTime: number
  model: string
  version: string
}

/**
 * Duplicate Match Type
 */
export type DuplicateMatchType = 'image' | 'location' | 'description' | 'combined'

/**
 * Admin Action Log
 */
export interface AdminAction {
  action: string
  targetId: string
  userId: string
  timestamp: Date
  metadata: Record<string, any>
}
