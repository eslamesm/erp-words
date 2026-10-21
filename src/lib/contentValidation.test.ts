import { describe, it, expect } from "vitest";
import { validateContent, formatReport, type ValidationInput } from "@/lib/contentValidation";
import type { Word } from "@/types";
import type { SubModuleMeta } from "@/types";

const baseWord: Word = {
  id: "w1",
  english: "Invoice",
  arabic: "فاتورة",
  module: "finance",
  level: "B2",
  examples: ["Create an invoice."],
  examplesAr: ["أنشئ فاتورة."],
};

const validSubModules: SubModuleMeta[] = [
  { id: "finance-gl", moduleId: "finance", labelAr: "الأستاذ العام", labelEn: "General Ledger" },
];

describe("contentValidation", () => {
  it("passes on the real content with no errors", () => {
    const report = validateContent();
    if (report.errors.length > 0) {
      console.error(report.errors.slice(0, 20));
    }
    expect(report.errors).toEqual([]);
    expect(report.stats.words).toBeGreaterThan(300);
    expect(report.stats.subModules).toBeGreaterThan(100);
    expect(report.stats.glossaryTerms).toBeGreaterThan(100);
    expect(report.stats.wordsReviewed).toBeGreaterThan(0);
    expect(report.stats.wordsAuto).toBeGreaterThan(0);
    expect(report.stats.wordsReviewed + report.stats.wordsAuto).toBe(report.stats.words);
  });

  it("reports unused manual overrides as independent warnings (not errors)", () => {
    const report = validateContent();
    expect(report.errors).toEqual([]);
    const unused = report.warnings.filter((w) => w.code === "unused-override");
    expect(unused.length).toBe(report.stats.unusedOverrides);
    expect(unused.map((w) => w.id).sort()).toEqual(
      [
        "bill-of-materials",
        "credit-note",
        "debit-note",
        "payslip",
        "requisition",
        "service-level-agreement",
      ].sort()
    );
  });

  it("separates reviewed from auto classification in the formatted report", () => {
    const report = validateContent();
    expect(formatReport(report)).toContain("Classification: reviewed=");
  });

  it("detects duplicate word ids", () => {
    const input: ValidationInput = {
      subModules: validSubModules,
      words: [baseWord, { ...baseWord }],
      businessFunctions: [],
      glossaryPacks: [],
    };
    const report = validateContent(input);
    expect(report.errors.some((e) => e.code === "duplicate-word")).toBe(true);
  });

  it("detects a word with an invalid module", () => {
    const input: ValidationInput = {
      subModules: validSubModules,
      words: [{ ...baseWord, id: "w2", module: "nope" as Word["module"] }],
      businessFunctions: [],
      glossaryPacks: [],
    };
    const report = validateContent(input);
    expect(report.errors.some((e) => e.code === "word-bad-module")).toBe(true);
  });

  it("detects a submodule that belongs to another module", () => {
    const input: ValidationInput = {
      subModules: validSubModules,
      words: [{ ...baseWord, id: "w3", module: "sales", subModuleId: "finance-gl" }],
      businessFunctions: [],
      glossaryPacks: [],
    };
    const report = validateContent(input);
    expect(report.errors.some((e) => e.code === "word-submodule-mismatch")).toBe(true);
  });

  it("detects a business function linked to a missing submodule", () => {
    const input: ValidationInput = {
      subModules: validSubModules,
      words: [],
      businessFunctions: [{ id: "f1", subModuleId: "ghost", moduleId: "finance", labelAr: "أ", labelEn: "A" }],
      glossaryPacks: [],
    };
    const report = validateContent(input);
    expect(report.errors.some((e) => e.code === "function-bad-submodule")).toBe(true);
  });

  it("detects a published word without arabic translation", () => {
    const input: ValidationInput = {
      subModules: validSubModules,
      words: [{ ...baseWord, id: "w4", arabic: "", status: "published" }],
      businessFunctions: [],
      glossaryPacks: [],
    };
    const report = validateContent(input);
    expect(report.errors.some((e) => e.code === "word-arabic")).toBe(true);
  });

  it("warns when a word has no definition", () => {
    const input: ValidationInput = {
      subModules: validSubModules,
      words: [{ ...baseWord, id: "w5" }],
      businessFunctions: [],
      glossaryPacks: [],
    };
    const report = validateContent(input);
    expect(report.warnings.some((w) => w.code === "word-no-definition")).toBe(true);
  });

  it("formats a report string", () => {
    const report = validateContent();
    expect(formatReport(report)).toContain("Words:");
  });
});
