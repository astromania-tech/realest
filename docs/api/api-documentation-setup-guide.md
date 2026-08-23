# API Documentation Integration Guide

**For:** RealEST Development Team  
**Setup Date:** May 24, 2026  
**Status:** ✅ Ready to Use

---

## 🚀 What Just Got Set Up

We've integrated **automated API documentation** into your project with:

1. ✅ **Interactive Swagger UI** - Test APIs from browser
2. ✅ **OpenAPI 3.0 Spec** - Machine-readable spec
3. ✅ **Postman Integration** - Export and test in Postman
4. ✅ **Auto-Generated Docs** - No manual updates needed
5. ✅ **Full Type Documentation** - Request/response schemas

---

## 📖 How to Use (Quick Start)

### 1. **View API Docs in Browser**
```bash
npm run dev
# Then open: http://localhost:3000/api-docs
```
✅ You'll see interactive Swagger UI where you can:
- Read endpoint documentation
- See request/response formats
- Try API calls directly
- Download spec as JSON

### 2. **Use in Postman**
```bash
npm run api:spec
# This creates: openapi.json

# Then in Postman:
# File → Import → openapi.json
```
✅ All endpoints auto-imported with:
- Request templates
- Parameter descriptions
- Response examples

### 3. **Test via Command Line**
```bash
# Get your JWT token first (from browser localStorage)
export TOKEN="your_supabase_jwt"

# Test document validation
curl -X POST http://localhost:3000/api/admin/validation/document \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@document.pdf" \
  -F "propertyId=550e8400-e29b-41d4-a716-446655440000" \
  -F "documentType=title_deed"
```

---

## 🔧 What's Behind the Scenes

### New Files Created

```
lib/swagger.ts
├─ OpenAPI spec definition
└─ All endpoint documentation

app/api-docs/
├─ page.tsx (Swagger UI page)
└─ layout.tsx (layout wrapper)

app/api/spec/
└─ route.ts (JSON spec endpoint)

scripts/export-openapi-spec.js
└─ Export spec to openapi.json for Postman

docs/api-documentation.md
└─ User-facing documentation
```

### New npm Scripts

```bash
npm run api:spec    # Export spec to openapi.json
npm run api:docs    # Show API docs URL
```

---

## 📚 Documented Endpoints (Currently 3)

### ✅ Document Validation
```
POST /api/admin/validation/document
├─ Validates property legal documents
├─ Checks: authenticity, fields, template, watermark
└─ Returns: confidence score + issues list
```

### ✅ Image Validation  
```
POST /api/admin/validation/image
├─ Validates property photos
├─ Checks: deepfake, manipulation, content, quality
└─ Returns: confidence score + content flags
```

### ✅ Duplicate Detection
```
POST /api/admin/validation/duplicates
├─ Detects duplicate/similar listings
├─ Checks: image, location, text, metadata similarity
└─ Returns: matched properties + confidence
```

---

## 🎯 Common Workflows

### Workflow 1: Testing a New Endpoint

**Step 1:** Add documentation in `lib/swagger.ts`
```typescript
paths: {
  '/api/your/endpoint': {
    post: {
      tags: ['Category'],
      summary: 'What it does',
      description: 'Full description',
      requestBody: { /* schema */ },
      responses: { /* responses */ }
    }
  }
}
```

**Step 2:** Regenerate and export
```bash
npm run api:spec
```

**Step 3:** Test in Swagger UI
```
http://localhost:3000/api-docs
# Your new endpoint appears here
```

**Step 4:** Import to Postman
```bash
npm run api:spec
# Re-import openapi.json in Postman
```

---

### Workflow 2: Share API Spec with Team

**Option A: Via Swagger UI**
```
Send link: http://your-production-domain.com/api-docs
Everyone can view interactive docs
```

**Option B: Via JSON Spec**
```bash
npm run api:spec
# Commit openapi.json to git
# Team members can import or view
```

**Option C: Via Postman**
```bash
npm run api:spec
# Share openapi.json or Postman collection
# Team imports directly
```

---

### Workflow 3: Debug API Issues

**In Swagger UI:**
1. Navigate to endpoint
2. Click **"Try it out"**
3. Fill in test data
4. Click **"Execute"**
5. See response (success/error)

**In Postman:**
1. Select endpoint from collection
2. Fill in parameters
3. Click **"Send"**
4. View response + timing

**Via curl:**
```bash
export TOKEN=$(
  curl -X POST "https://xxx.supabase.co/auth/v1/token?grant_type=password" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@realest.ng","password":"password"}' | jq -r '.access_token'
)

curl -X POST http://localhost:3000/api/admin/validation/document \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.pdf" \
  -F "propertyId=550e8400-e29b-41d4-a716-446655440000" \
  -F "documentType=title_deed"
```

---

## 🔐 Authentication in Documentation

### In Swagger UI
```
1. Click "Authorize" button (top right)
2. Paste your JWT token
3. Click "Authorize"
4. Now try endpoints - token auto-included
```

### In Postman
```
1. Create environment variable: TOKEN
2. Set value to your JWT token
3. In each request, add header:
   Authorization: Bearer {{TOKEN}}
4. Environment automatically substitutes value
```

### Getting JWT Token (Dev)
```javascript
// In browser console after logging in:
localStorage.getItem('supabase.auth.token')
// Copy the token value
```

---

## 🧪 Testing Checklist

- [ ] View docs: http://localhost:3000/api-docs
- [ ] See all 3 endpoints documented
- [ ] Try endpoint in Swagger UI (with token)
- [ ] Export spec: `npm run api:spec`
- [ ] Import openapi.json into Postman
- [ ] Test endpoint in Postman (with token)
- [ ] Verify request/response matches documentation
- [ ] Check error responses (401, 403, 404, 500)

---

## ⚙️ Configuration

### Server URL in Spec
```typescript
// Default: uses NEXT_PUBLIC_API_URL or localhost:3000
servers: [
  {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    description: 'API Server'
  }
]
```

### For Production
Set in `.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://your-production-domain.com
```

---

## 🔄 Maintenance

### When You Add a New Endpoint

1. **Document in code** (`lib/swagger.ts`)
   ```typescript
   paths: {
     '/api/new/endpoint': {
       post: {
         tags: ['NewFeature'],
         summary: '...',
         requestBody: { ... },
         responses: { ... }
       }
     }
   }
   ```

2. **Export spec**
   ```bash
   npm run api:spec
   ```

3. **Commit to git**
   ```bash
   git add openapi.json lib/swagger.ts
   git commit -m "docs: add new endpoint documentation"
   ```

4. **Share with team**
   ```bash
   # Via version control - just pull latest
   # Or re-import openapi.json in Postman
   ```

---

## 📊 Real-World Example: Full Workflow

### Scenario: Testing Document Validation

**Step 1: Open Swagger UI**
```
http://localhost:3000/api-docs
```

**Step 2: Find endpoint**
```
Click: POST /api/admin/validation/document
```

**Step 3: Authorize**
```
Click "Authorize" → Paste JWT → Click "Authorize"
```

**Step 4: Fill test data**
```
file: (upload title_deed.pdf)
propertyId: 550e8400-e29b-41d4-a716-446655440000
documentType: title_deed
```

**Step 5: Execute**
```
Click "Execute"
See response:
{
  "isValid": true,
  "confidence": 0.87,
  "checks": { ... },
  "issues": []
}
```

**Step 6: In Postman (optional)**
```
$ npm run api:spec
# Import openapi.json into Postman
# Select endpoint from collection
# Same test data, same result
```

---

## 🎓 Key Concepts

### OpenAPI 3.0
- Industry standard for API documentation
- Machine-readable (JSON/YAML)
- Supports all HTTP methods, parameters, schemas
- Can generate code, docs, tests from spec

### Swagger UI
- Interactive web interface for OpenAPI specs
- Try endpoints directly from browser
- See request/response examples
- Authentication/token management built-in

### Postman
- API testing and development tool
- Can import OpenAPI specs
- Great for team collaboration
- Run tests, scripts, automations

---

## ❓ FAQ

**Q: Do I need to manually update documentation?**  
A: Only in `lib/swagger.ts`. Everything else auto-generates.

**Q: Can I test without a token?**  
A: No, all documented endpoints require admin JWT token.

**Q: How do I get authentication working in Postman?**  
A: Create environment variable `TOKEN` = your JWT, then use `Authorization: Bearer {{TOKEN}}` header.

**Q: Can I commit openapi.json to git?**  
A: Yes! Recommended so team has version-controlled spec.

**Q: What if I add a new endpoint?**  
A: Add documentation in `lib/swagger.ts`, run `npm run api:spec`, re-import in Postman.

---

## 🚀 Next Steps

1. ✅ View docs: `npm run dev` → http://localhost:3000/api-docs
2. ✅ Export spec: `npm run api:spec`
3. ✅ Import into Postman (if using Postman)
4. ✅ Test endpoints with real data
5. ✅ Share spec with team
6. ✅ Use for future development

---

## 📞 Support

- **Swagger UI Issues:** Check server is running on port 3000
- **Postman Import Issues:** Re-run `npm run api:spec` and try again
- **Authentication Issues:** Verify JWT token is valid and not expired
- **Documentation Issues:** Update `lib/swagger.ts` and regenerate

---

**Setup Complete!** 🎉  
Your API is now fully documented and ready for testing.
