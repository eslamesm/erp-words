import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_COOKIE_OPTIONS,
  SUPABASE_URL,
  supabaseConfigured,
} from "@/lib/supabaseConfig";

/**
 * Creates a per-request Supabase client backed by the request's auth cookies.
 * Server Components cannot write cookies, so write failures are intentionally
 * swallowed there; proxy.ts performs the refresh and persists it.
 */
export async function createSupabaseServerClient() {
  if (!supabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
    cookieOptions: SUPABASE_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Read-only Server Component render. proxy.ts refreshes the session.
        }
      },
    },
  });
}
