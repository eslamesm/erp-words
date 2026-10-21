import { describe, it, expect } from "vitest";
import {
  MEETING_LESSONS,
  MEETING_SLUGS,
  meetingBySlug,
  READY_MEETING_LESSONS,
} from "@/data/meetings";
import { wordById } from "@/data/words";
import { DICTS } from "@/lib/i18n";

const APPROVED_SLUGS = [
  "starting-business-meeting",
  "introducing-yourself-role",
  "giving-erp-project-updates",
  "asking-for-clarification",
  "agreeing-disagreeing",
  "problems-action-items",
  "summarizing-minutes",
];

const LEVELS = new Set(["A1", "A2", "B1", "B2", "C1"]);
const PROCESS_IDS = new Set(["p2p", "o2c", "r2r", "p2produce", "h2r", "cross"]);
// الوحدات الخمس المطلوبة في خطة Phase 04 (يجب أن يغطيها الدروس السبعة معًا).
const REQUIRED_PROCESSES = ["p2p", "o2c", "r2r", "p2produce", "h2r"];
const MEETING_FUNCTIONS = new Set([
  "opening",
  "turn-taking",
  "update",
  "agree",
  "disagree",
  "clarify",
  "action",
  "closing",
]);

const MTG_KEYS = [
  "mtg.notFound",
  "mtg.backToUnit",
  "mtg.lessonsTitle",
  "mtg.lessonLabel",
  "mtg.level",
  "mtg.process",
  "mtg.participants",
  "mtg.role",
  "mtg.section.context",
  "mtg.section.objectives",
  "mtg.section.expressions",
  "mtg.section.dialogue",
  "mtg.section.translation",
  "mtg.section.speaking",
  "mtg.section.vocabulary",
  "mtg.section.comprehension",
  "mtg.section.guided",
  "mtg.section.practiceSpeaking",
  "mtg.section.challenge",
  "mtg.section.quiz",
  "mtg.stage.learn",
  "mtg.stage.learnDesc",
  "mtg.stage.practice",
  "mtg.stage.practiceDesc",
  "mtg.stage.challenge",
  "mtg.stage.challengeDesc",
  "mtg.exprIntro",
  "mtg.exprWhen",
  "mtg.exprWhy",
  "mtg.exprFunction",
  "mtg.function.opening",
  "mtg.function.turn-taking",
  "mtg.function.update",
  "mtg.function.agree",
  "mtg.function.disagree",
  "mtg.function.clarify",
  "mtg.function.action",
  "mtg.function.closing",
  "mtg.dialogueIntro",
  "mtg.dialogueTerms",
  "mtg.playLine",
  "mtg.showTranslation",
  "mtg.hideTranslation",
  "mtg.translationHint",
  "mtg.speakingIntro",
  "mtg.play",
  "mtg.vocabNote",
  "mtg.comprehensionIntro",
  "mtg.guidedFill",
  "mtg.guidedResponses",
  "mtg.guidedOrder",
  "mtg.orderPrompt",
  "mtg.checkOrder",
  "mtg.correctOrder",
  "mtg.wrongOrder",
  "mtg.resetOrder",
  "mtg.moveUp",
  "mtg.moveDown",
  "mtg.chooseBest",
  "mtg.speakingPracticeIntro",
  "mtg.speakingPracticeLimit",
  "mtg.challengeTaskTitle",
  "mtg.checklist",
  "mtg.writeAreaLabel",
  "mtg.writeAreaPlaceholder",
  "mtg.selfAssessNote",
  "mtg.showReference",
  "mtg.hideReference",
  "mtg.referenceAnswerTitle",
];

function expectMcq(item: {
  id: string;
  promptAr?: string;
  promptEn?: string;
  optionsAr: string[];
  optionsEn: string[];
  answerIndex: number;
  explainAr?: string;
  explainEn?: string;
}) {
  expect(item.promptAr && item.promptEn, item.id).toBeTruthy();
  expect(item.optionsAr.length, `${item.id}: options`).toBeGreaterThanOrEqual(2);
  expect(item.optionsAr.length, `${item.id}: parity`).toBe(item.optionsEn.length);
  expect(item.optionsAr.every((o) => Boolean(o)), `${item.id}: options bilingual`).toBe(true);
  expect(item.optionsEn.every((o) => Boolean(o)), `${item.id}: options bilingual en`).toBe(true);
  expect(item.answerIndex, item.id).toBeGreaterThanOrEqual(0);
  expect(item.answerIndex, item.id).toBeLessThan(item.optionsAr.length);
  expect(item.explainAr && item.explainEn, `${item.id}: explain`).toBeTruthy();
}

describe("meetings unit registry (Phase 04)", () => {
  it("has unique ids and slugs with a valid slug format", () => {
    const ids = MEETING_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(MEETING_SLUGS).size).toBe(MEETING_SLUGS.length);
    for (const slug of MEETING_SLUGS) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("provides the seven approved lessons in order", () => {
    expect(READY_MEETING_LESSONS.map((l) => l.slug)).toEqual(APPROVED_SLUGS);
    READY_MEETING_LESSONS.forEach((l, i) => {
      expect(l.order, l.id).toBe(i + 1);
    });
    expect(meetingBySlug("starting-business-meeting")?.id).toBe(
      "mtg-starting-business-meeting"
    );
    expect(meetingBySlug("does-not-exist")).toBeUndefined();
  });

  it("gives every lesson a valid level and process context", () => {
    for (const l of MEETING_LESSONS) {
      expect(LEVELS.has(l.level), `${l.id}:${l.level}`).toBe(true);
      expect(PROCESS_IDS.has(l.processId), `${l.id}:${l.processId}`).toBe(true);
      expect(l.processLabelAr && l.processLabelEn, `${l.id}: process label`).toBeTruthy();
    }
  });

  it("covers all five required ERP processes across the seven lessons", () => {
    const used = new Set(MEETING_LESSONS.map((l) => l.processId));
    for (const p of REQUIRED_PROCESSES) {
      expect(used.has(p), `missing process coverage: ${p}`).toBe(true);
    }
  });

  it("keeps titles, icons and bilingual metadata non-empty", () => {
    for (const l of MEETING_LESSONS) {
      expect(l.icon, l.id).toBeTruthy();
      expect(l.titleAr && l.titleEn, `${l.id}: title`).toBeTruthy();
      expect(l.id.startsWith("mtg-"), `${l.id}: id prefix`).toBe(true);
    }
  });
});

describe("meeting lesson content (Phase 04)", () => {
  it("keeps the scenario and objectives bilingual and balanced", () => {
    for (const l of MEETING_LESSONS) {
      expect(l.scenarioAr && l.scenarioEn, `${l.id}: scenario`).toBeTruthy();
      expect(l.objectivesAr.length, `${l.id}: objectives`).toBeGreaterThanOrEqual(3);
      expect(l.objectivesAr.length, `${l.id}: objectives parity`).toBe(l.objectivesEn.length);
      expect(l.objectivesAr.every((o) => Boolean(o)), `${l.id}: objectives ar`).toBe(true);
      expect(l.objectivesEn.every((o) => Boolean(o)), `${l.id}: objectives en`).toBe(true);
    }
  });

  it("has at least three named participants with roles", () => {
    for (const l of MEETING_LESSONS) {
      expect(l.participants.length, `${l.id}: participants`).toBeGreaterThanOrEqual(3);
      const ids = l.participants.map((p) => p.id);
      expect(new Set(ids).size, `${l.id}: participant ids`).toBe(ids.length);
      for (const p of l.participants) {
        expect(p.nameAr && p.nameEn, `${p.id}: name`).toBeTruthy();
        expect(p.roleAr && p.roleEn, `${p.id}: role`).toBeTruthy();
      }
    }
  });

  it("has a meaningful dialogue whose speakers all resolve", () => {
    for (const l of MEETING_LESSONS) {
      const known = new Set(l.participants.map((p) => p.id));
      const d = l.dialogue;
      expect(d.titleAr && d.titleEn, `${d.id}: title`).toBeTruthy();
      expect(d.lines.length, `${l.id}: dialogue lines`).toBeGreaterThanOrEqual(8);
      const speakers = new Set(d.lines.map((line) => line.speaker));
      expect(speakers.size, `${l.id}: distinct speakers`).toBeGreaterThanOrEqual(3);
      for (const line of d.lines) {
        expect(known.has(line.speaker), `${l.id}: unknown speaker ${line.speaker}`).toBe(true);
        expect(line.en && line.ar, `${l.id}: line bilingual`).toBeTruthy();
      }
      for (const id of d.wordIds ?? []) {
        expect(wordById(id), `${d.id}:${id}`).toBeTruthy();
      }
    }
  });

  it("keeps expressions bilingual with when/why and a valid function", () => {
    for (const l of MEETING_LESSONS) {
      expect(l.expressions.length, l.id).toBeGreaterThanOrEqual(5);
      const ids = l.expressions.map((e) => e.id);
      expect(new Set(ids).size, `${l.id}: expr ids`).toBe(ids.length);
      for (const e of l.expressions) {
        expect(e.en && e.ar, `${e.id}: text`).toBeTruthy();
        expect(e.whenAr && e.whenEn, `${e.id}: when`).toBeTruthy();
        expect(e.whyAr && e.whyEn, `${e.id}: why`).toBeTruthy();
        expect(MEETING_FUNCTIONS.has(e.function), `${e.id}:${e.function}`).toBe(true);
        if (e.wordId) {
          expect(wordById(e.wordId), `${e.id}:${e.wordId}`).toBeTruthy();
        }
      }
    }
  });

  it("keeps speaking phrases bilingual with tips", () => {
    for (const l of MEETING_LESSONS) {
      expect(l.speaking.length, l.id).toBeGreaterThanOrEqual(4);
      const ids = l.speaking.map((s) => s.id);
      expect(new Set(ids).size, `${l.id}: speaking ids`).toBe(ids.length);
      for (const s of l.speaking) {
        expect(s.en && s.ar, `${s.id}: text`).toBeTruthy();
        expect(s.tipAr && s.tipEn, `${s.id}: tip`).toBeTruthy();
      }
    }
  });

  it("links only existing WORDS ids", () => {
    for (const l of MEETING_LESSONS) {
      expect(l.wordIds.length, `${l.id}: wordIds`).toBeGreaterThan(0);
      expect(new Set(l.wordIds).size, `${l.id}: unique wordIds`).toBe(l.wordIds.length);
      for (const id of l.wordIds) {
        expect(wordById(id), `${l.id}:${id}`).toBeTruthy();
      }
    }
  });

  it("keeps comprehension questions well-formed", () => {
    for (const l of MEETING_LESSONS) {
      expect(l.comprehension.length, `${l.id}: comprehension`).toBeGreaterThanOrEqual(3);
      const ids = l.comprehension.map((c) => c.id);
      expect(new Set(ids).size, `${l.id}: comprehension ids`).toBe(ids.length);
      for (const c of l.comprehension) expectMcq(c);
    }
  });

  it("keeps guided practice at 2 completions, 2 responses and 1 ordering", () => {
    for (const l of MEETING_LESSONS) {
      expect(l.guided.fillBlanks.length, `${l.id}: completions`).toBeGreaterThanOrEqual(2);
      expect(l.guided.responses.length, `${l.id}: responses`).toBeGreaterThanOrEqual(2);
      expect(l.guided.order.length, `${l.id}: ordering`).toBeGreaterThanOrEqual(5);

      const fillIds = l.guided.fillBlanks.map((f) => f.id);
      expect(new Set(fillIds).size, `${l.id}: fill ids`).toBe(fillIds.length);
      for (const f of l.guided.fillBlanks) expectMcq(f);

      const resIds = l.guided.responses.map((r) => r.id);
      expect(new Set(resIds).size, `${l.id}: response ids`).toBe(resIds.length);
      for (const r of l.guided.responses) {
        expect(r.situationAr && r.situationEn, `${r.id}: situation`).toBeTruthy();
        expect(r.optionsAr.length, `${r.id}: options`).toBeGreaterThanOrEqual(2);
        expect(r.optionsAr.length, `${r.id}: parity`).toBe(r.optionsEn.length);
        expect(r.answerIndex, r.id).toBeGreaterThanOrEqual(0);
        expect(r.answerIndex, r.id).toBeLessThan(r.optionsAr.length);
        expect(r.explainAr && r.explainEn, `${r.id}: explain`).toBeTruthy();
      }

      const orderIds = l.guided.order.map((o) => o.id);
      expect(new Set(orderIds).size, `${l.id}: order ids`).toBe(orderIds.length);
      for (const o of l.guided.order) {
        expect(o.labelAr && o.labelEn, `${o.id}: label`).toBeTruthy();
      }
    }
  });

  it("keeps the meeting challenge bilingual with a hidden-by-design reference", () => {
    for (const l of MEETING_LESSONS) {
      expect(l.challengeTaskAr && l.challengeTaskEn, `${l.id}: challenge task`).toBeTruthy();
      expect(l.checklistAr.length, `${l.id}: checklist`).toBeGreaterThanOrEqual(4);
      expect(l.checklistAr.length, `${l.id}: checklist parity`).toBe(l.checklistEn.length);
      expect(l.referenceAnswerAr && l.referenceAnswerEn, `${l.id}: reference`).toBeTruthy();
    }
  });

  it("keeps the knowledge check well-formed and bilingual", () => {
    for (const l of MEETING_LESSONS) {
      expect(l.quiz.length, `${l.id}: quiz`).toBeGreaterThanOrEqual(5);
      expect(l.quiz.length, `${l.id}: quiz max`).toBeLessThanOrEqual(6);
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

describe("meetings i18n coverage (Phase 04)", () => {
  it("defines every required mtg.* key in both Arabic and English", () => {
    for (const key of MTG_KEYS) {
      expect(DICTS.ar[key], `ar missing: ${key}`).toBeTruthy();
      expect(DICTS.en[key], `en missing: ${key}`).toBeTruthy();
    }
  });

  it("keeps English distinct from Arabic for the translated labels", () => {
    // يكشف المفاتيح المكتوبة بالعربية في القاموس الإنجليزي بالخطأ.
    const suspicious = MTG_KEYS.filter(
      (k) => DICTS.en[k] === DICTS.ar[k] && !DICTS.en[k].startsWith("{")
    );
    expect(suspicious).toEqual([]);
  });

  it("has an equal number of mtg.* keys in both dictionaries", () => {
    const arCount = Object.keys(DICTS.ar).filter((k) => k.startsWith("mtg.")).length;
    const enCount = Object.keys(DICTS.en).filter((k) => k.startsWith("mtg.")).length;
    expect(arCount).toBe(enCount);
    expect(arCount).toBeGreaterThanOrEqual(60);
  });
});
