import type { SupabaseClient, User } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import {
  isAdminUser,
  resolveAdminAccess,
  resolveAdminSession,
} from "@/lib/adminAccess";
import { signUpCredentials } from "@/lib/auth";

function makeUser(
  app_metadata: Record<string, unknown>,
  user_metadata: Record<string, unknown> = {}
): User {
  return {
    id: "user-1",
    aud: "authenticated",
    app_metadata,
    user_metadata,
    created_at: "2026-01-01T00:00:00.000Z",
  } as User;
}

function fakeClient(result: { data: { user: User | null }; error: unknown }) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue(result),
    },
  } as unknown as Pick<SupabaseClient, "auth">;
}

describe("Phase 14.1B - admin role source", () => {
  it("accepts only the exact app_metadata.role value", () => {
    expect(isAdminUser(makeUser({ role: "admin" }))).toBe(true);
    expect(isAdminUser(makeUser({ role: "Admin" }))).toBe(false);
    expect(isAdminUser(makeUser({ role: "ADMIN" }))).toBe(false);
    expect(isAdminUser(makeUser({ role: ["admin"] }))).toBe(false);
    expect(isAdminUser(makeUser({ role: "user" }))).toBe(false);
    expect(isAdminUser(makeUser({}))).toBe(false);
    expect(isAdminUser(null)).toBe(false);
  });

  it("ignores user_metadata, which users can write themselves", () => {
    const forged = makeUser({}, { role: "admin", app_metadata: { role: "admin" } });
    expect(isAdminUser(forged)).toBe(false);
    expect(resolveAdminAccess(forged)).toEqual({
      status: "forbidden",
      userId: "user-1",
    });
  });

  it("does not let a forged client role replace a server-verified role", () => {
    const ordinary = makeUser({ role: "user" }, { role: "admin" });
    expect(resolveAdminAccess(ordinary)).toEqual({
      status: "forbidden",
      userId: "user-1",
    });

    const admin = makeUser({ role: "admin" }, { role: "user" });
    expect(resolveAdminAccess(admin)).toEqual({
      status: "admin",
      userId: "user-1",
    });
  });

  it("denies missing, invalid and expired sessions", () => {
    expect(resolveAdminAccess(null)).toEqual({ status: "anonymous" });
    expect(resolveAdminAccess(undefined)).toEqual({ status: "anonymous" });
    expect(resolveAdminAccess(makeUser({ role: "admin" }), new Error("expired"))).toEqual({
      status: "anonymous",
    });
    expect(
      resolveAdminAccess({ ...makeUser({ role: "admin" }), id: "" } as User)
    ).toEqual({ status: "anonymous" });
  });
});

describe("Phase 14.1B - server session verification", () => {
  it("denies when no server client is configured", async () => {
    await expect(resolveAdminSession(null)).resolves.toEqual({ status: "anonymous" });
  });

  it("allows a verified administrator returned by getUser()", async () => {
    const client = fakeClient({
      data: { user: makeUser({ role: "admin" }) },
      error: null,
    });
    await expect(resolveAdminSession(client)).resolves.toEqual({
      status: "admin",
      userId: "user-1",
    });
  });

  it("denies a verified ordinary user", async () => {
    const client = fakeClient({
      data: { user: makeUser({ role: "user" }) },
      error: null,
    });
    await expect(resolveAdminSession(client)).resolves.toEqual({
      status: "forbidden",
      userId: "user-1",
    });
  });

  it("denies an invalid session even if a user object is present", async () => {
    const client = fakeClient({
      data: { user: makeUser({ role: "admin" }) },
      error: { message: "invalid JWT" },
    });
    await expect(resolveAdminSession(client)).resolves.toEqual({ status: "anonymous" });
  });

  it("denies a failed verification call", async () => {
    const client = {
      auth: {
        getUser: vi.fn().mockRejectedValue(new Error("network failure")),
      },
    } as unknown as Pick<SupabaseClient, "auth">;

    await expect(resolveAdminSession(client)).resolves.toEqual({ status: "anonymous" });
  });
});

describe("Phase 14.1B - public sign-up cannot submit a role", () => {
  it("sends only email and password to Supabase signUp", () => {
    const payload = signUpCredentials("  learner@example.com ", "secret123");
    expect(payload).toEqual({ email: "learner@example.com", password: "secret123" });
    expect(Object.keys(payload).sort()).toEqual(["email", "password"]);
    expect("data" in payload).toBe(false);
    expect("app_metadata" in payload).toBe(false);
    expect("role" in payload).toBe(false);
  });
});
