import { describe, it, expect } from "vitest";
import {
  buildKnowledgeBlock,
  careerPathById,
  careerPathOptions,
  retrieve,
  tokenize,
} from "@/lib/assistantKnowledge";

describe("tokenize", () => {
  it("normalizes Arabic definite article and lowercases English", () => {
    expect(tokenize("INVOICE")).toContain("invoice");
    expect(tokenize("الفاتورة")).toContain("فاتورة");
  });
});

describe("knowledge index", () => {
  it("retrieves the invoice word chunk", () => {
    const hits = retrieve("explain invoice", { types: ["word"] });
    expect(hits.some((h) => h.refId === "invoice")).toBe(true);
  });

  it("exposes all career paths as options", () => {
    const ids = careerPathOptions().map((p) => p.id);
    expect(ids).toContain("implementer");
    expect(ids.length).toBeGreaterThan(4);
  });

  it("looks up a career path by id", () => {
    expect(careerPathById("implementer")?.title).toBe("ERP Implementer");
  });

  it("retrieves an ERP process chunk for an Arabic phrase", () => {
    const hits = retrieve("المطابقة الثلاثية");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((h) => h.text.includes("three-way match"))).toBe(true);
  });
});

describe("buildKnowledgeBlock", () => {
  it("wraps retrieved chunks in an APP_KNOWLEDGE block", () => {
    const block = buildKnowledgeBlock(retrieve("invoice", { types: ["word"] }).slice(0, 1));
    expect(block).toContain("[APP_KNOWLEDGE]");
    expect(buildKnowledgeBlock([])).toBe("");
  });
});
