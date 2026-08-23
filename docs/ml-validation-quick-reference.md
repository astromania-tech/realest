# ML Validation - Quick Reference Card

**For:** RealEST Admin Developers  
**Last Updated:** May 24, 2026

---

## 🎯 Quick Start

### Using Document Validation
```typescript
// POST /api/admin/validation/document
const formData = new FormData()
formData.append('file', titleDeedPdf)
formData.append('propertyId', propertyUUID)
formData.append('documentType', 'title_deed')

const result = await fetch('/api/admin/validation/document', {
  method: 'POST',
  body: formData,
})
```

### Using Image Validation
```typescript
// POST /api/admin/validation/image
const formData = new FormData()
formData.append('file', propertyPhoto)
formData.append('propertyId', propertyUUID)
formData.append('propertyType', 'house')

const result = await fetch('/api/admin/validation/image', {
  method: 'POST',
  body: formData,
})
```

### Using Duplicate Detection
```typescript
// POST /api/admin/validation/duplicates
const result = await fetch('/api/admin/validation/duplicates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    propertyId: propertyUUID,
    images: ['url1', 'url2'],
    location: { lat: 6.5244, lng: 3.3792 },
    description: 'Modern apartment...',
    address: '123 Lekki Avenue, Lagos',
    propertyType: 'apartment',
  })
})
```

---

## 📊 Response Format

### Success Response
```json
{
  "isValid": true,
  "confidence": 0.87,
  "issues": [],
  "checks": { ... },
  "metadata": { ... }
}
```

### Error Response
```json
{
  "error": "Admin access required",
  "details": "..."
}
```

---

## 🔒 Authentication

**Required:**
- ✅ User authenticated via Supabase Auth
- ✅ User role = `admin`

**Errors:**
```json
// 401 - Not authenticated
{ "error": "Unauthorized" }

// 403 - Not admin
{ "error": "Admin access required" }

// 404 - Property not found
{ "error": "Property not found" }
```

---

## 📋 Confidence Levels

```
0.95-1.0  ✅ Excellent  (approve)
0.85-0.94 ✅ Good       (likely approve)
0.65-0.84 ⚠️ Fair       (review)
0.50-0.64 ❌ Low        (likely reject)
< 0.50    ❌ Very Low   (reject)
```

---

## 🎯 File Limits

| Type | Format | Max Size |
|------|--------|----------|
| Document | PDF, JPEG, PNG | 20MB |
| Image | JPEG, PNG, WebP | 10MB |

---

## 📝 Document Types

```typescript
'title_deed'
'survey_plan'
'certificate_of_occupancy'
'building_permit'
'purchase_receipt'
'allocation_letter'
'deed_of_assignment'
'power_of_attorney'
'lease_agreement'
'proof_of_payment'
```

---

## 🏘️ Property Types (Nigerian Market)

```typescript
'house'              // Standard house
'apartment'          // Multi-story apartment
'bq'                // Boys Quarters
'self_contained'    // Self-contained unit
'face_me_i_face_you' // Face me I face you
'office'            // Commercial office
'shop'              // Retail shop
'warehouse'         // Storage/warehouse
'land'              // Bare land
'commercial'        // Commercial property
```

---

## 🔄 Integration with ML Queue

```
1. Property submitted
   ↓
2. GET /api/admin/validation/ml
   (Lists pending properties)
   ↓
3. Admin validates:
   - POST /api/admin/validation/document (files)
   - POST /api/admin/validation/image (photos)
   - POST /api/admin/validation/duplicates (check dupes)
   ↓
4. POST /api/admin/validation/ml/[propertyId]
   (Status update with action: approve/reject/flag)
   ↓
5. Property moves to next status
```

---

## 🧪 Test Data

### Sample Document
```
POST /api/admin/validation/document
FormData:
  file: title_deed.pdf (20KB)
  propertyId: 550e8400-e29b-41d4-a716-446655440000
  documentType: title_deed
```

### Sample Image
```
POST /api/admin/validation/image
FormData:
  file: property.jpg (2MB)
  propertyId: 550e8400-e29b-41d4-a716-446655440000
  propertyType: house
```

### Sample Duplicate Check
```
POST /api/admin/validation/duplicates
JSON:
{
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "images": [],
  "location": { "lat": 6.5244, "lng": 3.3792 },
  "description": "Beautiful 3-bedroom house",
  "address": "123 Lekki, Lagos",
  "propertyType": "house"
}
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Login as admin user |
| 403 Admin access required | User role must be 'admin' |
| 404 Property not found | Verify property UUID exists |
| 400 Invalid file format | Check file type (PDF/JPEG/PNG) |
| 400 File size exceeds limit | Compress file to under limit |
| 500 Server error | Check server logs |

---

## 📚 Full Documentation

- **Complete Guide:** `/docs/ml-validation-flow.md`
- **Type Definitions:** `/lib/types/validation.ts`
- **Implementation:** `/app/api/admin/validation/*/route.ts`
- **Checklist:** `/docs/ml-validation-implementation-checklist.md`

---

## 🔗 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/validation/document` | Validate document |
| POST | `/api/admin/validation/image` | Validate image |
| POST | `/api/admin/validation/duplicates` | Check duplicates |
| GET | `/api/admin/validation/ml` | List queue (existing) |
| POST | `/api/admin/validation/ml/[id]` | Update status (existing) |

---

## 💡 Pro Tips

1. **Always check confidence score** before making decisions
2. **Review issues list** for context on validation result
3. **Check audit log** for validation history
4. **Use duplicate detection early** to catch duplicates
5. **Document rejections** with notes for user feedback

---

**Last Updated:** May 24, 2026  
**Status:** ✅ Production Ready
