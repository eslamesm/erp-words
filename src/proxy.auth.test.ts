import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  getUser: vi.fn(),
  calls: [] as { url: string; key: string; options: Record<string, unknown> }[],
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: harness.createServerClient,
}));

vi.mock("@/lib/supabaseConfig", () => ({
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_ANON_KEY: "public-anon-key",
  supabaseConfigured: true,
  SUPABASE_COOKIE_OPTIONS: { path: "/", sameSite: "lax", secure: true },
}));

const { proxy } = await import("@/proxy");

interface CookieToSet {
  name: string;
  value: string;
  options?: Record<string, unknown>;
}

function requestFor(
  pathname: string,
  cookie?: string
): NextRequest {
  return new NextRequest(`http://localhost${pathname}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

function setAll(options: CookieToSet[]) {
  const call = harness.calls.at(-1);
  if (!call) throw new Error("createServerClient was not called");
  const cookies = call.options.cookies as { setAll: (c: CookieToSet[]) => void };
  cookies.setAll(options);
}

beforeEach(() => {
  harness.calls.length = 0;
  harness.getUser.mockReset();
  harness.createServerClient.mockReset();
  harness.createServerClient.mockImplementation((url, key, options) => {
    harness.calls.push({ url, key, options });
    return { auth: { getUser: harness.getUser } };
  });
});

describe("Phase 14.1B.2 - proxy session refresh", () => {
  it("verifies the session with getUser and forwards authenticated requests", async () => {
    harness.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });

    const response = await proxy(
      requestFor("/admin/content", "sb-projectref-auth-token=valid")
    );

    expect(harness.getUser).toHaveBeenCalledTimes(1);
    expect(harness.calls[0].url).toBe("https://project.supabase.co");
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("vary")).toBe("Cookie");
  });

  it("persists refreshed cookies on the outgoing response", async () => {
    harness.getUser.mockImplementation(async () => {
      setAll([
        {
          name: "sb-projectref-auth-token",
          value: "rotated-token",
          options: { path: "/", maxAge: 3600, sameSite: "lax" },
        },
      ]);
      return { data: { user: { id: "user-1" } }, error: null };
    });

    const request = requestFor("/admin/content", "sb-projectref-auth-token=stale");
    const response = await proxy(request);

    expect(response.cookies.get("sb-projectref-auth-token")?.value).toBe("rotated-token");
    expect(response.headers.get("set-cookie") ?? "").toContain("sb-projectref-auth-token=");
    // The refreshed token is also visible to the page render that follows.
    expect(request.cookies.get("sb-projectref-auth-token")?.value).toBe("rotated-token");
  });

  it("fails closed when getUser rejects the session and clears rotated cookies", async () => {
    harness.getUser.mockImplementation(async () => {
      setAll([
        {
          name: "sb-projectref-auth-token",
          value: "",
          options: { path: "/", maxAge: 0 },
        },
      ]);
      return { data: { user: null }, error: { message: "invalid JWT" } };
    });

    const response = await proxy(
      requestFor("/admin/content", "sb-projectref-auth-token=expired")
    );

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location") as string);
    expect(location.pathname).toBe("/settings");
    expect(location.searchParams.get("next")).toBe("/admin/content");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("set-cookie") ?? "").toContain("sb-projectref-auth-token=");
  });

  it("fails closed when the auth call throws", async () => {
    harness.getUser.mockRejectedValue(new Error("network down"));

    const response = await proxy(
      requestFor("/admin/content", "sb-projectref-auth-token=valid")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/settings");
  });

  it("does not call the auth server when no Supabase cookie is present", async () => {
    const response = await proxy(requestFor("/admin/content"));

    expect(harness.createServerClient).not.toHaveBeenCalled();
    expect(response.status).toBe(307);
  });

  it("does not create a Supabase client for public job routes", async () => {
    const response = await proxy(
      requestFor(
        "/job-based-learning/erp-accountant/understanding-accountant-role",
        "sb-projectref-auth-token=valid"
      )
    );

    expect(harness.createServerClient).not.toHaveBeenCalled();
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("cache-control")).toBeNull();
  });

  it("protects every /admin route, not only /admin/content", async () => {
    harness.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });

    const anonymous = await proxy(requestFor("/admin/users"));
    expect(anonymous.status).toBe(307);
    expect(new URL(anonymous.headers.get("location") as string).searchParams.get("next")).toBe(
      "/admin/users"
    );

    const authenticated = await proxy(
      requestFor("/admin/users", "sb-projectref-auth-token=valid")
    );
    expect(authenticated.headers.get("x-middleware-next")).toBe("1");
  });
});
