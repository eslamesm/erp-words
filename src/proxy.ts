import { NextResponse, type NextRequest } from "next/server";
import { JOB_ROUTE_INDEX } from "./data/jobPathRouteIndex.generated";

export const JOB_ROUTE_PREFIX = "/job-based-learning";
export const RESERVED_404_PATH = "/__job-route-not-found__";

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

export function proxy(request: NextRequest): NextResponse {
  if (isAllowedJobRoute(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.rewrite(new URL(RESERVED_404_PATH, request.url));
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/job-based-learning/:path*"],
};
