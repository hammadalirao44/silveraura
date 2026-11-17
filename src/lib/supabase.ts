import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

declare global {
  interface ImportMetaEnv {
    readonly SUPABASE_URL?: string;
    readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  }
}

const supabaseUrl = (import.meta.env.SUPABASE_URL as string | undefined)?.trim() || '';
const supabasePublishableKey =
  (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() || '';

const isPlaceholderUrl =
  !supabaseUrl ||
  supabaseUrl.includes('YOUR_PROJECT_REF') ||
  !/^https?:\/\//i.test(supabaseUrl);

const isPlaceholderKey =
  !supabasePublishableKey ||
  supabasePublishableKey.includes('YOUR_SUPABASE_PUBLISHABLE_KEY');

export const isSupabaseConfigured = !isPlaceholderUrl && !isPlaceholderKey;

export const supabaseConfigError: string | null = !isSupabaseConfigured
  ? 'Supabase environment variables (SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) are not configured.'
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
        'Supabase client is not initialized. Check SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
    );
  }
  return supabase;
}
