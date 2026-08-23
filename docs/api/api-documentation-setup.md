# RealEST API Documentation Guide

**Last Updated:** May 24, 2026  
**Status:** ✅ Live at `/docs`

---

## 🚀 Quick Start

### View Interactive Documentation
1. Start the dev server: `npm run dev`
2. Open browser: http://localhost:3000/docs
3. You'll see the **Swagger UI** with all endpoints

### Get OpenAPI Spec
```bash
# View spec in browser
curl http://localhost:3000/api/docs/openapi.json

# Export to file
npm run docs:openapi
```

---

## 📚 What's Documented

### Validation Endpoints (3)

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `POST /api/admin/validation/document` | Validate property documents | ✅ Admin |
| `POST /api/admin/validation/image` | Validate property images | ✅ Admin |
| `POST /api/admin/validation/duplicates` | Detect duplicate listings | ✅ Admin |

### Features Included

✅ **Interactive Testing**
- Try endpoints directly from Swagger UI
- No need for Postman or curl

✅ **Complete Specifications**
- Request/response schemas
- Error codes and messages
- Nigerian property types & document types
- Authentication requirements

✅ **Type Safety**
- All schemas defined in `lib/openapi/spec.ts`
- Request validation
- Response documentation

---

## 🎯 Using Swagger UI

### 1. **View Endpoint Details**
```
Click any endpoint → See full documentation
├── Description
├── Parameters
├── Request body schema
├── Response examples
└── Error codes
```

### 2. **Test an Endpoint**
```
1. Click "Try it out" button
2. Enter parameter values
3. Click "Execute"
4. See response + curl command
```

### 3. **Authenticate**
```
1. Click "Authorize" button (top right)
2. Enter Supabase JWT token
3. All subsequent requests use this token
4. Required for admin endpoints
```

---

## 🔐 Authentication

All validation endpoints require **admin access**:

```bash
# Get your JWT token from Supabase
curl -X POST "https://your-supabase-project.supabase.co/auth/v1/token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@realest.ng",
    "password": "your-password",
    "grant_type": "password"
  }'

# Then in Swagger UI:
# 1. Click "Authorize"
# 2. Paste the token
# 3. Click "Authorize" 
# 4. Click "Close"
```

---

## 📋 Endpoint Examples

### Document Validation

**Request:**
```bash
POST /api/admin/validation/document
Content-Type: multipart/form-data

file: title_deed.pdf
propertyId: 550e8400-e29b-41d4-a716-446655440000
documentType: title_deed
```

**Response:**
```json
{
  "isValid": true,
  "confidence": 0.87,
  "documentType": "title_deed",
  "issues": [],
  "checks": {
    "isAuthentic": true,
    "hasRequiredFields": true,
    "matchesTemplate": true,
    "hasWatermark": false,
    "textQuality": 0.92
  },
  "metadata": {
    "fileSize": 1024000,
    "uploadedAt": "2026-05-24T10:30:00Z",
    "fileName": "title_deed.pdf"
  }
}
```

### Image Validation

**Request:**
```bash
POST /api/admin/validation/image
Content-Type: multipart/form-data

file: property.jpg
propertyId: 550e8400-e29b-41d4-a716-446655440000
propertyType: house
```

**Response:**
```json
{
  "isValid": true,
  "confidence": 0.91,
  "issues": [],
  "checks": {
    "isRealPhoto": true,
    "isManipulated": false,
    "hasAdultContent": false,
    "hasPropertyContent": true,
    "qualityScore": 0.89
  },
  "metadata": {
    "fileSize": 2048000,
    "uploadedAt": "2026-05-24T10:30:00Z",
    "fileName": "property.jpg",
    "dimensions": "1920x1080"
  }
}
```

### Duplicate Detection

**Request:**
```bash
POST /api/admin/validation/duplicates
Content-Type: application/json

{
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "images": ["url1", "url2"],
  "location": { "lat": 6.5244, "lng": 3.3792 },
  "description": "Beautiful 3-bedroom house with pool",
  "address": "123 Lekki Avenue, Lagos",
  "propertyType": "house"
}
```

**Response:**
```json
{
  "isDuplicate": true,
  "confidence": 0.92,
  "matchedProperties": [
    {
      "propertyId": "550e8400-e29b-41d4-a716-446655440001",
      "similarityScore": 0.95,
      "matchType": "combined",
      "address": "124 Lekki Avenue, Lagos"
    }
  ],
  "checks": {
    "imageSimilarity": 0.93,
    "locationProximity": 0.98,
    "textSimilarity": 0.87,
    "metadataSimilarity": 0.85
  },
  "metadata": {
    "checkedAt": "2026-05-24T10:30:00Z",
    "matchCount": 1
  }
}
```

---

## 🛠️ Integration with Other Tools

### Export to Postman

```bash
# 1. Get OpenAPI spec
curl http://localhost:3000/api/docs/openapi.json > openapi.json

# 2. In Postman:
#    File → Import → Select openapi.json
#    Collections tab → All endpoints imported
```

### Generate Client Code

```bash
# Using Swagger Codegen
swagger-codegen generate -i http://localhost:3000/api/docs/openapi.json \
  -l typescript-axios \
  -o ./generated-client

# Using openapi-generator
npx @openapitools/openapi-generator-cli@latest generate \
  -i http://localhost:3000/api/docs/openapi.json \
  -g typescript-axios \
  -o ./generated-client
```

### Create TypeScript Client

```typescript
// Use generated types from openapi.json
import { DocumentValidationResponse, ImageValidationResponse } from './generated-client'

const validateDoc = async (file: File): Promise<DocumentValidationResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('propertyId', propertyId)
  formData.append('documentType', 'title_deed')

  const response = await fetch('/api/admin/validation/document', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  return response.json()
}
```

---

## 🔄 API Changes & Versioning

### Current Version
- **API Version:** 1.0.0
- **OpenAPI Spec:** 3.0.0
- **Last Updated:** May 24, 2026

### File Locations
- **Spec Definition:** `lib/openapi/spec.ts`
- **Docs UI:** `app/docs/page.tsx`
- **OpenAPI Endpoint:** `app/api/docs/openapi.json/route.ts`

### Keeping Docs Updated

When adding new endpoints:

1. **Update the spec:** Edit `lib/openapi/spec.ts`
2. **Add path definition** with request/response schemas
3. **Docs auto-update** at next server restart
4. **No rebuild needed** for development

---

## 📖 Documentation Files

### API Documentation
- **Main Reference:** `docs/ml-validation-flow.md` (1,500+ lines)
- **Quick Reference:** `docs/ml-validation-quick-reference.md`
- **Implementation:** `docs/ml-validation-implementation-checklist.md`

### This Guide
- **Location:** `docs/api-documentation-setup.md`
- **Topic:** Swagger UI setup and usage

---

## ⚙️ Configuration

### Swagger UI Settings

**File:** `app/docs/page.tsx`

```typescript
<SwaggerUI
  url="/api/docs/openapi.json"
  defaultModelsExpandDepth={2}      // Expand 2 levels of schemas
  persistAuthorization={true}       // Remember auth token
  presets={undefined}               // Use default presets
  plugins={undefined}               // Use default plugins
  layout="StandaloneLayout"         // Full-page layout
/>
```

### Custom Styling

**File:** `app/docs/layout.tsx`

```css
/* Override Swagger UI colors to match RealEST theme */
--color-border: var(--border);
--color-text: var(--foreground);
--color-bg: var(--background);
--color-primary: var(--primary);
```

---

## 🐛 Troubleshooting

### Issue: "Authorization not working"
**Solution:** Make sure token includes `"Authorization: Bearer <token>"` header

### Issue: "CORS errors when testing"
**Solution:** Swagger UI runs on same origin, CORS should work. Check browser console.

### Issue: "File upload not working"
**Solution:** Use multipart/form-data for document/image endpoints, not JSON

### Issue: "Docs page is blank"
**Solution:** Ensure dev server is running and `/api/docs/openapi.json` is accessible

---

## 📞 Support

For API-related questions:
- Check `docs/ml-validation-flow.md` for implementation details
- Review `docs/ml-validation-quick-reference.md` for common tasks
- Test directly in Swagger UI at `/docs`

---

## 🎓 Learning Resources

### OpenAPI Standard
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)

### Next.js Integration
- [next-swagger-doc GitHub](https://github.com/DidierHLe/next-swagger-doc)
- [API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

### TypeScript Types
- See `lib/types/validation.ts` for full type definitions
- See `lib/openapi/spec.ts` for OpenAPI schemas

---

**Status:** ✅ Active  
**Last Tested:** May 24, 2026  
**Next Phase:** ML service integration + custom models
