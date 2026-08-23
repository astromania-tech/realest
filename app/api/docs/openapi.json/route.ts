import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

/**
 * GET /api/docs/openapi.json
 * Returns the generated OpenAPI 3.0 specification in JSON format
 */
export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'lib', 'openapi', 'generated.json')
    const raw = await fs.readFile(filePath, 'utf8')
    const generated = JSON.parse(raw)
    return NextResponse.json(generated, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    })
  } catch (err) {
    const details = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'Spec not found', details }, { status: 500 })
  }
}
