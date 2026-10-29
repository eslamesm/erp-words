import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

describe("Phase 14.1B - admin page authorization boundary", () => {
  const page = source("src/app/admin/content/page.tsx");
  const client = source("src/app/admin/content/ContentAdminClient.tsx");
  const proxy = source("src/proxy.ts");

  it("keeps /admin/content as a server component with a server-side gate", () => {
    expect(page).not.toContain('"use client"');
    expect(page).toContain("getAdminAccess");
    expect(page).toContain("access.status !== \"admin\"");
    expect(page).toContain("instant = false");
  });

  it("builds admin content only after the authorization decision", () => {
    const gate = page.indexOf('if (access.status !== "admin")');
    const callSite = page.indexOf("getAdminContentData()");
    expect(gate).toBeGreaterThan(-1);
    expect(callSite).toBeGreaterThan(gate);
    expect(page.slice(gate)).toMatch(
      /<ContentAdminClient\s+data=\{getAdminContentData\(\)\}\s*\/>/
    );
  });

  it("does not accept a role, user, or destination from the request", () => {
    expect(page).not.toMatch(/searchParams|request\.(json|formData|headers|cookies)|role\s*[:=]/);
  });

  it("keeps content data and validation out of the client component graph", () => {
    expect(client).toContain('"use client"');
    expect(client).not.toMatch(/from\s+["']@\/data\//);
    expect(client).not.toMatch(/from\s+["']@\/lib\/contentValidation["']/);
    expect(client).not.toMatch(/from\s+["']@\/lib\/adminContent\.server["']/);
    expect(client).not.toMatch(/\bWORDS\b/);
    expect(client).not.toMatch(/\bservice[_ -]?role\b/i);
  });

  it("gates every /admin route in proxy and keeps secrets out", () => {
    expect(proxy).toContain("ADMIN_PREFIX");
    expect(proxy).toContain("isAdminRoute");
    expect(proxy).toContain("hasSupabaseAuthCookie");
    expect(proxy).toContain("private, no-store");
    expect(proxy).toContain("getUser");
    expect(proxy).not.toMatch(/SERVICE_ROLE|service_role|SUPABASE_SERVICE/i);
  });

  it("protects admin routes with a layout-level gate", () => {
    const layout = source("src/app/admin/layout.tsx");
    expect(layout).not.toContain('"use client"');
    expect(layout).toContain("getAdminAccess");
    expect(layout).toContain("access.status !== \"admin\"");
    expect(layout).toContain("instant = false");
  });

  it("introduces no unprotected admin data endpoint", () => {
    expect(existsSync(join(process.cwd(), "src", "app", "api", "admin"))).toBe(false);
  });
});
