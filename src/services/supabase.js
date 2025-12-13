import { createClient } from '@supabase/supabase-js'

// These will be environment variables later
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Conditional export to prevent crash if env vars are missing during dev
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
