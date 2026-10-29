/**
 * Pure helpers for classifying Supabase auth callback URLs.
 *
 * `@supabase/ssr` uses the PKCE flow: the browser client stores a code verifier
 * in a cookie and the callback `?code=` can only be exchanged in the same
 * browser profile that started the flow. Opening a recovery or confirmation
 * link on another device therefore fails, and the UI should say so instead of
 * showing a generic "couldn't change password" error.
 */
export type AuthCallbackKind = "none" | "pkce" | "implicit" | "error";

export type AuthCallbackOutcome =
  | "ignore"
  | "process"
  | "explain-cross-device"
  | "explain-error";

export interface AuthCallbackInput {
  /** `window.location.search`. */
  search: string;
  /** `window.location.hash`. */
  hash: string;
  /** `document.cookie`. */
  cookies: string;
}

export interface AuthCallbackAssessment {
  kind: AuthCallbackKind;
  requiresVerifier: boolean;
  verifierPresent: boolean;
  outcome: AuthCallbackOutcome;
}

const VERIFIER_COOKIE_RE = /-code-verifier(?:\.\d+)?=/;

export function hasPkceVerifierCookie(cookies: string): boolean {
  if (!cookies) return false;
  return VERIFIER_COOKIE_RE.test(cookies);
}

function parseSearch(search: string): URLSearchParams {
  return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
}

export function assessAuthCallback({
  search,
  hash,
  cookies,
}: AuthCallbackInput): AuthCallbackAssessment {
  const params = parseSearch(search);
  const verifierPresent = hasPkceVerifierCookie(cookies);
  const error = params.get("error") ?? params.get("error_code");

  if (error) {
    return { kind: "error", requiresVerifier: false, verifierPresent, outcome: "explain-error" };
  }

  const code = params.get("code");
  if (code) {
    return {
      kind: "pkce",
      requiresVerifier: true,
      verifierPresent,
      outcome: verifierPresent ? "process" : "explain-cross-device",
    };
  }

  if (hash.includes("access_token=")) {
    return { kind: "implicit", requiresVerifier: false, verifierPresent, outcome: "process" };
  }

  return { kind: "none", requiresVerifier: false, verifierPresent, outcome: "ignore" };
}
