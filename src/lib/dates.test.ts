import { describe, expect, it } from "vitest";
import { dayKey, shiftDay, weekKey } from "@/lib/dates";

describe("shiftDay", () => {
  it("shifts forward within a month", () => {
    expect(shiftDay("2026-03-01", 1)).toBe("2026-03-02");
  });
  it("rolls over month boundaries", () => {
    expect(shiftDay("2026-02-28", 1)).toBe("2026-03-01");
  });
  it("shifts backward across months", () => {
    expect(shiftDay("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("returns empty for empty input", () => {
    expect(shiftDay("", 1)).toBe("");
  });
});

describe("dayKey", () => {
  it("returns YYYY-MM-DD", () => {
    expect(dayKey(0)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it("offsets by days", () => {
    const a = dayKey(0);
    const b = dayKey(-1);
    expect(shiftDay(a, -1)).toBe(b);
  });
});

describe("weekKey", () => {
  it("returns W<number>", () => {
    expect(weekKey(0)).toMatch(/^W\d+$/);
  });
});
