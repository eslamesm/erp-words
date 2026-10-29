import "server-only";

import { cache } from "react";
import { resolveAdminSession } from "@/lib/adminAccess";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server-only authorization boundary for admin routes. Cached per React render
 * pass so the page gate and any future admin data loaders share one check.
 */
export const getAdminAccess = cache(async () => {
  const supabase = await createSupabaseServerClient();
  return resolveAdminSession(supabase);
});
