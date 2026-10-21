import { describe, it, expect } from "vitest";
import { WORDS, wordById } from "@/data/words";
import type { VocabularyCategory } from "@/types";

// المرحلة 06.2 — مصطلحات محاسبية (القوائم + الضريبة).
// مصدر الحقيقة المعتمد من مخطّط Phase 06.1.1.
interface ExpectedTerm {
  id: string;
  english: string;
  arabic: string;
  category: VocabularyCategory;
  subModuleId: string;
}

const ACCOUNTING_TERMS: ExpectedTerm[] = [
  { id: "general-ledger", english: "General Ledger", arabic: "دفتر الأستاذ العام", category: "term", subModuleId: "finance-gl" },
  { id: "accounts-payable", english: "Accounts Payable", arabic: "الحسابات الدائنة", category: "term", subModuleId: "finance-ap" },
  { id: "accounts-receivable", english: "Accounts Receivable", arabic: "الحسابات المدينة", category: "term", subModuleId: "finance-ar" },
  { id: "financial-statements", english: "Financial Statements", arabic: "القوائم المالية", category: "report", subModuleId: "finance-reporting" },
  { id: "fiscal-year", english: "Fiscal Year", arabic: "السنة المالية", category: "term", subModuleId: "finance-closing" },
  { id: "prepayment", english: "Prepayment", arabic: "دفعة مقدمة", category: "term", subModuleId: "finance-gl" },
  { id: "period-closing", english: "Period Closing", arabic: "إغلاق الفترة", category: "action", subModuleId: "finance-closing" },
  { id: "bank-reconciliation", english: "Bank Reconciliation", arabic: "التسوية البنكية", category: "action", subModuleId: "finance-bank" },
];

const TAX_TERMS: ExpectedTerm[] = [
  { id: "tax-invoice", english: "Tax Invoice", arabic: "فاتورة ضريبية", category: "document", subModuleId: "finance-tax" },
  { id: "vat", english: "Value Added Tax", arabic: "ضريبة القيمة المضافة", category: "term", subModuleId: "finance-tax" },
  { id: "input-tax", english: "Input Tax", arabic: "ضريبة المدخلات", category: "term", subModuleId: "finance-tax" },
  { id: "output-tax", english: "Output Tax", arabic: "ضريبة المخرجات", category: "term", subModuleId: "finance-tax" },
  { id: "tax-report", english: "Tax Report", arabic: "تقرير ضريبي", category: "report", subModuleId: "finance-tax" },
];

const ALL_TERMS = [...ACCOUNTING_TERMS, ...TAX_TERMS];

describe("Phase 06.2 accounting + tax vocabulary", () => {
  it("adds exactly 13 new terms (8 accounting + 5 tax)", () => {
    expect(ACCOUNTING_TERMS.length).toBe(8);
    expect(TAX_TERMS.length).toBe(5);
    expect(ALL_TERMS.length).toBe(13);
  });

  it("registers every approved id exactly once in WORDS", () => {
    for (const term of ALL_TERMS) {
      const occurrences = WORDS.filter((w) => w.id === term.id);
      expect(occurrences.length, `duplicate/absent id: ${term.id}`).toBe(1);
    }
  });

  it("resolves every term through wordById", () => {
    for (const term of ALL_TERMS) {
      expect(wordById(term.id), `wordById miss: ${term.id}`).toBeDefined();
    }
  });

  it("matches the approved English and Arabic values", () => {
    for (const term of ALL_TERMS) {
      const word = wordById(term.id);
      expect(word!.english, `english mismatch: ${term.id}`).toBe(term.english);
      expect(word!.arabic, `arabic mismatch: ${term.id}`).toBe(term.arabic);
    }
  });

  it("assigns every term to the finance module", () => {
    for (const term of ALL_TERMS) {
      expect(wordById(term.id)!.module, `module mismatch: ${term.id}`).toBe("finance");
    }
  });

  it("derives the approved category for every term", () => {
    for (const term of ALL_TERMS) {
      expect(wordById(term.id)!.category, `category mismatch: ${term.id}`).toBe(term.category);
    }
  });

  it("resolves the approved submodule for every term", () => {
    for (const term of ALL_TERMS) {
      expect(wordById(term.id)!.subModuleId, `submodule mismatch: ${term.id}`).toBe(term.subModuleId);
    }
  });

  it("keeps every term reviewed and published", () => {
    for (const term of ALL_TERMS) {
      const word = wordById(term.id)!;
      expect(word.status, `status: ${term.id}`).toBe("published");
      expect(word.reviewStatus, `reviewStatus: ${term.id}`).toBe("reviewed");
    }
  });
});

describe("Phase 06.2 existing distinctions preserved", () => {
  it("keeps the generic ledger term distinct from general-ledger", () => {
    const ledger = wordById("ledger");
    const gl = wordById("general-ledger");
    expect(ledger).toBeDefined();
    expect(gl).toBeDefined();
    expect(ledger!.id).not.toBe(gl!.id);
    expect(ledger!.english).toBe("Ledger");
    expect(gl!.english).toBe("General Ledger");
  });

  it("does not change unrelated finance classifications", () => {
    expect(wordById("post")!.category).toBe("action");
    expect(wordById("journal-entry")!.category).toBe("document");
    expect(wordById("trial-balance")!.category).toBe("report");
    expect(wordById("balance-sheet")!.category).toBe("report");
    expect(wordById("reconciliation")!.category).toBe("action");
    expect(wordById("accrual")!.category).toBe("term");
  });

  it("does not change unrelated finance submodules", () => {
    expect(wordById("trial-balance")!.subModuleId).toBe("finance-reporting");
    expect(wordById("income-statement")!.subModuleId).toBe("finance-reporting");
    expect(wordById("reconciliation")!.subModuleId).toBe("finance-gl");
  });

  it("keeps the existing bank reconciliation screen untouched", () => {
    const scr = wordById("scr-bank-reconciliation");
    expect(scr).toBeDefined();
    expect(scr!.english).toBe("Bank Reconciliation");
    expect(scr!.category).toBe("screen");
    expect(wordById("bank-reconciliation")!.category).toBe("action");
  });

  it("preserves the total finance term count growth by exactly 13", () => {
    const approved = new Set(ALL_TERMS.map((t) => t.id));
    for (const id of approved) {
      expect(WORDS.some((w) => w.id === id)).toBe(true);
    }
  });
});
