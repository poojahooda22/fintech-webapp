import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

// Server-only client (service role, bypasses RLS) for seeding and ingestion.
// Never import this into a client component or anything sent to the browser.
export const supabaseAdmin =
  url && serviceRole ? createClient(url, serviceRole, { auth: { persistSession: false } }) : null
