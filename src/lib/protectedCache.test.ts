import { describe, expect, it, vi } from "vitest";
import {
  PROTECTED_CACHE_MESSAGE,
  clearProtectedContentCache,
  type ServiceWorkerContainerLike,
} from "@/lib/protectedCache";

describe("Phase 14.1B.2 - protected content cache cleanup", () => {
  it("messages the active controller", () => {
    const postMessage = vi.fn();
    const container: ServiceWorkerContainerLike = { controller: { postMessage } };

    clearProtectedContentCache(container);

    expect(postMessage).toHaveBeenCalledWith({ type: PROTECTED_CACHE_MESSAGE });
  });

  it("falls back to the ready registration when there is no controller yet", async () => {
    const postMessage = vi.fn();
    const container: ServiceWorkerContainerLike = {
      controller: null,
      ready: Promise.resolve({ active: { postMessage } }),
    };

    clearProtectedContentCache(container);
    await Promise.resolve();
    await Promise.resolve();

    expect(postMessage).toHaveBeenCalledWith({ type: PROTECTED_CACHE_MESSAGE });
  });

  it("never throws when the registration rejects or is unavailable", async () => {
    expect(() => clearProtectedContentCache(null)).not.toThrow();
    expect(() => clearProtectedContentCache({ controller: null })).not.toThrow();

    const container: ServiceWorkerContainerLike = {
      controller: null,
      ready: Promise.reject(new Error("no registration")),
    };
    expect(() => clearProtectedContentCache(container)).not.toThrow();
    await Promise.resolve();
  });
});
