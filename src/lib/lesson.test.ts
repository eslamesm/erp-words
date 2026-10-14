import { describe, it, expect } from "vitest";
import { buildLessonQuiz, pickLessonWords, LESSON_WORDS } from "@/lib/lesson";
import type { WordProgress } from "@/types";

describe("pickLessonWords", () => {
  it("picks the requested number of words", () => {
    const words = pickLessonWords("2026-01-01", "A1", {});
    expect(words).toHaveLength(LESSON_WORDS);
  });

  it("is deterministic for the same day and level", () => {
    const a = pickLessonWords("2026-01-01", "B1", {}).map((w) => w.id);
    const b = pickLessonWords("2026-01-01", "B1", {}).map((w) => w.id);
    expect(a).toEqual(b);
  });

  it("usually changes across days", () => {
    const a = pickLessonWords("2026-01-01", "B1", {}).map((w) => w.id).join();
    const b = pickLessonWords("2026-02-15", "B1", {}).map((w) => w.id).join();
    expect(a).not.toEqual(b);
  });

  it("prefers words without progress", () => {
    const first = pickLessonWords("2026-03-03", "B1", {});
    const progress: Record<string, WordProgress> = {};
    for (const w of first) {
      progress[w.id] = {
        wordId: w.id,
        ease: 2.5,
        interval: 1,
        due: 0,
        reps: 3,
        lapses: 0,
        correctCount: 3,
        wrongCount: 0,
      };
    }
    const again = pickLessonWords("2026-03-03", "B1", progress);
    expect(again.map((w) => w.id)).not.toEqual(first.map((w) => w.id));
  });
});

describe("buildLessonQuiz", () => {
  const words = pickLessonWords("2026-01-01", "B1", {});

  it("builds one question per word", () => {
    const quiz = buildLessonQuiz(words, "2026-01-01");
    expect(quiz).toHaveLength(words.length);
  });

  it("includes the correct answer among the options", () => {
    const quiz = buildLessonQuiz(words, "2026-01-01");
    for (const q of quiz) {
      expect(q.options).toContain(q.answer);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("is deterministic", () => {
    const a = buildLessonQuiz(words, "2026-01-01");
    const b = buildLessonQuiz(words, "2026-01-01");
    expect(a).toEqual(b);
  });
});
