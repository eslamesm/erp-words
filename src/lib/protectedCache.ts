/**
 * Client-side helper that asks the service worker to drop any cached admin
 * response (for example after sign-out or when switching accounts).
 *
 * The service worker also purges these entries on activation, so a browser that
 * missed the message still converges on the next update.
 */
export const PROTECTED_CACHE_MESSAGE = "CLEAR_PROTECTED_CACHE";

interface PostMessageTarget {
  postMessage: (message: unknown) => void;
}

export interface ServiceWorkerContainerLike {
  controller: PostMessageTarget | null;
  ready?: Promise<{ active: PostMessageTarget | null }>;
}

/**
 * Accepts an explicit container so the behavior can be unit-tested without a
 * browser; production callers pass nothing and the global is used.
 */
export function clearProtectedContentCache(container?: ServiceWorkerContainerLike | null): void {
  const serviceWorker =
    container ??
    (typeof navigator !== "undefined"
      ? (navigator as unknown as { serviceWorker?: ServiceWorkerContainerLike }).serviceWorker
      : undefined);

  if (!serviceWorker) return;

  serviceWorker.controller?.postMessage({ type: PROTECTED_CACHE_MESSAGE });

  try {
    void serviceWorker.ready
      ?.then((registration) => registration.active?.postMessage({ type: PROTECTED_CACHE_MESSAGE }))
      .catch(() => {});
  } catch {
    // A missing or failed registration must never break sign-out.
  }
}
