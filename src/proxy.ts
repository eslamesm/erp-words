import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { JOB_ROUTE_INDEX } from "./data/jobPathRouteIndex.generated";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_COOKIE_OPTIONS,
  SUPABASE_URL,
  supabaseConfigured,
} from "./lib/supabaseConfig";

export const JOB_ROUTE_PREFIX = "/job-based-learning";
export const RESERVED_404_PATH = "/__job-route-not-found__";
export const ADMIN_PREFIX = "/admin";
export const ADMIN_CONTENT_PREFIX = "/admin/content";
export const SUPABASE_AUTH_COOKIE_RE = /^sb-.+-auth-token(?:\.\d+)?$/;

export function buildReadyRoutes(ready: object): ReadonlyMap<string, ReadonlySet<string>> {
  const routes = new Map<string, ReadonlySet<string>>();
  for (const [slug, lessons] of Object.entries(ready)) {
    if (!Array.isArray(lessons)) continue;
    const validLessons = lessons.filter(
      (lesson): lesson is string => typeof lesson === "string" && lesson.length > 0
    );
    if (validLessons.length === 0) continue;
    routes.set(slug, new Set(validLessons));
  }
  return routes;
}

const READY_ROUTES = buildReadyRoutes(JOB_ROUTE_INDEX.ready);

export function isAllowedInRoutes(
  pathname: string,
  routes: ReadonlyMap<string, ReadonlySet<string>>
): boolean {
  if (pathname === JOB_ROUTE_PREFIX) return true;

  const prefix = `${JOB_ROUTE_PREFIX}/`;
  if (!pathname.startsWith(prefix)) return false;

  const segments = pathname.slice(prefix.length).split("/");
  if (segments.some((segment) => segment.length === 0)) return false;
  if (segments.length === 1) return routes.has(segments[0]);
  if (segments.length !== 2) return false;

  const [jobSlug, second] = segments;
  if (second === "assessment") return routes.has(jobSlug);
  return routes.get(jobSlug)?.has(second) ?? false;
}

export function isAllowedJobRoute(pathname: string): boolean {
  return isAllowedInRoutes(pathname, READY_ROUTES);
}

/**
 * Every route under /admin is protected. The proxy matcher and the
 * `src/app/admin/layout.tsx` gate use the same prefix, so a future admin route
 * cannot be added without inheriting the authorization boundary.
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
}

export function isAdminContentRoute(pathname: string): boolean {
  return pathname === ADMIN_CONTENT_PREFIX || pathname.startsWith(`${ADMIN_CONTENT_PREFIX}/`);
}

/**
 * Cheap pre-check used only to skip an auth round-trip for requests that carry
 * no session at all. A cookie is never treated as proof of authentication: the
 * proxy still calls Supabase's getUser() and the admin page re-verifies.
 */
export function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(({ name }) => SUPABASE_AUTH_COOKIE_RE.test(name));
}

interface PendingCookie {
  name: string;
  value: string;
  options?: CookieOptions;
}

function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Vary", "Cookie");
  return response;
}

function applyCookies(response: NextResponse, cookies: PendingCookie[]): NextResponse {
  for (const { name, value, options } of cookies) {
    response.cookies.set(name, value, options);
  }
  return response;
}

function copyCookies(from: NextResponse, to: NextResponse): NextResponse {
  for (const cookie of from.cookies.getAll()) to.cookies.set(cookie);
  return to;
}

function loginRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL("/settings", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return noStore(NextResponse.redirect(loginUrl));
}

/**
 * Refreshes the Supabase session through the supported SSR client and persists
 * any rotated cookies on the outgoing response, so server renders (and the
 * browser) keep a valid session instead of replaying a rotated refresh token.
 */
async function refreshAdminSession(
  request: NextRequest
): Promise<{ response: NextResponse; authenticated: boolean }> {
  const pending: PendingCookie[] = [];
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
    cookieOptions: SUPABASE_COOKIE_OPTIONS,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        pending.length = 0;
        for (const { name, value, options } of cookiesToSet) {
          // Forward the refreshed token to the page render as well.
          request.cookies.set(name, value);
          pending.push({ name, value, options });
        }
        response = applyCookies(NextResponse.next({ request }), pending);
      },
    },
  });

  try {
    const { data, error } = await supabase.auth.getUser();
    return { response, authenticated: !error && Boolean(data?.user) };
  } catch {
    return { response, authenticated: false };
  }
}

async function adminResponse(request: NextRequest): Promise<NextResponse> {
  // No Supabase configuration or no session cookie: nothing to refresh, so fail
  // closed without contacting the auth server.
  if (!supabaseConfigured || !hasSupabaseAuthCookie(request)) {
    return loginRedirect(request);
  }

  const { response, authenticated } = await refreshAdminSession(request);

  if (!authenticated) {
    // Invalid, expired, or unverifiable session: clear any rotated cookies and
    // send the visitor to sign-in. The admin page still re-verifies server-side.
    return copyCookies(response, loginRedirect(request));
  }

  return noStore(response);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  if (isAdminRoute(request.nextUrl.pathname)) {
    return adminResponse(request);
  }

  if (isAllowedJobRoute(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.rewrite(new URL(RESERVED_404_PATH, request.url));
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/job-based-learning/:path*", "/admin/:path*"],
};
