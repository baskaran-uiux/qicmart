import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Helper to check if a key is just a placeholder
const isPlaceholder = (key: string | undefined) => {
  if (!key) return true
  return key.includes('your-') || key.includes('-here') || key.length < 20
}

if (!supabaseUrl || isPlaceholder(supabaseUrl) || !supabaseServiceKey || isPlaceholder(supabaseServiceKey)) {
  console.warn('⚠️ Supabase credentials missing or invalid. Media uploads will fail.')
}

export const supabase = (supabaseUrl && !isPlaceholder(supabaseUrl) && supabaseServiceKey && !isPlaceholder(supabaseServiceKey)) 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null as any
