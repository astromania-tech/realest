# ML Validation Flow - Complete Implementation Guide

**Created:** May 24, 2026  
**Status:** COMPLETE - Ready for ML service integration  
**Version:** 1.0.0

---

## 🎯 Overview

The **ML Validation Flow** is a complete system for validating property listings using machine learning. It consists of three primary validation endpoints that work together to verify:

1. **Document Authenticity** - Property legal documents (title deeds, survey plans, etc.)
2. **Image Validity** - Property photos (real vs AI-generated, manipulation detection)
3. **Duplicate Detection** - Identifying duplicate or similar listings

---

## 📁 File Structure

```
app/api/admin/validation/
├── document/
│   └── route.ts          ← Document validation endpoint
├── image/
│   └── route.ts          ← Image validation endpoint
├── duplicates/
│   ├── route.ts          ← Duplicate detection endpoint
│   └── [id]/
│       └── resolve/      ← Existing duplicate resolution
├── ml/
│   ├── route.ts          ← ML validation queue (existing)
│   └── [id]/
│       └── route.ts      ← ML validation status update (existing)
└── vetting/
    └── ...               ← Human vetting (existing)
```

---

## 🔄 Validation Flow Diagram

```
Property Submission
    ↓
[1] ML Validation Queue (/admin/validation/ml)
    ├─ List pending properties
    └─ Track validation status
    ↓
[2] Parallel Validations
    ├─→ Document Validation (/admin/validation/document) ← POST file
    ├─→ Image Validation (/admin/validation/image) ← POST file
    └─→ Duplicate Check (/admin/validation/duplicates) ← POST JSON
    ↓
[3] Confidence Scoring
    └─ Aggregate results (Lowest-Link Principle)
    ↓
[4] Admin Decision
    ├─ Approve → Pending Vetting
    ├─ Reject → Rejected
    └─ Flag → Pending Duplicate Review
    ↓
[5] Human Vetting (/admin/validation/vetting)
    ↓
Final Status (Published / Rejected)
```

---

## 🔐 Authentication & Authorization

All three endpoints require:
- ✅ User authenticated via Supabase Auth
- ✅ User role = `admin`
- ✅ Audit log created for all actions

**Error Responses:**
```json
// Unauthorized
{ "error": "Unauthorized" }  // 401

// Not admin
{ "error": "Admin access required" }  // 403

// Not found
{ "error": "Property not found" }  // 404

// Invalid request
{ "error": "Invalid request", "details": [...] }  // 400

// Server error
{ "error": "Validation failed", "details": "..." }  // 500
```

---

## 📊 API Endpoints

### 1. Document Validation

**Endpoint:** `POST /api/admin/validation/document`

**Request:** FormData
```javascript
const formData = new FormData()
formData.append('file', fileInput.files[0])  // PDF, JPEG, PNG
formData.append('propertyId', 'uuid-here')
formData.append('documentType', 'title_deed')  // Optional

const response = await fetch('/api/admin/validation/document', {
  method: 'POST',
  body: formData,
})
```

**Response:** DocumentValidationResult
```typescript
{
  isValid: boolean,
  confidence: number,  // 0.0-1.0
  documentType: string | null,  // 'title_deed', 'survey_plan', etc.
  extractedText: string,  // OCR output
  issues: string[],
  metadata: {
    pageCount?: number,
    size: number,
    format: string,  // 'pdf', 'jpeg', 'png'
  },
  checks: {
    isAuthentic: boolean,
    hasRequiredFields: boolean,
    matchesTemplate: boolean,
    hasWatermark: boolean,
    textQuality: number,  // 0.0-1.0
  }
}
```

**Status Codes:**
- `200` - Validation complete
- `400` - Invalid request (missing file, invalid property ID)
- `401` - Not authenticated
- `403` - Not admin
- `404` - Property not found
- `500` - Server error

---

### 2. Image Validation

**Endpoint:** `POST /api/admin/validation/image`

**Request:** FormData
```javascript
const formData = new FormData()
formData.append('file', fileInput.files[0])  // JPEG, PNG, WebP
formData.append('propertyId', 'uuid-here')
formData.append('propertyType', 'house')  // Optional

const response = await fetch('/api/admin/validation/image', {
  method: 'POST',
  body: formData,
})
```

**Response:** ImageValidationResult
```typescript
{
  isValid: boolean,
  confidence: number,  // 0.0-1.0
  issues: string[],
  metadata: {
    width?: number,
    height?: number,
    format?: string,
    size?: number,
    hasExif?: boolean,
    location?: { lat: number; lng: number } | null,
  },
  checks: {
    isRealPhoto: boolean,
    isManipulated: boolean,
    hasAdultContent: boolean,
    hasPropertyContent: boolean,
    qualityScore: number,  // 0.0-1.0
  }
}
```

**Checks Explained:**
- `isRealPhoto` - Detects AI-generated or stock photos
- `isManipulated` - Detects image editing/forgery
- `hasAdultContent` - Detects inappropriate content
- `hasPropertyContent` - Confirms image is a property photo
- `qualityScore` - Overall image quality (0.0-1.0)

---

### 3. Duplicate Detection

**Endpoint:** `POST /api/admin/validation/duplicates`

**Request:** JSON
```javascript
const response = await fetch('/api/admin/validation/duplicates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    propertyId: 'uuid-here',
    images: ['https://...', 'https://...'],  // Optional
    location: {
      lat: 6.5244,
      lng: 3.3792,
    },
    description: 'Modern apartment with excellent facilities...',
    address: '123 Lekki Avenue, Lagos',
    propertyType: 'apartment',  // Optional
  })
})
```

**Response:** DuplicateCheckResult
```typescript
{
  isDuplicate: boolean,
  confidence: number,  // 0.0-1.0
  matchedProperties: [
    {
      id: string,
      title: string,
      address: string,
      similarityScore: number,  // 0.0-1.0
      matchType: 'image' | 'location' | 'description' | 'combined',
      details: string,
    }
  ],
  checks: {
    imageSimilarity: number,      // 0.0-1.0
    locationProximity: number,    // 0.0-1.0
    textSimilarity: number,       // 0.0-1.0
    metadataSimilarity: number,   // 0.0-1.0
  }
}
```

**Confidence Thresholds:**
- `imageSimilarity > 0.85` → Match found
- `locationProximity > 0.9` → Within 50 meters
- `textSimilarity > 0.8` → Similar description
- `metadataSimilarity > 0.75` → Similar features

---

## 🧠 Confidence Scoring (Lowest-Link Principle)

Each endpoint uses **Local Confidence Scoring (LCS)** for sub-checks and calculates a **Global Confidence Score (GCS)** as the minimum:

```
GCS = MIN(all individual check scores)
```

This ensures the overall confidence is limited by the weakest component.

**Example - Document Validation:**
```
Authenticity check:    0.95
Required fields check: 0.85
Template match:        0.92
Watermark check:       0.78 ← Weakest link
Text quality:          0.88

GCS = MIN(0.95, 0.85, 0.92, 0.78, 0.88) = 0.78
```

**Validation Rules:**
- `GCS > 0.85` → Likely valid, approve
- `GCS 0.65-0.85` → Requires manual review
- `GCS < 0.65` → Likely invalid, reject

---

## 🤖 ML Service Integration

### Currently: Placeholder Implementation

All validation endpoints include **simulated ML checks** using `Math.random()` for demonstration.

### To-Do: Real ML Services

Replace placeholders with actual ML services:

#### Document Validation
```typescript
// TODO: Implement these services
const ocr = await callOCRService(buffer)  // Tesseract, AWS Textract, Google Vision
const authenticity = await checkAuthenticity(buffer)  // Custom model
const templateMatch = await matchTemplate(buffer, expectedType)  // Document classifier
const watermark = await detectWatermark(buffer)  // Image processing
```

**Recommended Services:**
- **OCR:** Tesseract (open-source), AWS Textract, Google Vision API
- **Authenticity:** Custom ML model trained on property documents
- **Template Matching:** Document type classifier (SVM, Random Forest, or Neural Network)
- **Watermark:** Image processing library (OpenCV, Pillow)

#### Image Validation
```typescript
// TODO: Implement these services
const isRealPhoto = await detectDeepfake(buffer)  // Deepfake detection
const isManipulated = await detectManipulation(buffer)  // Image forensics
const adultContent = await filterAdultContent(buffer)  // Content moderation
const propertyContent = await classifyPropertyImage(buffer)  // Image classification
const qualityScore = await assessImageQuality(buffer)  // Quality metric
```

**Recommended Services:**
- **Deepfake Detection:** Meta Deepfake Detection API, AWS Rekognition, Google Vision
- **Manipulation:** FotoForensics, InVID, or custom ML model
- **Adult Content:** AWS Rekognition, Google Vision, Clarifai
- **Property Classification:** Custom model trained on property images
- **Quality:** Image processing (sharpness, brightness, resolution)

#### Duplicate Detection
```typescript
// TODO: Implement these services
const imageSim = await computeImageSimilarity(images)  // Image hashing/embeddings
const locProx = await queryGeospatial(location)  // PostGIS
const textSim = await computeTextSimilarity(description)  // Sentence transformers
const metaSim = await matchMetadata(propertyData)  // Feature comparison
```

**Recommended Services:**
- **Image Similarity:** SIFT/SURF features, Deep learning embeddings (ResNet)
- **Location Proximity:** PostGIS (already in Supabase), geohashing
- **Text Similarity:** Sentence-transformers (HuggingFace), BERT embeddings
- **Metadata:** Feature comparison, hashing

---

## 🔄 Workflow Examples

### Example 1: Complete Document Validation

```bash
# 1. Upload property with documents
POST /api/properties
→ property.id = "prop-123"
→ property.status = "pending_ml_validation"

# 2. List pending validations
GET /api/admin/validation/ml
→ Returns property pending ML validation

# 3. Admin clicks "Validate Document"
POST /api/admin/validation/document
→ Body: { propertyId: "prop-123", file: title_deed.pdf }
→ Response: { isValid: true, confidence: 0.87, ... }

# 4. Admin clicks "Validate Images"
POST /api/admin/validation/image
→ Body: { propertyId: "prop-123", file: photo1.jpg }
→ Response: { isValid: true, confidence: 0.92, ... }

# 5. Admin checks for duplicates
POST /api/admin/validation/duplicates
→ Body: { propertyId: "prop-123", location: {...}, description: "..." }
→ Response: { isDuplicate: false, confidence: 0.15, ... }

# 6. Admin makes decision
POST /api/admin/validation/ml/prop-123
→ Body: { action: "approve", ml_confidence_score: 0.87 }
→ property.status = "pending_vetting"
```

---

## 📊 Database Integration

### Properties Table
```sql
properties {
  id: UUID
  status: ENUM ('pending_ml_validation', 'pending_vetting', 'published', 'rejected', ...)
  ml_confidence_score: FLOAT  -- GCS from ML validation
  ml_validation_notes: TEXT
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

### Audit Log
```sql
admin_audit_log {
  id: UUID
  actor_id: UUID  -- Admin user ID
  action: STRING  -- 'document_validation', 'image_validation', 'duplicate_check'
  target_id: UUID  -- Property ID
  metadata: JSONB  -- Validation details
  created_at: TIMESTAMP
}
```

---

## ✅ Validation Checklist

Before deploying to production:

- [ ] All three endpoints created (document, image, duplicates)
- [ ] Admin authentication working
- [ ] Audit logging configured
- [ ] Error handling implemented
- [ ] Type safety verified (strict TypeScript)
- [ ] Database integration tested
- [ ] ML services selected (or mock implemented)
- [ ] Confidence thresholds tuned for Nigerian market
- [ ] Documentation complete
- [ ] Integration tests passing
- [ ] Admin dashboard updated to use endpoints
- [ ] User feedback for validation rejections
- [ ] Monitoring/alerting configured

---

## 🚀 Deployment Checklist

1. **Environment Variables**
   ```bash
   # .env.local
   ML_SERVICE_API_KEY=...
   ML_SERVICE_ENDPOINT=...
   OCR_SERVICE_KEY=...
   ```

2. **Database Migrations**
   ```bash
   # Ensure ml_confidence_score column exists
   ALTER TABLE properties ADD COLUMN ml_confidence_score FLOAT
   ALTER TABLE properties ADD COLUMN ml_validation_notes TEXT
   ```

3. **Test with Admin User**
   ```bash
   # 1. Create admin test user
   # 2. Upload test property
   # 3. Test each validation endpoint
   # 4. Verify audit logs
   ```

4. **Monitor Performance**
   - Track validation latency
   - Monitor ML service API usage
   - Alert on validation failures
   - Log confidence score distribution

---

## 🔗 Related Documentation

- **ML Validation Queue:** `/api/admin/validation/ml` - Lists pending properties
- **ML Validation Update:** `/api/admin/validation/ml/[id]` - Updates status after validation
- **Duplicate Resolution:** `/api/admin/validation/duplicates/[id]/resolve` - Handles duplicate conflicts
- **Human Vetting:** `/api/admin/validation/vetting` - Final human review

---

## 📝 Next Steps

1. **Phase 1:** Test endpoints with placeholder ML (current state)
2. **Phase 2:** Integrate real ML services
3. **Phase 3:** Train custom models for Nigerian property documents
4. **Phase 4:** Optimize confidence thresholds based on real data
5. **Phase 5:** Add admin dashboard UI for validation workflow

---

**Status:** ✅ Implementation complete. Ready for ML service integration.
