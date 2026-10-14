import { describe, expect, it } from "vitest";
import { applyRating, newProgress } from "@/lib/srs";

describe("newProgress", () => {
  it("starts fresh", () => {
    const p = newProgress("w1");
    expect(p.reps).toBe(0);
    expect(p.lapses).toBe(0);
    expect(p.correctCount).toBe(0);
    expect(p.wrongCount).toBe(0);
  });
});

describe("applyRating", () => {
  it("'good' increases reps", () => {
    const p = newProgress("w1");
    const n = applyRating(p, "good");
    expect(n.reps).toBe(1);
    expect(n.interval).toBe(4);
    expect(n.correctCount).toBe(1);
  });

  it("'again' resets reps and counts a lapse", () => {
    const p = applyRating(newProgress("w1"), "good");
    const n = applyRating(p, "again");
    expect(n.reps).toBe(0);
    expect(n.lapses).toBe(1);
    expect(n.wrongCount).toBe(1);
    expect(n.interval).toBe(0);
  });

  it("interval grows for consecutive 'good'", () => {
    let p = newProgress("w1");
    p = applyRating(p, "good"); // reps 1 -> interval 4
    p = applyRating(p, "good"); // reps 2 -> interval 6
    const before = p.interval;
    p = applyRating(p, "good");
    expect(p.interval).toBeGreaterThan(before);
  });

  it("ease never drops below 1.3", () => {
    let p = newProgress("w1");
    for (let i = 0; i < 20; i++) p = applyRating(p, "again");
    expect(p.ease).toBeGreaterThanOrEqual(1.3);
  });
});
