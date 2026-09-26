// @ts-nocheck
import { loadSupabaseAccessToken } from './jwt-auth.ts'

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000'
const once = process.argv.includes('--once')

async function requestJson(url, options) {
  const response = await fetch(url, options)
  const contentType = response.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json') ? await response.json() : await response.text()
  return { response, body, contentType }
}

async function main() {
  const adminToken = await loadSupabaseAccessToken({
    label: 'admin-worker',
    emailEnvNames: ['ADMIN_EMAIL', 'SUPABASE_ADMIN_EMAIL', 'REALEST_ADMIN_EMAIL'],
    passwordEnvNames: ['ADMIN_PASSWORD', 'SUPABASE_ADMIN_PASSWORD', 'REALEST_ADMIN_PASSWORD'],
    refreshTokenEnvNames: ['ADMIN_REFRESH_TOKEN', 'SUPABASE_ADMIN_REFRESH_TOKEN', 'REALEST_ADMIN_REFRESH_TOKEN'],
  })

  const headers = { Authorization: `Bearer ${adminToken}` }

  for (;;) {
    const result = await requestJson(`${baseUrl}/api/admin/validation/jobs/process`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    if (!result.response.ok) {
      const preview = typeof result.body === 'string' ? result.body.slice(0, 1024) : JSON.stringify(result.body)
      throw new Error(`Validation worker failed: ${result.response.status} ${result.response.statusText}\n${preview}`)
    }

    console.log(JSON.stringify(result.body, null, 2))

    if (result.body?.processed) {
      if (once) {
        break
      }
      continue
    }

    if (once) {
      break
    }

    await new Promise((resolve) => setTimeout(resolve, 3000))
  }
}

main().catch((error) => {
  console.error('Validation worker exited with error:', error)
  process.exit(1)
})
