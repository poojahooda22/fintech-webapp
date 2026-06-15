import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Read-only client (anon key, RLS-guarded public reads). Null until configured,
// so callers fall back to bundled content while the database fills.
export const supabase =
  url && anon ? createClient(url, anon, { auth: { persistSession: false } }) : null
