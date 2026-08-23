// lib/supabase/client.ts
// PKCE flow is required so Supabase sends ?code= instead of #access_token=
// The hash fragment (#access_token) can't be read server-side and causes
// the "requested path is invalid" error when the redirect URL is wrong.

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',              // ← switches from implicit to PKCE
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,      // picks up the ?code= on redirect
      },
    },
  );
}
