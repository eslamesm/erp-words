import { describe, it, expect } from "vitest";
import {
  EMAIL_LESSONS,
  EMAIL_SLUGS,
  emailBySlug,
  PRO_ENG_UNITS,
  PRO_ENG_UNIT_SLUGS,
  proEngUnitBySlug,
  READY_EMAIL_LESSONS,
} from "@/data/professionalEnglish";
import { wordById } from "@/data/words";

const EMAIL_PARTS = ["subject", "greeting", "opening", "body", "action", "closing", "signature"];
const EMAIL_STYLES = new Set(["formal", "neutral", "firm"]);
const LEVELS = new Set(["A1", "A2", "B1", "B2", "C1"]);
const PROCESS_IDS = new Set(["p2p", "o2c", "r2r", "p2produce", "cross"]);

describe("professional english units (Phase 03)", () => {
  it("has unique ids and slugs", () => {
    const ids = PRO_ENG_UNITS.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(PRO_ENG_UNIT_SLUGS).size).toBe(PRO_ENG_UNIT_SLUGS.length);
    for (const slug of PRO_ENG_UNIT_SLUGS) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("uses a valid status and keeps email writing as the first ready unit", () => {
    for (const u of PRO_ENG_UNITS) {
      expect(["ready", "planned"], u.id).toContain(u.status);
    }
    expect(PRO_ENG_UNITS[0].slug).toBe("business-email-writing");
    expect(PRO_ENG_UNITS[0].status).toBe("ready");
    expect(proEngUnitBySlug("business-email-writing")?.id).toBe("business-email-writing");
  });

  it("lists future units as planned", () => {
    const planned = PRO_ENG_UNITS.filter((u) => u.status === "planned");
    expect(planned.length).toBeGreaterThan(0);
    for (const u of planned) {
      expect(u.titleAr && u.titleEn, u.id).toBeTruthy();
      expect(u.descAr && u.descEn, u.id).toBeTruthy();
    }
  });
});

describe("business email lessons (Phase 03)", () => {
  it("has unique ids and slugs with a valid slug format", () => {
    const ids = EMAIL_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(EMAIL_SLUGS).size).toBe(EMAIL_SLUGS.length);
    for (const slug of EMAIL_SLUGS) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("provides the seven approved lessons in order", () => {
    expect(READY_EMAIL_LESSONS.map((l) => l.slug)).toEqual([
      "supplier-follow-up",
      "customer-order-confirmation",
      "payment-reminder",
      "invoice-discrepancy",
      "production-delay-notification",
      "meeting-invitation-follow-up",
      "issue-escalation",
    ]);
    READY_EMAIL_LESSONS.forEach((l, i) => {
      expect(l.order, l.id).toBe(i + 1);
    });
    expect(emailBySlug("supplier-follow-up")?.id).toBe("email-supplier-follow-up");
  });

  it("gives every lesson valid level, style and process context", () => {
    for (const l of EMAIL_LESSONS) {
      expect(LEVELS.has(l.level), `${l.id}:${l.level}`).toBe(true);
      expect(EMAIL_STYLES.has(l.style), `${l.id}:${l.style}`).toBe(true);
      expect(PROCESS_IDS.has(l.processId), `${l.id}:${l.processId}`).toBe(true);
      expect(l.processLabelAr && l.processLabelEn, `${l.id}: process label`).toBeTruthy();
    }
  });

  it("keeps the ten-section content bilingual and non-empty", () => {
    for (const l of EMAIL_LESSONS) {
      expect(l.scenarioAr && l.scenarioEn, `${l.id}: scenario`).toBeTruthy();
      expect(l.objectivesAr.length, `${l.id}: objectives`).toBeGreaterThan(0);
      expect(l.objectivesAr.length, `${l.id}: objectives parity`).toBe(l.objectivesEn.length);
      expect(l.writingTaskAr && l.writingTaskEn, `${l.id}: writing task`).toBeTruthy();
      expect(l.referenceAnswerAr && l.referenceAnswerEn, `${l.id}: reference answer`).toBeTruthy();
      expect(l.checklistAr.length, `${l.id}: checklist`).toBeGreaterThan(0);
      expect(l.checklistAr.length, `${l.id}: checklist parity`).toBe(l.checklistEn.length);
    }
  });

  it("includes every email part exactly once, bilingual with a purpose", () => {
    for (const l of EMAIL_LESSONS) {
      const parts = l.blocks.map((b) => b.part);
      expect(new Set(parts).size, `${l.id}: unique parts`).toBe(parts.length);
      for (const part of EMAIL_PARTS) {
        const block = l.blocks.find((b) => b.part === part);
        expect(block, `${l.id}:${part}`).toBeTruthy();
        expect(block!.en && block!.ar, `${l.id}:${part}: bilingual`).toBeTruthy();
        expect(block!.purposeAr && block!.purposeEn, `${l.id}:${part}: purpose`).toBeTruthy();
      }
    }
  });

  it("keeps expressions bilingual, styled and referencing valid words", () => {
    for (const l of EMAIL_LESSONS) {
      expect(l.expressions.length, l.id).toBeGreaterThan(0);
      const ids = l.expressions.map((e) => e.id);
      expect(new Set(ids).size, `${l.id}: expr ids`).toBe(ids.length);
      for (const e of l.expressions) {
        expect(e.en && e.ar, `${e.id}: bilingual`).toBeTruthy();
        expect(e.explainAr && e.explainEn, `${e.id}: explain`).toBeTruthy();
        expect(EMAIL_STYLES.has(e.style), `${e.id}:${e.style}`).toBe(true);
        if (e.wordId) {
          expect(wordById(e.wordId), `${e.id}:${e.wordId}`).toBeTruthy();
        }
      }
    }
  });

  it("links only existing WORDS ids", () => {
    for (const l of EMAIL_LESSONS) {
      expect(l.wordIds.length, l.id).toBeGreaterThan(0);
      for (const id of l.wordIds) {
        expect(wordById(id), `${l.id}:${id}`).toBeTruthy();
      }
    }
  });

  it("keeps fill-in-the-blank exercises well-formed", () => {
    for (const l of EMAIL_LESSONS) {
      expect(l.guided.fillBlanks.length, l.id).toBeGreaterThan(0);
      const ids = l.guided.fillBlanks.map((f) => f.id);
      expect(new Set(ids).size, `${l.id}: blank ids`).toBe(ids.length);
      for (const f of l.guided.fillBlanks) {
        expect(f.promptAr && f.promptEn, `${f.id}: prompt`).toBeTruthy();
        expect(f.optionsAr.length, `${f.id}: options`).toBeGreaterThanOrEqual(2);
        expect(f.optionsAr.length, `${f.id}: parity`).toBe(f.optionsEn.length);
        expect(f.answerIndex, f.id).toBeGreaterThanOrEqual(0);
        expect(f.answerIndex, f.id).toBeLessThan(f.optionsAr.length);
      }
    }
  });

  it("keeps choose-the-expression exercises well-formed", () => {
    for (const l of EMAIL_LESSONS) {
      expect(l.guided.choose.length, l.id).toBeGreaterThan(0);
      const ids = l.guided.choose.map((c) => c.id);
      expect(new Set(ids).size, `${l.id}: choose ids`).toBe(ids.length);
      for (const c of l.guided.choose) {
        expect(c.scenarioAr && c.scenarioEn, `${c.id}: scenario`).toBeTruthy();
        expect(c.optionsAr.length, `${c.id}: options`).toBeGreaterThanOrEqual(2);
        expect(c.optionsAr.length, `${c.id}: parity`).toBe(c.optionsEn.length);
        expect(c.answerIndex, c.id).toBeGreaterThanOrEqual(0);
        expect(c.answerIndex, c.id).toBeLessThan(c.optionsAr.length);
      }
    }
  });

  it("keeps the knowledge check well-formed and bilingual", () => {
    for (const l of EMAIL_LESSONS) {
      expect(l.quiz.length, l.id).toBeGreaterThanOrEqual(5);
      const ids = l.quiz.map((q) => q.id);
      expect(new Set(ids).size, `${l.id}: quiz ids`).toBe(ids.length);
      for (const q of l.quiz) {
        expect(q.promptAr && q.promptEn, q.id).toBeTruthy();
        expect(q.optionsAr.length, q.id).toBe(q.optionsEn.length);
        expect(q.optionsAr.length, q.id).toBeGreaterThanOrEqual(2);
        expect(q.answerIndex, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex, q.id).toBeLessThan(q.optionsAr.length);
        if (q.wordId) {
          expect(wordById(q.wordId), `${q.id}:${q.wordId}`).toBeTruthy();
        }
      }
    }
  });
});
