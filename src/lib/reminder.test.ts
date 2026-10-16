import { describe, expect, it, afterEach, vi } from "vitest";
import {
  atOrAfterStart,
  countDueWords,
  inScheduleWindow,
  minutesOfDay,
  parseTime,
} from "@/lib/reminder";

afterEach(() => vi.useRealTimers());

describe("countDueWords", () => {
  const base = {
    ease: 2.5,
    interval: 1,
    reps: 3,
    lapses: 0,
    due: 0,
    correctCount: 3,
    wrongCount: 0,
  };
  it("counts new (reps=0) and overdue words", () => {
    const now = Date.now();
    expect(
      countDueWords({
        a: { ...base, wordId: "a", reps: 0, due: now + 10_000 }, // new
        b: { ...base, wordId: "b", due: now - 10_000 }, // overdue
        c: { ...base, wordId: "c", due: now + 10_000 }, // not due
      })
    ).toBe(2);
  });
  it("returns 0 for empty/undefined", () => {
    expect(countDueWords({})).toBe(0);
    expect(countDueWords(undefined)).toBe(0);
  });
});

describe("time helpers", () => {
  it("parses HH:MM into minutes", () => {
    expect(parseTime("18:30")).toBe(1110);
    expect(parseTime("00:00")).toBe(0);
    expect(parseTime("")).toBeNaN();
  });
  it("minutesOfDay from a date", () => {
    expect(minutesOfDay(new Date(2026, 0, 1, 9, 15))).toBe(555);
  });
  it("window within the same day", () => {
    expect(inScheduleWindow(1139, 1080, 60)).toBe(true); // 18:59 in [18:00,19:00)
    expect(inScheduleWindow(1140, 1080, 60)).toBe(false); // 19:00 is the exclusive end
    expect(inScheduleWindow(1200, 1080, 60)).toBe(false); // 20:00
    expect(inScheduleWindow(1079, 1080, 60)).toBe(false); // 17:59
  });
  it("window crossing midnight", () => {
    expect(inScheduleWindow(1430, 1380, 120)).toBe(true); // 23:50 in [23:00,01:00)
    expect(inScheduleWindow(30, 1380, 120)).toBe(true); // 00:30
    expect(inScheduleWindow(180, 1380, 120)).toBe(false); // 03:00
  });
  it("atOrAfterStart includes the boundary", () => {
    expect(atOrAfterStart(1080, 1080)).toBe(true);
    expect(atOrAfterStart(1079, 1080)).toBe(false);
    expect(atOrAfterStart(100, NaN)).toBe(false);
  });
});
