import { describe, it, expect } from "vitest";
import { filterWords, matchesReview, reviewCounts } from "@/lib/contentAdmin";
import { WORDS } from "@/data/words";
import type { Word } from "@/types";

function w(o: Partial<Word>): Word {
  return { id: "x", english: "X", arabic: "س", module: "general", level: "A2", examples: ["x"], ...o };
}

describe("contentAdmin review filter", () => {
  it("filters by reviewed / auto / all", () => {
    const words = [w({ id: "a", reviewStatus: "reviewed" }), w({ id: "b", reviewStatus: "auto" })];
    expect(filterWords(words, { review: "reviewed" }).map((x) => x.id)).toEqual(["a"]);
    expect(filterWords(words, { review: "auto" }).map((x) => x.id)).toEqual(["b"]);
    expect(filterWords(words, { review: "all" })).toHaveLength(2);
  });

  it("treats needs-review as a reserved (currently empty) status", () => {
    expect(filterWords(WORDS, { review: "needs-review" })).toEqual([]);
    expect(matchesReview(w({ reviewStatus: "auto" }), "needs-review")).toBe(false);
  });

  it("filters by module, submodule, category, and query", () => {
    const words = [
      w({ id: "a", module: "finance", subModuleId: "finance-gl", category: "term" }),
      w({ id: "b", module: "it", subModuleId: "it-git", category: "action" }),
    ];
    expect(filterWords(words, { module: "finance" }).map((x) => x.id)).toEqual(["a"]);
    expect(filterWords(words, { subModule: "it-git" }).map((x) => x.id)).toEqual(["b"]);
    expect(filterWords(words, { category: "action" }).map((x) => x.id)).toEqual(["b"]);
    expect(filterWords(words, { query: "b" }).map((x) => x.id)).toEqual(["b"]);
  });
});

describe("reviewCounts on real content", () => {
  const counts = reviewCounts(WORDS);

  it("separates reviewed and auto and sums to the total", () => {
    expect(counts.reviewed + counts.auto + counts.needsReview).toBe(counts.total);
    expect(counts.total).toBe(WORDS.length);
  });

  it("reports the current split (156 reviewed / 264 auto / 0 needs-review)", () => {
    expect(counts.reviewed).toBe(156);
    expect(counts.auto).toBe(264);
    expect(counts.needsReview).toBe(0);
  });
});
