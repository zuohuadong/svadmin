// Supabase client initialization

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const isDev = import.meta.env.DEV;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || (isDev ? window.location.origin : '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/** List of missing required env vars */
export const missingEnvVars: string[] = [];
if (!SUPABASE_URL) missingEnvVars.push('VITE_SUPABASE_URL');
if (!SUPABASE_ANON_KEY) missingEnvVars.push('VITE_SUPABASE_ANON_KEY');

/** Whether Supabase is properly configured with required env vars */
export const isSupabaseConfigured = missingEnvVars.length === 0;

// Only create client if configured — avoid crash on missing key
export const supabaseClient: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;
