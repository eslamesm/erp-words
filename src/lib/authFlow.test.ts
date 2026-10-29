import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({ getSupabase: vi.fn() }));

vi.mock("@/lib/supabase", () => ({
  getSupabase: harness.getSupabase,
  supabaseEnabled: true,
}));

const { sendReset, signIn, signOut, signUp, signUpCredentials, updatePassword } = await import(
  "@/lib/auth"
);

function fakeClient(auth: Record<string, unknown>) {
  return { auth } as never;
}

beforeEach(() => {
  harness.getSupabase.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Phase 14.1B.2 - password reset flow", () => {
  it("requests the reset email with a same-origin /settings redirect", async () => {
    vi.stubGlobal("window", { location: { origin: "https://erp-vocab.vercel.app" } });
    const resetPasswordForEmail = vi.fn().mockResolvedValue({ error: null });
    harness.getSupabase.mockReturnValue(fakeClient({ resetPasswordForEmail }));

    const result = await sendReset(" learner@example.com ");

    expect(result).toEqual({ ok: true });
    expect(resetPasswordForEmail).toHaveBeenCalledWith("learner@example.com", {
      redirectTo: "https://erp-vocab.vercel.app/settings",
    });
  });

  it("maps an expired/consumed recovery session to an explicit message", async () => {
    const updateUser = vi
      .fn()
      .mockResolvedValue({ error: { message: "Auth session missing!" } });
    harness.getSupabase.mockReturnValue(fakeClient({ updateUser }));

    await expect(updatePassword("new-secret")).resolves.toEqual({
      ok: false,
      error: "انتهت صلاحية رابط الاستعادة. اطلب رابطًا جديدًا.",
    });
  });
});

describe("Phase 14.1B.2 - email confirmation flow", () => {
  it("reports needsConfirm when signup returns no session", async () => {
    const signUpMock = vi.fn().mockResolvedValue({ data: { session: null }, error: null });
    harness.getSupabase.mockReturnValue(fakeClient({ signUp: signUpMock }));

    await expect(signUp("new@example.com", "secret123")).resolves.toEqual({
      ok: true,
      needsConfirm: true,
    });
  });

  it("reports a completed session when confirmation is disabled", async () => {
    const signUpMock = vi
      .fn()
      .mockResolvedValue({ data: { session: { access_token: "t" } }, error: null });
    harness.getSupabase.mockReturnValue(fakeClient({ signUp: signUpMock }));

    await expect(signUp("new@example.com", "secret123")).resolves.toEqual({
      ok: true,
      needsConfirm: false,
    });
  });

  it("submits credentials only, never role or metadata", async () => {
    const signUpMock = vi.fn().mockResolvedValue({ data: { session: null }, error: null });
    harness.getSupabase.mockReturnValue(fakeClient({ signUp: signUpMock }));

    await signUp("new@example.com", "secret123");

    const payload = signUpMock.mock.calls[0][0] as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual(["email", "password"]);
    expect(payload).toEqual(signUpCredentials("new@example.com", "secret123"));
  });
});

describe("Phase 14.1B.2 - sign-in and sign-out", () => {
  it("translates invalid credentials and never leaks provider text", async () => {
    const signInWithPassword = vi
      .fn()
      .mockResolvedValue({ error: { message: "Invalid login credentials" } });
    harness.getSupabase.mockReturnValue(fakeClient({ signInWithPassword }));

    await expect(signIn("a@example.com", "bad")).resolves.toEqual({
      ok: false,
      error: "البريد أو كلمة المرور غير صحيحة.",
    });
  });

  it("clears cached admin content after sign-out", async () => {
    const signOutMock = vi.fn().mockResolvedValue({ error: null });
    const postMessage = vi.fn();
    vi.stubGlobal("navigator", {
      serviceWorker: { controller: { postMessage } },
    });
    harness.getSupabase.mockReturnValue(fakeClient({ signOut: signOutMock }));

    await signOut();

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({ type: "CLEAR_PROTECTED_CACHE" });
  });

  it("still clears the cache when Supabase is not configured", async () => {
    const postMessage = vi.fn();
    vi.stubGlobal("navigator", {
      serviceWorker: { controller: { postMessage } },
    });
    harness.getSupabase.mockReturnValue(null);

    await signOut();

    expect(postMessage).toHaveBeenCalledWith({ type: "CLEAR_PROTECTED_CACHE" });
  });
});
