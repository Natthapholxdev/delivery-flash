import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Warning: This should ONLY be used in Server Actions or API routes, NEVER on the client.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  )
}
