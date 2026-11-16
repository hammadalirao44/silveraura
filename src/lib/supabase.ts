import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const supabasePublishableKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() || '';

const isPlaceholderUrl =
  !supabaseUrl ||
  supabaseUrl.includes('YOUR_PROJECT_REF') ||
  !/^https?:\/\//i.test(supabaseUrl);

const isPlaceholderKey =
  !supabasePublishableKey ||
  supabasePublishableKey.includes('YOUR_SUPABASE_PUBLISHABLE_KEY');

export const isSupabaseConfigured = !isPlaceholderUrl && !isPlaceholderKey;

export const supabaseConfigError: string | null = !isSupabaseConfigured
  ? 'Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY) are not configured.'
  : null;

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'silver-aura-supabase-auth',
      },
    })
  : null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      supabaseConfigError ||
        'Supabase client is not initialized. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
    );
  }
  return supabase;
}
