#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'

const root = process.cwd()
const appApiRoot = path.join(root, 'app', 'api')
const generatedPath = path.join(root, 'lib', 'openapi', 'generated.json')
const outputPath = path.join(root, 'scripts', 'openapi-missing.json')

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  let files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files = files.concat(await walk(full))
    else if (entry.isFile() && /route\.(ts|js|mjs)$/.test(entry.name)) files.push(full)
  }
  return files
}

function toOpenApiPath(filePath) {
  const rel = path.relative(path.join(root, 'app'), filePath).replace(/\\/g, '/')
  const withoutRoute = rel.replace(/\/route\.(ts|js|mjs)$/, '')
  return '/' + withoutRoute.replace(/index$/, '').replace(/\[([^\]]+?)\]/g, '{$1}')
}

function extractBlocks(content) {
  const re = /export\s+const\s+(openApi(GET|POST|PUT|DELETE))\b[\s\S]*?=\s*{[\s\S]*?^}\s*$/gm
  const matches = []
  let match
  while ((match = re.exec(content)) !== null) {
    const full = match[0]
    const method = match[2].toLowerCase()
    matches.push({ method, body: full })
  }
  return matches
}

function fieldValue(body, key) {
  const re = new RegExp(`${key}\\s*:\\s*(['\"])([\\s\\S]*?)\\1`)
  const m = body.match(re)
  return m ? m[2].trim() : null
}

async function main() {
  const spec = JSON.parse(await fs.readFile(generatedPath, 'utf8'))
  const discovered = []
  const files = await walk(appApiRoot)
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8')
    const pathName = toOpenApiPath(file)
    for (const block of extractBlocks(content)) {
      const method = block.method
      if (!spec.paths?.[pathName]?.[method]) {
        discovered.push({
          file,
          path: pathName,
          method,
          summary: fieldValue(block.body, 'summary') || `Auto ${method.toUpperCase()} ${pathName}`,
          description: fieldValue(block.body, 'description'),
        })
      }
    }
  }
  await fs.writeFile(outputPath, JSON.stringify(discovered, null, 2))
  console.log(`Wrote ${discovered.length} missing operations to ${path.relative(root, outputPath)}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
