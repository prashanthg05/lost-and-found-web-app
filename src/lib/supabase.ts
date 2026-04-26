import { createClient } from '@supabase/supabase-js'

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

if (supabaseUrl === 'your_project_url_here' || !supabaseUrl.startsWith('http')) {
  supabaseUrl = 'https://placeholder.supabase.co'
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
