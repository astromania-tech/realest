#!/usr/bin/env node

/**
 * API Endpoint Documentation Scaffolder
 * 
 * Usage:
 *   npm run scaffold:endpoint -- --name=myEndpoint --category=Admin --method=POST
 * 
 * Example:
 *   npm run scaffold:endpoint -- --name=approveProperty --category="Admin - Properties" --method=POST
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Parse arguments
const args = process.argv.slice(2)
const params = {}

args.forEach((arg) => {
  const [key, value] = arg.replace(/^--/, '').split('=')
  params[key] = value
})

const { name, category = 'API', method = 'POST' } = params

if (!name) {
  console.error('❌ Error: --name is required')
  console.error('Usage: npm run scaffold:endpoint -- --name=myEndpoint --category="My Category" --method=POST')
  process.exit(1)
}

// Convert name to different formats
const camelCase = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')
const pascalCase = camelCase.replace(/\s+/g, '')
const kebabCase = name.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '')
const snakeCase = kebabCase.replace(/-/g, '_')

console.log(`\n📋 Scaffolding OpenAPI documentation for: ${name}\n`)
console.log(`Generated names:`)
console.log(`  • Pascal Case: ${pascalCase}`)
console.log(`  • Camel Case:  ${camelCase}`)
console.log(`  • Kebab Case:  ${kebabCase}`)
console.log(`  • Snake Case:  ${snakeCase}`)
console.log(`\n`)

// Generate the code snippets
const requestSchema = `  ${pascalCase}Request: {
    type: 'object',
    description: 'Request body for ${camelCase.toLowerCase()}',
    properties: {
      // Add your properties here
      // Example:
      // propertyId: {
      //   type: 'string',
      //   format: 'uuid',
      //   description: 'Property UUID'
      // }
    },
    required: [] // Add required field names
  },`

const responseSchema = `  ${pascalCase}Response: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Whether operation succeeded'
      },
      data: {
        type: 'object',
        description: 'Response data'
      },
      message: {
        type: 'string',
        description: 'Response message'
      }
    },
    required: ['success']
  },`

const pathDefinition = `  '/api/${kebabCase}': {
    ${method.toLowerCase()}: {
      summary: '${camelCase}',
      description: 'Detailed description of what this endpoint does',
      operationId: '${snakeCase}',
      tags: ['${category}'],
      ${method === 'GET' ? "// No requestBody for GET\n      " : "requestBody: {\n        required: true,\n        content: {\n          'application/json': {\n            schema: { \\$ref: '#/components/schemas/${pascalCase}Request' }\n          }\n        }\n      },\n      "}responses: {
        ${method === 'GET' ? "200: {\n          description: '${camelCase} retrieved successfully',\n          content: {\n            'application/json': {\n              schema: { \\$ref: '#/components/schemas/${pascalCase}Response' }\n            }\n          }\n        }," : method === 'DELETE' ? "204: {\n          description: '${camelCase} deleted successfully'\n        }," : "201: {\n          description: '${camelCase} created successfully',\n          content: {\n            'application/json': {\n              schema: { \\$ref: '#/components/schemas/${pascalCase}Response' }\n            }\n          }\n        },\n        200: {\n          description: '${camelCase} updated successfully',\n          content: {\n            'application/json': {\n              schema: { \\$ref: '#/components/schemas/${pascalCase}Response' }\n            }\n          }\n        },"}
        400: {
          description: 'Invalid request',
          content: {
            'application/json': {
              schema: { \\$ref: '#/components/schemas/Error' }
            }
          }
        },
        401: {
          description: 'Unauthorized - authentication required',
          content: {
            'application/json': {
              schema: { \\$ref: '#/components/schemas/Error' }
            }
          }
        },
        403: {
          description: 'Forbidden - insufficient permissions',
          content: {
            'application/json': {
              schema: { \\$ref: '#/components/schemas/Error' }
            }
          }
        },
        404: {
          description: 'Not found',
          content: {
            'application/json': {
              schema: { \\$ref: '#/components/schemas/Error' }
            }
          }
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: { \\$ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  }`

// Create output
const output = `
## 🎯 ${pascalCase} Endpoint

### Step 1: Add Request Schema
Add to \`lib/openapi/spec.ts\` → \`components.schemas\`:

\`\`\`typescript
${requestSchema}
\`\`\`

### Step 2: Add Response Schema
Add to \`lib/openapi/spec.ts\` → \`components.schemas\`:

\`\`\`typescript
${responseSchema}
\`\`\`

### Step 3: Add Path Definition
Add to \`lib/openapi/spec.ts\` → \`paths\`:

\`\`\`typescript
${pathDefinition}
\`\`\`

### Step 4: Test
1. Restart dev server: \`npm run dev\`
2. Visit: \`http://localhost:3000/docs\`
3. Look for \`${method} /api/${kebabCase}\` under "${category}" category
4. Click "Try it out" to test

---

**Don't forget to:**
- [ ] Add property definitions in RequestSchema
- [ ] Add security if admin-only: \`security: [{ bearerAuth: [] }]\`
- [ ] Update description with details
- [ ] Test in Swagger UI
- [ ] Commit changes together

`

console.log(output)

// Save to file
const outputPath = path.join(__dirname, '..', 'docs', `scaffold-${kebabCase}.md`)
fs.writeFileSync(outputPath, output)
console.log(`\n✅ Scaffold saved to: docs/scaffold-${kebabCase}.md`)
console.log(`\n📋 Next steps:`)
console.log(`   1. Copy the code snippets above`)
console.log(`   2. Edit lib/openapi/spec.ts`)
console.log(`   3. Add your request/response schemas to components.schemas`)
console.log(`   4. Add path definition to paths`)
console.log(`   5. npm run dev`)
console.log(`   6. Visit http://localhost:3000/docs\n`)
