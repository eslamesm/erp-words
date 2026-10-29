import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function swSource(): string {
  return readFileSync(join(process.cwd(), "public", "sw.js"), "utf8");
}

describe("Phase 14.1B.2 - service worker admin cache exclusion", () => {
  const sw = swSource();
  const literal = sw.match(/const PROTECTED_RE = (\/.*\/);/)?.[1];
  // Same pattern asserted below; kept local so the test exercises real matches.
  const protectedRe = /^\/admin(?:\/|$)/;

  it("declares the protected prefix once and matches only /admin routes", () => {
    expect(literal).toBe("/^\\/admin(?:\\/|$)/");
    expect(protectedRe.test("/admin")).toBe(true);
    expect(protectedRe.test("/admin/")).toBe(true);
    expect(protectedRe.test("/admin/content")).toBe(true);
    expect(protectedRe.test("/admin/content/review")).toBe(true);
    expect(protectedRe.test("/administrator")).toBe(false);
    expect(protectedRe.test("/adminx/content")).toBe(false);
    expect(protectedRe.test("/")).toBe(false);
  });

  it("never precaches an admin route", () => {
    expect(sw).toContain(
      "if (isProtectedPath(new URL(url, self.location.origin).pathname)) return;"
    );
    const routesBlock = sw.slice(sw.indexOf("const ROUTES = ["), sw.indexOf("];", sw.indexOf("const ROUTES = [")));
    expect(routesBlock).not.toContain("/admin");
    const coreBlock = sw.slice(sw.indexOf("const CORE = ["), sw.indexOf("];", sw.indexOf("const CORE = [")));
    expect(coreBlock).not.toContain("/admin");
  });

  it("handles protected requests before any HTML caching or offline fallback", () => {
    const guard = sw.indexOf("if (isProtectedPath(url.pathname))");
    const htmlSection = sw.indexOf("const isHtml =");
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(htmlSection);

    const branch = sw.slice(guard, guard + 240);
    expect(branch).toContain('fetch(req, { cache: "no-store" })');
    expect(branch).toContain("offlineResponse()");
    expect(branch).not.toContain("caches.match");
    expect(branch).not.toContain("caches.open");
  });

  it("purges cached admin responses on activation and on request", () => {
    expect(sw).toContain("async function purgeProtectedCache()");
    const activate = sw.slice(sw.indexOf('addEventListener("activate"'), sw.indexOf('addEventListener("notificationclick"'));
    expect(activate).toContain("await purgeProtectedCache();");
    expect(sw).toContain('const PROTECTED_CACHE_MESSAGE = "CLEAR_PROTECTED_CACHE";');
    expect(sw).toContain("event.data.type === PROTECTED_CACHE_MESSAGE");
  });
});
