import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies, headers } from "next/headers"
import { cache } from "react"

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const headerStore = await headers()
  const authorization = headerStore.get("authorization")

  if (authorization?.startsWith("Bearer ")) {
    const bearerToken = authorization.slice("Bearer ".length)
    const client = createSupabaseClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: authorization,
        },
      },
    })

    const originalGetUser = client.auth.getUser.bind(client.auth)
    client.auth.getUser = ((jwt?: string) => originalGetUser(jwt ?? bearerToken)) as typeof client.auth.getUser

    return client
  }

  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export const getAuthUser = cache(async () => {
  const supabase = await createClient()
  return supabase.auth.getUser()
})

export const getAuthSession = cache(async () => {
  const supabase = await createClient()
  return supabase.auth.getSession()
})
