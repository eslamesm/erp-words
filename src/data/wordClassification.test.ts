import { describe, it, expect } from "vitest";
import {
  categorySource,
  classifyWord,
  deriveCategory,
  WORD_CLASSIFICATION,
} from "@/data/wordClassification";
import { WORDS } from "@/data/words";
import type { Word } from "@/types";

function rawWord(overrides: Partial<Word>): Word {
  return {
    id: "test",
    english: "Test",
    arabic: "اختبار",
    module: "general",
    level: "A2",
    examples: ["Test."],
    ...overrides,
  };
}

describe("word classification precedence", () => {
  it("tags never override an explicit category", () => {
    const word = rawWord({ id: "x1", category: "status", tags: ["document", "report"] });
    expect(categorySource(word)).toBe("explicit");
    expect(deriveCategory(word)).toBe("status");
  });

  it("tags never override a manual override", () => {
    const word = rawWord({ id: "draft", tags: ["document"] });
    expect(categorySource(word)).toBe("override");
    expect(deriveCategory(word)).toBe("status");
  });

  it("override beats explicit and tags", () => {
    const word = rawWord({ id: "post", category: "term", tags: ["document"] });
    expect(deriveCategory(word)).toBe("action");
  });

  it("falls back to tags only when neither override nor explicit exists", () => {
    const word = rawWord({ id: "x2", tags: ["report"] });
    expect(categorySource(word)).toBe("tag");
    expect(deriveCategory(word)).toBe("report");
  });

  it("defaults to term when nothing matches", () => {
    const word = rawWord({ id: "x3" });
    expect(categorySource(word)).toBe("default");
    expect(deriveCategory(word)).toBe("term");
  });
});

describe("draft correction (regression)", () => {
  it("classifies the draft term as status, not document", () => {
    const draft = WORDS.find((w) => w.id === "draft");
    expect(draft).toBeDefined();
    expect(draft!.category).toBe("status");
  });

  it("keeps the status field meaning (publication status) unchanged", () => {
    const draft = WORDS.find((w) => w.id === "draft");
    expect(draft!.status).toBe("published");
    expect(draft!.reviewStatus).toBe("reviewed");
  });
});

describe("reviewStatus separation", () => {
  it("marks overrides and explicit categories as reviewed", () => {
    const word = rawWord({ id: "draft" });
    expect(classifyWord(word).reviewStatus).toBe("reviewed");
    const explicit = rawWord({ id: "x4", category: "field" });
    expect(classifyWord(explicit).reviewStatus).toBe("reviewed");
  });

  it("marks tag- and default-derived classifications as auto", () => {
    const tagged = rawWord({ id: "x5", tags: ["document"] });
    expect(classifyWord(tagged).reviewStatus).toBe("auto");
    const plain = rawWord({ id: "x6" });
    expect(classifyWord(plain).reviewStatus).toBe("auto");
  });

  it("never leaves reviewStatus undefined on classified words", () => {
    expect(WORDS.every((w) => w.reviewStatus === "reviewed" || w.reviewStatus === "auto")).toBe(true);
    expect(WORDS.some((w) => w.reviewStatus === "reviewed")).toBe(true);
    expect(WORDS.some((w) => w.reviewStatus === "auto")).toBe(true);
  });

  it("keeps status semantics: all classified words remain published", () => {
    expect(WORDS.every((w) => w.status === "published")).toBe(true);
  });
});

describe("WORD_CLASSIFICATION integrity", () => {
  it("does not contain categories outside the vocabulary set", () => {
    const allowed = new Set([
      "term",
      "screen",
      "field",
      "button",
      "menu",
      "document",
      "status",
      "action",
      "report",
      "error",
      "abbreviation",
    ]);
    for (const [id, entry] of Object.entries(WORD_CLASSIFICATION)) {
      if (entry.category) expect(allowed.has(entry.category), `${id} → ${entry.category}`).toBe(true);
    }
  });
});
