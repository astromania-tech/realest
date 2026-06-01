import { prisma } from '@/lib/prisma'

type RequestLike = {
  url: string
  headers: Headers
  cookies?: { getAll: () => Array<{ name: string; value: string }> }
}

type Auth401Context = {
  route: string
  request: RequestLike
  authError?: string | null
}

type JwtPayload = Record<string, unknown> & {
  session_id?: string
  sub?: string
  exp?: number
  email?: string
  app_metadata?: { role?: string }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function decodeBase64Url(input: string) {
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  if (typeof token !== 'string') {
    return null
  }

  const parts = token.trim().split('.')
  if (parts.length < 2) {
    return null
  }

  try {
    return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload
  } catch {
    return null
  }
}

function getBearerToken(authorization: string | null) {
  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  const token = authorization.slice('Bearer '.length).trim()
  return token || null
}

async function findSession(sessionId: string) {
  if (!UUID_PATTERN.test(sessionId)) {
    return null
  }

  const rows = await prisma.$queryRawUnsafe<Array<{
    id: string
    user_id: string
    created_at: Date
    updated_at: Date
    refreshed_at: string | null
    not_after: Date | null
    user_agent: string | null
    ip: string | null
    tag: string | null
  }>(`
    select id, user_id, created_at, updated_at, refreshed_at, not_after, user_agent, ip, tag
    from auth.sessions
    where id = '${sessionId}'::uuid
    limit 1
  `)

  return rows[0] ?? null
}

async function findAuthUser(userId: string) {
  if (!UUID_PATTERN.test(userId)) {
    return null
  }

  const rows = await prisma.$queryRawUnsafe<Array<{
    id: string
    email: string | null
    raw_app_meta_data: unknown
    raw_user_meta_data: unknown
  }>(`
    select id, email, raw_app_meta_data, raw_user_meta_data
    from auth.users
    where id = '${userId}'::uuid
    limit 1
  `)

  return rows[0] ?? null
}

export async function logAuth401Diagnostics({ route, request, authError }: Auth401Context) {
  const authorization = request.headers.get('authorization')
  const token = getBearerToken(authorization)
  const payload = token ? decodeJwtPayload(token) : null
  const sessionId = typeof payload?.session_id === 'string' ? payload.session_id : null
  const subjectId = typeof payload?.sub === 'string' ? payload.sub : null

  let session = null
  let authUser = null

  try {
    if (sessionId) {
      session = await findSession(sessionId)
    }

    if (subjectId) {
      authUser = await findAuthUser(subjectId)
    }
  } catch (error) {
    console.warn(
      `[auth-401] ${route} diagnostics lookup failed`,
      error instanceof Error ? error.message : error,
    )
  }

  const cookieNames = request.cookies?.getAll?.().map((cookie) => cookie.name) ?? []
  const relevantCookies = cookieNames.filter((name) => /auth|supabase|session|sb-/i.test(name))

  console.warn(
    `[auth-401] ${route}`,
    JSON.stringify(
      {
        route,
        url: request.url,
        auth_error: authError ?? null,
        has_authorization_header: Boolean(authorization),
        bearer_present: Boolean(token),
        session_id: sessionId,
        token_sub: subjectId,
        token_exp: typeof payload?.exp === 'number' ? payload.exp : null,
        token_role: payload?.app_metadata?.role ?? null,
        auth_session_found: Boolean(session),
        auth_session_user_id: session?.user_id ?? null,
        auth_session_created_at: session?.created_at ?? null,
        auth_session_refreshed_at: session?.refreshed_at ?? null,
        auth_user_found: Boolean(authUser),
        auth_user_email: authUser?.email ?? null,
        auth_user_app_metadata: authUser?.raw_app_meta_data ?? null,
        auth_user_metadata: authUser?.raw_user_meta_data ?? null,
        cookie_names: relevantCookies,
      },
      null,
      2,
    ),
  )
}