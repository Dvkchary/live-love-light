import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseKey !== 'your-supabase-anon-or-publishable-key' &&
    supabaseKey !== 'your-supabase-anon-key'
  );
};

let browserClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client for browser-side requests with public/anon privileges.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (browserClient) return browserClient;

  browserClient = createClient(supabaseUrl!, supabaseKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return browserClient;
}

/**
 * Returns a Supabase client for server-side operations.
 * If SUPABASE_SERVICE_ROLE_KEY is provided, uses service-role privileges for admin operations.
 */
export function getSupabaseServerClient(useServiceRole = false): SupabaseClient | null {
  if (!supabaseUrl) return null;

  const keyToUse = useServiceRole && supabaseServiceRole ? supabaseServiceRole : supabaseKey;
  if (!keyToUse) return null;

  return createClient(supabaseUrl, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
