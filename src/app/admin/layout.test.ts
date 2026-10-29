import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminAccess: vi.fn(),
  redirect: vi.fn((url: string): never => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  notFound: vi.fn((): never => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/lib/adminAuth.server", () => ({ getAdminAccess: mocks.getAdminAccess }));
vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  notFound: mocks.notFound,
}));

const { default: AdminLayout } = await import("./layout");

const children = { type: "div", props: { children: "admin" } } as never;

beforeEach(() => {
  mocks.getAdminAccess.mockReset();
  mocks.redirect.mockClear();
  mocks.notFound.mockClear();
});

describe("Phase 14.1B.2 - /admin layout boundary", () => {
  it("requires a session before rendering any admin route", async () => {
    mocks.getAdminAccess.mockResolvedValue({ status: "anonymous" });

    await expect(AdminLayout({ children })).rejects.toThrow("NEXT_REDIRECT:/settings");
  });

  it("hides every admin route from authenticated non-admins", async () => {
    mocks.getAdminAccess.mockResolvedValue({ status: "forbidden", userId: "user-1" });

    await expect(AdminLayout({ children })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders children for a verified admin", async () => {
    mocks.getAdminAccess.mockResolvedValue({ status: "admin", userId: "admin-1" });

    await expect(AdminLayout({ children })).resolves.toBe(children);
  });
});
