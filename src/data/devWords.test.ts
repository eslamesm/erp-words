import { describe, it, expect } from "vitest";
import { devWords, DEV_TOPICS } from "@/data/devWords";

describe("devWords", () => {
  it("has unique ids", () => {
    const ids = devWords.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses the it module for every word", () => {
    for (const w of devWords) expect(w.module).toBe("it");
  });

  it("tags every word with a known topic", () => {
    const topics = new Set(DEV_TOPICS.map((t) => t.id));
    for (const w of devWords) {
      const tags = w.tags ?? [];
      expect(tags.some((tag) => topics.has(tag))).toBe(true);
    }
  });

  it("has at least one word per topic", () => {
    for (const topic of DEV_TOPICS) {
      const count = devWords.filter((w) => w.tags?.includes(topic.id)).length;
      expect(count).toBeGreaterThan(0);
    }
  });

  it("provides arabic meaning and at least one example", () => {
    for (const w of devWords) {
      expect(w.arabic.length).toBeGreaterThan(0);
      expect(w.examples.length).toBeGreaterThan(0);
    }
  });
});
