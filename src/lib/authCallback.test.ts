import { describe, expect, it } from "vitest";
import { assessAuthCallback, hasPkceVerifierCookie } from "@/lib/authCallback";

const VERIFIER = "sb-projectref-auth-token-code-verifier=abc123";

describe("Phase 14.1B.2 - PKCE callback classification", () => {
  it("ignores URLs that are not auth callbacks", () => {
    const result = assessAuthCallback({ search: "", hash: "", cookies: "" });
    expect(result.kind).toBe("none");
    expect(result.outcome).toBe("ignore");
    expect(result.requiresVerifier).toBe(false);
  });

  it("processes a PKCE code when the verifier cookie is present", () => {
    const result = assessAuthCallback({
      search: "?code=abc",
      hash: "",
      cookies: VERIFIER,
    });
    expect(result).toMatchObject({
      kind: "pkce",
      requiresVerifier: true,
      verifierPresent: true,
      outcome: "process",
    });
  });

  it("explains cross-device failures when the verifier cookie is missing", () => {
    const result = assessAuthCallback({
      search: "?code=abc",
      hash: "",
      cookies: "theme=dark",
    });
    expect(result).toMatchObject({
      kind: "pkce",
      requiresVerifier: true,
      verifierPresent: false,
      outcome: "explain-cross-device",
    });
  });

  it("detects chunked and flow-scoped verifier cookies", () => {
    expect(hasPkceVerifierCookie("sb-x-auth-token-code-verifier.0=abc")).toBe(true);
    expect(
      hasPkceVerifierCookie("sb-x-auth-token-flow-AbC123xy-code-verifier=abc")
    ).toBe(true);
    expect(hasPkceVerifierCookie("sb-x-auth-token-code-verifierx=abc")).toBe(false);
    expect(hasPkceVerifierCookie("")).toBe(false);
  });

  it("reports provider errors instead of treating them as a password failure", () => {
    expect(
      assessAuthCallback({ search: "?error=access_denied", hash: "", cookies: "" })
    ).toMatchObject({ kind: "error", outcome: "explain-error" });
    expect(
      assessAuthCallback({ search: "?error_code=otp_expired", hash: "", cookies: "" })
    ).toMatchObject({ kind: "error", outcome: "explain-error" });
  });

  it("accepts implicit (hash token) callbacks without a verifier", () => {
    const result = assessAuthCallback({
      search: "",
      hash: "#access_token=t&refresh_token=r&type=recovery",
      cookies: "",
    });
    expect(result).toMatchObject({
      kind: "implicit",
      requiresVerifier: false,
      outcome: "process",
    });
  });
});
