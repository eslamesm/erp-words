import type { SupabaseClient, User } from "@supabase/supabase-js";

export const ADMIN_ROLE = "admin";

export type AdminAccess =
  | { status: "anonymous" }
  | { status: "forbidden"; userId: string }
  | { status: "admin"; userId: string };

/**
 * Only app_metadata is trusted for authorization. app_metadata can only be
 * written with the Supabase service role; user_metadata is user-writable and
 * is deliberately ignored.
 */
export function isAdminUser(
  user: Pick<User, "app_metadata"> | null | undefined
): boolean {
  const metadata = user?.app_metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return false;
  }
  return (metadata as Record<string, unknown>).role === ADMIN_ROLE;
}

/**
 * Converts a server-verified Supabase user into an access decision.
 * An auth error always wins, so an invalid/expired session is denied even if a
 * user object were somehow supplied alongside it.
 */
export function resolveAdminAccess(
  user: User | null | undefined,
  error?: unknown
): AdminAccess {
  if (error || !user?.id) return { status: "anonymous" };
  if (!isAdminUser(user)) return { status: "forbidden", userId: user.id };
  return { status: "admin", userId: user.id };
}

/**
 * Calls Supabase Auth's user-verification endpoint through a cookie-backed
 * server client. getUser() verifies the JWT server-side; getSession() alone
 * would only decode the cookie and is not sufficient for authorization.
 */
export async function resolveAdminSession(
  supabase: Pick<SupabaseClient, "auth"> | null
): Promise<AdminAccess> {
  if (!supabase) return { status: "anonymous" };

  try {
    const { data, error } = await supabase.auth.getUser();
    return resolveAdminAccess(data.user, error);
  } catch {
    return { status: "anonymous" };
  }
}
