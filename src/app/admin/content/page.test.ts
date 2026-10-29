import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminAccess: vi.fn(),
  getAdminContentData: vi.fn(),
  redirect: vi.fn((url: string): never => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  notFound: vi.fn((): never => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/lib/adminAuth.server", () => ({ getAdminAccess: mocks.getAdminAccess }));
vi.mock("@/lib/adminContent.server", () => ({
  getAdminContentData: mocks.getAdminContentData,
}));
vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  notFound: mocks.notFound,
}));
vi.mock("./ContentAdminClient", () => ({
  ContentAdminClient: function ContentAdminClient() {
    return null;
  },
}));

const { default: ContentAdminPage } = await import("./page");
const { ContentAdminClient } = await import("./ContentAdminClient");

const payload = { words: [{ id: "w1" }], counts: { total: 1 }, warnings: [] };

beforeEach(() => {
  mocks.getAdminAccess.mockReset();
  mocks.getAdminContentData.mockReset();
  mocks.redirect.mockClear();
  mocks.notFound.mockClear();
});

describe("Phase 14.1B.2 - admin page render gate", () => {
  it("redirects anonymous visitors before building any admin data", async () => {
    mocks.getAdminAccess.mockResolvedValue({ status: "anonymous" });

    await expect(ContentAdminPage()).rejects.toThrow(
      "NEXT_REDIRECT:/settings?next=%2Fadmin%2Fcontent"
    );
    expect(mocks.getAdminContentData).not.toHaveBeenCalled();
  });

  it("hides the page from authenticated non-admins without building data", async () => {
    mocks.getAdminAccess.mockResolvedValue({ status: "forbidden", userId: "user-1" });

    await expect(ContentAdminPage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.notFound).toHaveBeenCalledTimes(1);
    expect(mocks.getAdminContentData).not.toHaveBeenCalled();
  });

  it("renders the client shell with server-built data only for admins", async () => {
    mocks.getAdminAccess.mockResolvedValue({ status: "admin", userId: "admin-1" });
    mocks.getAdminContentData.mockReturnValue(payload);

    const element = (await ContentAdminPage()) as unknown as {
      type: unknown;
      props: { data: unknown };
    };

    expect(mocks.getAdminContentData).toHaveBeenCalledTimes(1);
    expect(element.type).toBe(ContentAdminClient);
    expect(element.props.data).toBe(payload);
  });
});
