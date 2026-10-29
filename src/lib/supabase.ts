import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_COOKIE_OPTIONS,
  SUPABASE_URL,
  supabaseConfigured,
} from "@/lib/supabaseConfig";

export const supabaseEnabled = supabaseConfigured;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseEnabled) return null;
  if (!client) {
    client = createBrowserClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      isSingleton: true,
      cookieOptions: SUPABASE_COOKIE_OPTIONS,
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
