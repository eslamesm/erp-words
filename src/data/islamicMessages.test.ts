import { describe, it, expect } from "vitest";
import { ISLAMIC_MESSAGES, pickIslamicMessage } from "@/data/islamicMessages";

describe("islamicMessages", () => {
  it("has a good number of messages", () => {
    expect(ISLAMIC_MESSAGES.length).toBeGreaterThanOrEqual(10);
  });

  it("has no duplicate arabic texts", () => {
    const ar = ISLAMIC_MESSAGES.map((m) => m.ar);
    expect(new Set(ar).size).toBe(ar.length);
  });

  it("fills both languages and the source for every message", () => {
    for (const m of ISLAMIC_MESSAGES) {
      expect(m.ar.length).toBeGreaterThan(0);
      expect(m.en.length).toBeGreaterThan(0);
      expect(m.sourceAr.length).toBeGreaterThan(0);
      expect(m.sourceEn.length).toBeGreaterThan(0);
    }
  });

  it("picks a message that belongs to the list", () => {
    for (let i = 0; i < 50; i++) {
      expect(ISLAMIC_MESSAGES).toContain(pickIslamicMessage());
    }
  });
});
