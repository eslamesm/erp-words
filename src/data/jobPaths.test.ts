import { describe, it, expect } from "vitest";
import {
  JOB_PATHS,
  JOB_PATH_SLUGS,
  READY_JOB_PATHS,
  jobPathBySlug,
  readyJobPathBySlug,
  jobLessonSlugs,
  jobLessonBySlug,
  type JobLesson,
  type JobPath,
} from "@/data/jobPaths";
import { wordById } from "@/data/words";
import { processById } from "@/data/processes";
import { SUB_MODULE_ID_SET } from "@/data/subModules";
import { BUSINESS_FUNCTION_ID_SET } from "@/data/businessFunctions";
import { emailBySlug } from "@/data/professionalEnglish";
import { meetingBySlug } from "@/data/meetings";
import { CAREER_PATHS_ALL } from "@/data/careerPaths";

const LEVELS = new Set(["A1", "A2", "B1", "B2", "C1"]);
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CAREER_PATH_IDS = new Set(CAREER_PATHS_ALL.map((p) => p.id));

const allLessons = (): JobLesson[] => JOB_PATHS.flatMap((p) => p.lessons);

describe("job paths (Phase 05)", () => {
  it("has unique path ids and slugs with a valid slug format", () => {
    const ids = JOB_PATHS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(JOB_PATH_SLUGS).size).toBe(JOB_PATH_SLUGS.length);
    for (const slug of JOB_PATH_SLUGS) {
      expect(slug, slug).toMatch(SLUG_RE);
    }
  });

  it("uses a valid status and keeps the ready set in sync with the paths", () => {
    for (const p of JOB_PATHS) {
      expect(["ready", "planned"], p.id).toContain(p.status);
    }
    // Multi-path ready: the ready list is derived from status, not hardcoded to one path.
    const expectedReady = JOB_PATHS.filter((p) => p.status === "ready").map((p) => p.slug);
    expect(READY_JOB_PATHS.map((p) => p.slug)).toEqual(expectedReady);
    expect(READY_JOB_PATHS.every((p) => p.status === "ready")).toBe(true);
  });

  it("validates the pilot path without assuming it is the only path", () => {
    const pilot = jobPathBySlug("erp-functional-consultant");
    expect(pilot, "pilot path must exist").toBeTruthy();
    expect(pilot?.status).toBe("ready");
    expect(pilot?.lessons.length).toBe(12);
    // The validator must work for every path, not just index 0.
    for (const p of JOB_PATHS) {
      expect(p.lessons.length, p.id).toBeGreaterThan(0);
      const orders = p.lessons.map((l) => l.order);
      expect(orders, p.id).toEqual(orders.slice().sort((a, b) => a - b));
    }
  });

  it("provides required bilingual metadata on every path", () => {
    for (const p of JOB_PATHS) {
      expect(p.icon, p.id).toBeTruthy();
      expect(p.titleAr && p.titleEn, p.id).toBeTruthy();
      expect(p.summaryAr && p.summaryEn, p.id).toBeTruthy();
      expect(p.descAr && p.descEn, p.id).toBeTruthy();
      expect(LEVELS.has(p.level), p.id).toBe(true);
      expect(p.learningObjectivesAr.length, p.id).toBeGreaterThan(0);
      expect(p.learningObjectivesAr.length, p.id).toBe(p.learningObjectivesEn.length);
      expect(p.lessons.length, p.id).toBeGreaterThan(0);
    }
  });

  it("links every path to an existing career path by id only", () => {
    for (const p of JOB_PATHS) {
      if (p.careerPathId) {
        expect(CAREER_PATH_IDS.has(p.careerPathId), p.id).toBe(true);
      }
    }
    expect(jobPathBySlug("erp-functional-consultant")?.careerPathId).toBe("functional-consultant");
  });
});

describe("job lessons (Phase 05)", () => {
  it("has unique ids and slugs with a valid slug format", () => {
    const lessons = allLessons();
    const ids = lessons.map((l) => l.id);
    const slugs = lessons.map((l) => l.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug, slug).toMatch(SLUG_RE);
    }
  });

  it("orders the pilot lessons 1..12 sequentially", () => {
    const lessons = jobPathBySlug("erp-functional-consultant")!.lessons;
    expect(lessons.length).toBe(12);
    lessons.forEach((l, i) => {
      expect(l.order, l.id).toBe(i + 1);
    });
    expect(lessons[0].slug).toBe("understanding-client-business");
    expect(lessons[11].slug).toBe("preparing-for-go-live");
  });

  it("provides required bilingual metadata on every lesson", () => {
    for (const l of allLessons()) {
      expect(l.icon, l.id).toBeTruthy();
      expect(l.titleAr && l.titleEn, l.id).toBeTruthy();
      expect(l.scenarioAr && l.scenarioEn, l.id).toBeTruthy();
      expect(LEVELS.has(l.level), l.id).toBe(true);
      expect(l.objectivesAr.length, l.id).toBeGreaterThan(0);
      expect(l.objectivesAr.length, l.id).toBe(l.objectivesEn.length);
    }
  });

  it("keeps every ref pointing at an existing id", () => {
    for (const l of allLessons()) {
      const refs = l.refs;
      for (const id of refs.processIds ?? []) {
        expect(processById(id), `${l.id} → process ${id}`).toBeTruthy();
      }
      for (const id of refs.subModuleIds ?? []) {
        expect(SUB_MODULE_ID_SET.has(id), `${l.id} → subModule ${id}`).toBe(true);
      }
      for (const id of refs.businessFunctionIds ?? []) {
        expect(BUSINESS_FUNCTION_ID_SET.has(id), `${l.id} → businessFunction ${id}`).toBe(true);
      }
      for (const id of [...(refs.wordIds ?? []), ...(refs.screenIds ?? [])]) {
        expect(wordById(id), `${l.id} → word ${id}`).toBeTruthy();
      }
      for (const slug of refs.emailLessonSlugs ?? []) {
        expect(emailBySlug(slug), `${l.id} → email ${slug}`).toBeTruthy();
      }
      for (const slug of refs.meetingLessonSlugs ?? []) {
        expect(meetingBySlug(slug), `${l.id} → meeting ${slug}`).toBeTruthy();
      }
    }
  });

  it("only links quiz questions to existing words", () => {
    const allQuiz = [
      ...allLessons().flatMap((l) => l.quiz),
      ...JOB_PATHS.flatMap((p) => p.assessment.quiz),
    ];
    for (const q of allQuiz) {
      if (q.wordId) {
        expect(wordById(q.wordId), `${q.id} → word ${q.wordId}`).toBeTruthy();
      }
    }
  });
});

describe("job lesson practice (Phase 05)", () => {
  it("gives every lesson a complete practice block", () => {
    for (const l of allLessons()) {
      const p = l.practice;
      expect(p.mcqs && p.mcqs.length, l.id).toBeGreaterThan(0);
      expect(p.responses && p.responses.length, l.id).toBeGreaterThan(0);
      expect(p.order && p.order.length, l.id).toBeGreaterThan(0);
      expect(p.phrases && p.phrases.length, l.id).toBeGreaterThan(0);
    }
  });

  it("keeps mcq and response options bilingual with a valid answer", () => {
    for (const l of allLessons()) {
      for (const q of l.practice.mcqs ?? []) {
        expect(q.promptAr && q.promptEn, q.id).toBeTruthy();
        expect(q.optionsAr.length, q.id).toBe(q.optionsEn.length);
        expect(q.answerIndex, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex, q.id).toBeLessThan(q.optionsAr.length);
      }
      for (const r of l.practice.responses ?? []) {
        expect(r.situationAr && r.situationEn, r.id).toBeTruthy();
        expect(r.optionsAr.length, r.id).toBe(r.optionsEn.length);
        expect(r.answerIndex, r.id).toBeGreaterThanOrEqual(0);
        expect(r.answerIndex, r.id).toBeLessThan(r.optionsAr.length);
      }
    }
  });

  it("provides ordered steps and speaking phrases with tips", () => {
    for (const l of allLessons()) {
      for (const o of l.practice.order ?? []) {
        expect(o.labelAr && o.labelEn, o.id).toBeTruthy();
      }
      for (const s of l.practice.phrases ?? []) {
        expect(s.en && s.ar, s.id).toBeTruthy();
        expect(s.tipAr && s.tipEn, s.id).toBeTruthy();
      }
    }
  });
});

describe("job assessment (Phase 05)", () => {
  const assessment = jobPathBySlug("erp-functional-consultant")!.assessment;

  it("has a well-formed quiz", () => {
    expect(assessment.quiz.length).toBeGreaterThan(0);
    const ids = assessment.quiz.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of assessment.quiz) {
      expect(q.promptAr && q.promptEn, q.id).toBeTruthy();
      expect(q.optionsAr.length, q.id).toBe(q.optionsEn.length);
      expect(q.optionsAr.length, q.id).toBeGreaterThan(1);
      expect(q.answerIndex, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex, q.id).toBeLessThan(q.optionsAr.length);
    }
  });

  it("has optional responses and speaking phrases with tips", () => {
    for (const r of assessment.responses ?? []) {
      expect(r.situationAr && r.situationEn, r.id).toBeTruthy();
      expect(r.optionsAr.length, r.id).toBe(r.optionsEn.length);
    }
    for (const s of assessment.speaking ?? []) {
      expect(s.en && s.ar, s.id).toBeTruthy();
      expect(s.tipAr && s.tipEn, s.id).toBeTruthy();
    }
  });
});

describe("job path helpers (Phase 05)", () => {
  it("exposes consistent slug and lookup helpers", () => {
    expect(JOB_PATH_SLUGS).toEqual(JOB_PATHS.map((p) => p.slug));
    expect(jobPathBySlug("erp-functional-consultant")?.id).toBe("job-erp-functional-consultant");
    expect(jobPathBySlug("does-not-exist")).toBeUndefined();
  });

  it("lists and looks up lessons within a path", () => {
    const path: JobPath = jobPathBySlug("erp-functional-consultant")!;
    expect(jobLessonSlugs(path)).toEqual(path.lessons.map((l) => l.slug));
    expect(jobLessonBySlug(path, "gathering-requirements")?.order).toBe(3);
    expect(jobLessonBySlug(path, "does-not-exist")).toBeUndefined();
  });
});

// ───────── Phase 05.6 regression guards ─────────

// Every answer-option item in the curriculum: practice MCQs, lesson quiz questions,
// assessment quiz questions, AND option-based written responses (practice + assessment).
// Response activities share the question shape (optionsAr/optionsEn + answerIndex), so
// they are collected here too. Order in optionsAr mirrors optionsEn 1:1, so a single
// answerIndex applies to both languages.
function collectAnswerOptionItems() {
  const items: { id: string; optionsAr: string[]; optionsEn: string[]; answerIndex: number }[] = [];
  for (const l of allLessons()) {
    for (const q of l.practice.mcqs ?? []) items.push(q);
    for (const r of l.practice.responses ?? []) items.push(r);
    for (const q of l.quiz) items.push(q);
  }
  for (const p of JOB_PATHS) {
    for (const q of p.assessment.quiz) items.push(q);
    for (const r of p.assessment.responses ?? []) items.push(r);
  }
  return items;
}

// Derived count invariant: recompute the same collection straight from the live
// JOB_PATHS structure. Keeps the reviewed literal honest and fails loudly (rather
// than silently) if a future path is added without updating the total.
function countAnswerOptionItems(): number {
  let n = 0;
  for (const p of JOB_PATHS) {
    for (const l of p.lessons) {
      n += (l.practice.mcqs ?? []).length;
      n += (l.practice.responses ?? []).length;
      n += l.quiz.length;
    }
    n += p.assessment.quiz.length;
    n += (p.assessment.responses ?? []).length;
  }
  return n;
}

describe("Phase 05.6 — answer positions (Task 1)", () => {
  const items = collectAnswerOptionItems();

  it("covers all 530 answer-option items across the five paths", () => {
    // 5 paths × 106: pilot + accountant + procurement-specialist + manufacturing-planner + warehouse-officer.
    expect(items.length).toBe(530);
    // Self-check against the live structure so a new path cannot slip in silently.
    expect(items.length).toBe(countAnswerOptionItems());
  });

  it("keeps every answerIndex within bounds and options aligned across languages", () => {
    for (const it of items) {
      expect(it.answerIndex, it.id).toBeGreaterThanOrEqual(0);
      expect(it.answerIndex, it.id).toBeLessThan(it.optionsEn.length);
      expect(it.optionsAr.length, it.id).toBe(it.optionsEn.length);
      expect(it.optionsEn.length, it.id).toBeGreaterThan(1);
    }
  });

  it("keeps every option inside an item distinct (no rotation corruption)", () => {
    for (const it of items) {
      expect(new Set(it.optionsEn).size, `${it.id} en`).toBe(it.optionsEn.length);
      expect(new Set(it.optionsAr).size, `${it.id} ar`).toBe(it.optionsAr.length);
    }
  });

  it("distributes correct answers across all four positions (no universal index 0)", () => {
    const dist: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    for (const it of items) dist[it.answerIndex] = (dist[it.answerIndex] ?? 0) + 1;
    expect(dist[0], "index 0 must not hold every answer").toBeLessThan(items.length);
    for (const pos of [0, 1, 2, 3]) {
      expect(dist[pos], `position ${pos}`).toBeGreaterThan(0);
    }
  });

  it("keeps the four positions reasonably balanced (max−min gap small)", () => {
    const dist: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    for (const it of items) dist[it.answerIndex] = (dist[it.answerIndex] ?? 0) + 1;
    const values = [dist[0], dist[1], dist[2], dist[3]];
    const gap = Math.max(...values) - Math.min(...values);
    expect(gap, `distribution ${JSON.stringify(dist)}`).toBeLessThanOrEqual(5);
  });
});

describe("Phase 05.6 — Lesson 11 UAT wording (Task 2)", () => {
  const lesson = jobLessonBySlug(
    jobPathBySlug("erp-functional-consultant")!,
    "performing-user-acceptance-testing"
  )!;

  it("exists and its quiz no longer references developer vocabulary", () => {
    expect(lesson).toBeTruthy();
    const corpus = [
      ...lesson.quiz.flatMap((q) => [q.promptEn, q.promptAr, ...q.optionsEn, ...q.optionsAr]),
      ...(lesson.refs.wordIds ?? []),
      ...lesson.quiz.flatMap((q) => (q.wordId ? [q.wordId] : [])),
    ]
      .join(" ")
      .toLowerCase();
    for (const banned of ["regression testing", "assertion", "integration test", "coverage", "dev-"]) {
      expect(corpus, banned).not.toContain(banned);
    }
  });

  it("tests functional UAT concepts in the quiz", () => {
    const corpus = lesson.quiz
      .flatMap((q) => [q.promptEn, ...q.optionsEn])
      .join(" ")
      .toLowerCase();
    for (const term of [
      "test case",
      "expected result",
      "actual result",
      "defect",
      "acceptance criteria",
      "sign-off",
    ]) {
      expect(corpus, term).toContain(term);
    }
  });
});

describe("Phase 05.6 — Arabic response translations (Task 3)", () => {
  const ARABIC_RE = /[\u0600-\u06FF]/;
  const LATIN_WORD_RE = /[A-Za-z]{3,}/;

  const findResponse = (id: string) => {
    for (const l of allLessons()) {
      const r = (l.practice.responses ?? []).find((x) => x.id === id);
      if (r) return r.optionsAr;
    }
    for (const p of JOB_PATHS) {
      const r = (p.assessment.responses ?? []).find((x) => x.id === id);
      if (r) return r.optionsAr;
    }
    return undefined;
  };

  for (const id of ["jf10-rs1", "jf11-rs1", "jf12-rs1", "jf-assess-rs1"]) {
    it(`keeps ${id} Arabic options fully translated`, () => {
      const arr = findResponse(id);
      expect(arr, id).toBeTruthy();
      for (const opt of arr!) {
        expect(ARABIC_RE.test(opt), `${id} → ${opt}`).toBe(true);
        expect(LATIN_WORD_RE.test(opt), `${id} → untranslated: ${opt}`).toBe(false);
      }
    });
  }
});

describe("Phase 05.6 — assessment coverage (Task 4)", () => {
  const pilot = jobPathBySlug("erp-functional-consultant")!;
  const assessment = pilot.assessment;

  it("keeps the assessment length stable", () => {
    expect(assessment.quiz.length).toBe(8);
  });

  it("samples lessons 1–9 and stays clear of over-representing later lessons", () => {
    // Explicit intent map: which pilot lesson each assessment question draws on.
    // Kept next to the data so a rebalance that drifts back to L11/L12 is caught.
    const lessonByQuestion: Record<string, number> = {
      "jf-assess-q1": 1, // understanding the client's business
      "jf-assess-q2": 3, // gathering requirements
      "jf-assess-q3": 9, // user training
      "jf-assess-q4": 4, // as-is process analysis
      "jf-assess-q5": 5, // gap / fit-gap
      "jf-assess-q6": 6, // explaining decisions to stakeholders
      "jf-assess-q7": 7, // module configuration
      "jf-assess-q8": 8, // functional documentation
    };
    const ids = assessment.quiz.map((q) => q.id).sort();
    expect(ids).toEqual(Object.keys(lessonByQuestion).sort());
    const lessonsUsed = Object.values(lessonByQuestion);
    for (const order of lessonsUsed) {
      expect(order, "assessment must sample lessons 1–9").toBeGreaterThanOrEqual(1);
      expect(order, "assessment must sample lessons 1–9").toBeLessThanOrEqual(9);
    }
    // No lesson appears more than once (no over-representation of a subset).
    expect(new Set(lessonsUsed).size).toBe(lessonsUsed.length);
  });

  it("does not repeat the same correct answer text within the assessment", () => {
    const answers = assessment.quiz.map((q) => q.optionsEn[q.answerIndex]);
    expect(new Set(answers).size).toBe(answers.length);
  });

  it("resolves every assessment question reference", () => {
    for (const q of assessment.quiz) {
      if (q.wordId) {
        expect(wordById(q.wordId), `${q.id} → word ${q.wordId}`).toBeTruthy();
      }
    }
  });
});

describe("Phase 05.7 — assessment semantic answer keys", () => {
  const pilot = jobPathBySlug("erp-functional-consultant")!;
  const assessment = pilot.assessment;
  const byId = new Map(assessment.quiz.map((q) => [q.id, q]));

  // Semantic answer-key fixture: the exact answer text each question must resolve to,
  // in both languages. Pinning the TEXT (not just the index) means a drift of answerIndex,
  // an option reorder, or a wrong option will fail even if the index looks "in bounds".
  const ANSWER_KEY: Record<
    string,
    { en: string; ar: string; lesson: string }
  > = {
    "jf-assess-q1": {
      en: "Understanding the business cycle and stakeholders before proposing any solution.",
      ar: "فهم دورة العمل وأصحاب المصلحة قبل اقتراح أي حل.",
      lesson: "L1 understanding the client's business",
    },
    "jf-assess-q2": {
      en: "To identify what the business truly needs and map it to the right solution.",
      ar: "لتحديد ما يحتاجه العمل فعلًا ومطابقته بالحل المناسب.",
      lesson: "L3 gathering requirements",
    },
    "jf-assess-q3": {
      en: "Training the user on their daily tasks in the system with scenarios from their work.",
      ar: "تدريب المستخدم على مهامه اليومية داخل النظام بسيناريوهات من عمله.",
      lesson: "L9 user training",
    },
    "jf-assess-q4": {
      en: "Describing the current state exactly as it is, before any improvement.",
      ar: "وصف الوضع الحالي كما هو قبل أي تحسين.",
      lesson: "L4 as-is process analysis",
    },
    "jf-assess-q5": {
      en: "The difference between what happens now and what should happen with the solution.",
      ar: "الفرق بين ما يحدث الآن وما ينبغي أن يحدث بالحل.",
      lesson: "L5 business gap",
    },
    "jf-assess-q6": {
      en: "Link the decision to its effect on daily work in simple language.",
      ar: "اربط القرار بأثره على العمل اليومي بلغة بسيطة.",
      lesson: "L6 explaining a functional decision",
    },
    "jf-assess-q7": {
      en: "Tailoring the module's standard functions to the client's processes without code changes.",
      ar: "ملاءمة وظائف الوحدة القياسية لعمليات العميل دون تعديل برمجي.",
      lesson: "L7 module configuration",
    },
    "jf-assess-q8": {
      en: "A description of the process, the decision, the impact and the next step.",
      ar: "وصف العملية والقرار والأثر والخطوة التالية.",
      lesson: "L8 functional documentation",
    },
  };

  it("covers the eight assessment questions exactly", () => {
    expect([...byId.keys()].sort()).toEqual(Object.keys(ANSWER_KEY).sort());
  });

  it("resolves every answerIndex to the intended English answer text", () => {
    for (const [id, expected] of Object.entries(ANSWER_KEY)) {
      const q = byId.get(id)!;
      expect(q.answerIndex, `${id} bounds`).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex, `${id} bounds`).toBeLessThan(q.optionsEn.length);
      expect(q.optionsEn[q.answerIndex], `${id} (${expected.lesson})`).toBe(expected.en);
    }
  });

  it("resolves every answerIndex to the intended Arabic answer text", () => {
    for (const [id, expected] of Object.entries(ANSWER_KEY)) {
      const q = byId.get(id)!;
      expect(q.optionsAr[q.answerIndex], `${id} (${expected.lesson})`).toBe(expected.ar);
    }
  });

  it("keeps bilingual options aligned in count and order", () => {
    for (const q of assessment.quiz) {
      expect(q.optionsAr.length, `${q.id} length`).toBe(q.optionsEn.length);
    }
  });

  it("keeps the English and Arabic correct options semantically paired", () => {
    // The correct option must occupy the same position in both languages, and the
    // Arabic answer must be the translation of the English answer (both pinned by ANSWER_KEY).
    for (const [id, expected] of Object.entries(ANSWER_KEY)) {
      const q = byId.get(id)!;
      expect(q.optionsEn[q.answerIndex], `${id} en`).toBe(expected.en);
      expect(q.optionsAr[q.answerIndex], `${id} ar`).toBe(expected.ar);
      // The correct option must be unique in each language (no duplicate option).
      expect(new Set(q.optionsEn).size, `${id} en distinct`).toBe(q.optionsEn.length);
      expect(new Set(q.optionsAr).size, `${id} ar distinct`).toBe(q.optionsAr.length);
    }
  });

  it("keeps explanations non-empty and consistent with the answer in both languages", () => {
    const ARABIC_RE = /[\u0600-\u06FF]/;
    for (const [id] of Object.entries(ANSWER_KEY)) {
      const q = byId.get(id)!;
      const explainEn = q.explainEn ?? "";
      const explainAr = q.explainAr ?? "";
      expect(explainEn.length, `${id} explainEn`).toBeGreaterThan(0);
      expect(explainAr.length, `${id} explainAr`).toBeGreaterThan(0);
      // Explanations must be in the matching language.
      expect(ARABIC_RE.test(explainAr), `${id} explainAr is Arabic`).toBe(true);
      expect(ARABIC_RE.test(explainEn), `${id} explainEn is not Arabic`).toBe(false);
    }
  });

  it("does not allow the correct answer to fall on a duplicate option position", () => {
    // Guard against a future rotation that would re-introduce the Phase 05.6 defect:
    // the option at answerIndex must not be a known distractor phrasing.
    const DISTRACTOR_FRAGMENTS = [
      "postponing training",
      "only sending a written guide",
      "explaining the source code",
      "shortage in the team size",
      "network problem",
      "programming error",
      "avoid the explanation",
      "change the system interface",
      "company logo",
      "list of attendees only",
    ];
    for (const q of assessment.quiz) {
      const answer = q.optionsEn[q.answerIndex].toLowerCase();
      for (const frag of DISTRACTOR_FRAGMENTS) {
        expect(answer, `${q.id} must not mark a distractor as correct: ${frag}`).not.toContain(frag);
      }
    }
  });
});

describe("Phase 05.6 — planned-path visibility (Task 6)", () => {
  it("exposes only ready paths through READY_JOB_PATHS", () => {
    for (const p of READY_JOB_PATHS) {
      expect(p.status, p.id).toBe("ready");
    }
    const planned = JOB_PATHS.filter((p) => p.status === "planned");
    for (const p of planned) {
      expect(READY_JOB_PATHS.some((r) => r.slug === p.slug), p.id).toBe(false);
    }
  });

  it("pins the exact planned-path slug set", () => {
    // Procurement-specialist was released in Phase 10.3; manufacturing-planner
    // and warehouse-officer remain planned.
    // Assert the SET (not just a count) so no unexpected planned path is accepted.
    const planned = JOB_PATHS.filter((p) => p.status === "planned").map((p) => p.slug).sort();
    expect(planned).toEqual([
      "manufacturing-planner",
      "warehouse-officer",
    ]);
  });

  it("pins the exact ready-path slug set", () => {
    const ready = READY_JOB_PATHS.map((p) => p.slug).sort();
    expect(ready).toEqual([
      "erp-accountant",
      "erp-functional-consultant",
      "procurement-specialist",
    ]);
  });

  it("keeps planned paths out of the shipped release", () => {
    // The ready list is derived from status: total paths exceed the ready set by the
    // planned ones, and every planned path stays hidden from READY_JOB_PATHS.
    const planned = JOB_PATHS.filter((p) => p.status === "planned");
    expect(JOB_PATHS.length).toBe(READY_JOB_PATHS.length + planned.length);
    for (const p of planned) {
      expect(READY_JOB_PATHS.some((r) => r.slug === p.slug), p.id).toBe(false);
    }
  });
});

describe("Phase 07.4.2 — readyJobPathBySlug readiness gate", () => {
  it("resolves ready paths and reports their status as ready", () => {
    const accountant = readyJobPathBySlug("erp-accountant");
    const consultant = readyJobPathBySlug("erp-functional-consultant");
    expect(accountant).toBeDefined();
    expect(consultant).toBeDefined();
    expect(accountant!.status).toBe("ready");
    expect(consultant!.status).toBe("ready");
  });

  it("returns undefined for a still-planned path", () => {
    expect(readyJobPathBySlug("manufacturing-planner")).toBeUndefined();
    // The gate must not be what makes a planned path invisible: it stays in JOB_PATHS.
    expect(jobPathBySlug("manufacturing-planner")).toBeDefined();
    expect(jobPathBySlug("manufacturing-planner")!.status).toBe("planned");
  });

  it("now resolves the released procurement path", () => {
    expect(readyJobPathBySlug("procurement-specialist")).toBeDefined();
    expect(readyJobPathBySlug("procurement-specialist")!.status).toBe("ready");
  });

  it("returns undefined for unknown slugs", () => {
    expect(readyJobPathBySlug("does-not-exist")).toBeUndefined();
    // Existing resolver behavior for unknown slugs is unchanged.
    expect(jobPathBySlug("does-not-exist")).toBeUndefined();
  });

  it("preserves ready-path lesson data and planned-path structure", () => {
    for (const p of READY_JOB_PATHS) {
      const ready = readyJobPathBySlug(p.slug)!;
      expect(ready.lessons.length, p.slug).toBe(p.lessons.length);
      expect(jobLessonSlugs(ready)).toEqual(jobLessonSlugs(p));
    }
    const procurement = jobPathBySlug("procurement-specialist")!;
    expect(procurement.lessons).toHaveLength(12);
    const activityCount =
      procurement.assessment.quiz.length +
      (procurement.assessment.responses?.length ?? 0) +
      (procurement.assessment.speaking?.length ?? 0);
    expect(activityCount).toBe(13);
  });
});

// ═══════════════ Phase 06 — مسار محاسب ERP (ERP Accountant) ═══════════════

describe("Phase 06 — erp-accountant path shape", () => {
  const path = jobPathBySlug("erp-accountant")!;

  it("exists with the expected identity and metadata", () => {
    expect(path).toBeTruthy();
    expect(path.id).toBe("job-erp-accountant");
    expect(path.status).toBe("ready");
    expect(path.level).toBe("B2");
    expect(path.titleEn).toBe("ERP Accountant");
    expect(path.icon).toBeTruthy();
    expect(path.summaryAr && path.summaryEn, "summary").toBeTruthy();
    expect(path.descAr && path.descEn, "desc").toBeTruthy();
    expect(path.learningObjectivesAr.length).toBeGreaterThan(0);
    expect(path.learningObjectivesAr.length).toBe(path.learningObjectivesEn.length);
  });

  it("does not link to a career path (ownership boundary)", () => {
    expect(path.careerPathId).toBeUndefined();
  });

  it("has exactly 12 lessons ordered 1..12 with the approved slugs", () => {
    expect(path.lessons.length).toBe(12);
    path.lessons.forEach((l, i) => {
      expect(l.order, l.id).toBe(i + 1);
      expect(l.level, l.id).toBe("B2");
    });
    expect(path.lessons.map((l) => l.slug)).toEqual([
      "understanding-accountant-role",
      "understanding-chart-of-accounts",
      "recording-journal-entries",
      "managing-accounts-payable",
      "managing-accounts-receivable",
      "managing-tax-compliance",
      "performing-bank-reconciliation",
      "reviewing-general-ledger",
      "managing-accruals-adjustments",
      "preparing-monthly-closing",
      "reviewing-financial-statements",
      "communicating-accounting-issues",
    ]);
  });

  it("is included in the ready set alongside the pilot", () => {
    expect(READY_JOB_PATHS.map((p) => p.slug).sort()).toEqual(
      ["erp-accountant", "erp-functional-consultant", "procurement-specialist"].sort()
    );
  });
});

describe("Phase 06 — erp-accountant lesson refs", () => {
  const path = jobPathBySlug("erp-accountant")!;
  const bySlug = new Map(path.lessons.map((l) => [l.slug, l]));

  // Approved reference map (ticket §4). Pinned so a drift of a ref is caught.
  const EXPECTED_REFS: Record<
    string,
    {
      processIds?: string[];
      subModuleIds?: string[];
      businessFunctionIds?: string[];
      wordIds?: string[];
      emailLessonSlugs?: string[];
      meetingLessonSlugs?: string[];
    }
  > = {
    "understanding-accountant-role": {
      processIds: ["r2r"],
      subModuleIds: ["finance-gl"],
      wordIds: [
        "journal-entry",
        "ledger",
        "chart-of-accounts",
        "general-ledger",
        "accounts-payable",
        "accounts-receivable",
      ],
      meetingLessonSlugs: ["introducing-yourself-role"],
    },
    "understanding-chart-of-accounts": {
      processIds: ["r2r"],
      subModuleIds: ["finance-gl"],
      businessFunctionIds: ["finance-gl-create-journal"],
      wordIds: ["chart-of-accounts", "ledger", "cost-center", "general-ledger"],
    },
    "recording-journal-entries": {
      processIds: ["r2r"],
      subModuleIds: ["finance-gl"],
      businessFunctionIds: ["finance-gl-create-journal", "finance-gl-post-entry"],
      wordIds: ["journal-entry", "debit", "credit", "post", "voucher"],
      meetingLessonSlugs: ["asking-for-clarification"],
    },
    "managing-accounts-payable": {
      processIds: ["p2p"],
      subModuleIds: ["finance-ap", "purchasing-vendor-bills"],
      businessFunctionIds: ["finance-ap-register-bill", "finance-ap-pay-vendor"],
      wordIds: [
        "invoice",
        "voucher",
        "three-way-match",
        "purchase-order",
        "goods-receipt",
        "accounts-payable",
      ],
      emailLessonSlugs: ["invoice-discrepancy", "supplier-follow-up"],
    },
    "managing-accounts-receivable": {
      processIds: ["o2c"],
      subModuleIds: ["finance-ar"],
      businessFunctionIds: ["finance-ar-create-invoice", "finance-ar-receive-payment"],
      wordIds: ["invoice", "aging", "credit-limit", "accounts-receivable"],
      emailLessonSlugs: ["payment-reminder", "customer-order-confirmation"],
    },
    "managing-tax-compliance": {
      processIds: [],
      subModuleIds: ["finance-tax"],
      businessFunctionIds: [],
      wordIds: ["fld-tax", "tax-invoice", "vat", "input-tax", "output-tax", "tax-report"],
      emailLessonSlugs: ["invoice-discrepancy"],
    },
    "performing-bank-reconciliation": {
      processIds: ["r2r"],
      subModuleIds: ["finance-bank"],
      wordIds: ["reconciliation", "ledger", "audit-trail", "bank-reconciliation"],
      meetingLessonSlugs: ["problems-action-items"],
    },
    "reviewing-general-ledger": {
      processIds: ["r2r"],
      subModuleIds: ["finance-gl"],
      businessFunctionIds: ["finance-gl-reverse-entry"],
      wordIds: ["ledger", "chart-of-accounts", "audit-trail", "post", "general-ledger"],
      meetingLessonSlugs: ["summarizing-minutes"],
    },
    "managing-accruals-adjustments": {
      processIds: ["r2r"],
      subModuleIds: ["finance-gl", "finance-fixed-assets"],
      businessFunctionIds: ["assets-depreciation-run"],
      wordIds: [
        "accrual",
        "depreciation",
        "accumulated-depreciation",
        "fixed-asset",
        "useful-life",
        "prepayment",
      ],
      meetingLessonSlugs: ["asking-for-clarification"],
    },
    "preparing-monthly-closing": {
      processIds: ["r2r"],
      subModuleIds: ["finance-closing"],
      businessFunctionIds: ["finance-closing-close-period"],
      wordIds: ["reconciliation", "audit-trail", "approval", "fiscal-year", "period-closing"],
      meetingLessonSlugs: ["summarizing-minutes"],
    },
    "reviewing-financial-statements": {
      processIds: ["r2r"],
      subModuleIds: ["finance-reporting"],
      businessFunctionIds: ["finance-reporting-export"],
      wordIds: [
        "balance-sheet",
        "income-statement",
        "cash-flow",
        "trial-balance",
        "financial-statements",
      ],
    },
    "communicating-accounting-issues": {
      processIds: ["r2r", "p2p"],
      subModuleIds: ["finance-gl"],
      businessFunctionIds: [],
      wordIds: ["stakeholder", "escalation-matrix", "approval", "change-request"],
      emailLessonSlugs: ["issue-escalation"],
      meetingLessonSlugs: ["problems-action-items", "summarizing-minutes"],
    },
  };

  it("covers all 12 lessons", () => {
    expect([...bySlug.keys()].sort()).toEqual(Object.keys(EXPECTED_REFS).sort());
  });

  it("matches the approved reference map exactly", () => {
    for (const [slug, expected] of Object.entries(EXPECTED_REFS)) {
      const refs = bySlug.get(slug)!.refs;
      expect(refs.processIds ?? [], `${slug} processIds`).toEqual(expected.processIds ?? []);
      expect(refs.subModuleIds ?? [], `${slug} subModuleIds`).toEqual(expected.subModuleIds ?? []);
      expect(refs.businessFunctionIds ?? [], `${slug} businessFunctionIds`).toEqual(
        expected.businessFunctionIds ?? []
      );
      expect(refs.wordIds ?? [], `${slug} wordIds`).toEqual(expected.wordIds ?? []);
      expect(refs.emailLessonSlugs ?? [], `${slug} emailLessonSlugs`).toEqual(
        expected.emailLessonSlugs ?? []
      );
      expect(refs.meetingLessonSlugs ?? [], `${slug} meetingLessonSlugs`).toEqual(
        expected.meetingLessonSlugs ?? []
      );
    }
  });

  it("keeps every word ref resolvable through wordById", () => {
    for (const [slug, expected] of Object.entries(EXPECTED_REFS)) {
      for (const id of expected.wordIds ?? []) {
        expect(wordById(id), `${slug} → word ${id}`).toBeTruthy();
      }
    }
  });

  it("never references the inventory-scoped adjustment word", () => {
    for (const l of path.lessons) {
      expect(l.refs.wordIds ?? [], l.id).not.toContain("adjustment");
      for (const q of [...(l.practice.mcqs ?? []), ...l.quiz]) {
        expect(q.wordId, q.id).not.toBe("adjustment");
      }
    }
    for (const q of path.assessment.quiz) {
      expect(q.wordId, q.id).not.toBe("adjustment");
    }
  });
});

describe("Phase 06 — erp-accountant practice shape", () => {
  const path = jobPathBySlug("erp-accountant")!;

  it("gives every lesson 2 MCQs, 1 response, a 5-step ordering and 2 phrases", () => {
    for (const l of path.lessons) {
      expect(l.practice.mcqs?.length, `${l.id} mcqs`).toBe(2);
      expect(l.practice.responses?.length, `${l.id} responses`).toBe(1);
      expect(l.practice.order?.length, `${l.id} order`).toBe(5);
      expect(l.practice.phrases?.length, `${l.id} phrases`).toBe(2);
    }
  });

  it("gives every lesson a 5-question quiz with complete bilingual options", () => {
    for (const l of path.lessons) {
      expect(l.quiz.length, `${l.id} quiz`).toBe(5);
      for (const q of l.quiz) {
        expect(q.promptAr && q.promptEn, q.id).toBeTruthy();
        expect(q.optionsAr.length, q.id).toBe(q.optionsEn.length);
        expect(q.optionsAr.length, q.id).toBeGreaterThan(1);
      }
    }
  });
});

describe("Phase 06 — erp-accountant assessment coverage", () => {
  const path = jobPathBySlug("erp-accountant")!;
  const assessment = path.assessment;

  // Approved coverage map: 8 MCQs sample L1–L8, the 2 written responses cover
  // L9 and L12, and the 3 speaking phrases cover L10, L11 and L7+L12.
  const LESSON_BY_QUESTION: Record<string, number> = {
    "ja-assess-q1": 1,
    "ja-assess-q2": 2,
    "ja-assess-q3": 3,
    "ja-assess-q4": 4,
    "ja-assess-q5": 5,
    "ja-assess-q6": 6,
    "ja-assess-q7": 7,
    "ja-assess-q8": 8,
  };

  it("has 8 MCQs covering lessons 1–8 exactly once", () => {
    const ids = assessment.quiz.map((q) => q.id).sort();
    expect(ids).toEqual(Object.keys(LESSON_BY_QUESTION).sort());
    const lessons = Object.values(LESSON_BY_QUESTION);
    expect(new Set(lessons).size).toBe(lessons.length);
    for (const n of lessons) {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(8);
    }
  });

  it("has 2 written responses and 3 speaking phrases (13 activities total)", () => {
    expect(assessment.quiz.length).toBe(8);
    expect((assessment.responses ?? []).length).toBe(2);
    expect((assessment.speaking ?? []).length).toBe(3);
    expect(
      assessment.quiz.length + (assessment.responses ?? []).length + (assessment.speaking ?? []).length
    ).toBe(13);
  });

  it("covers lessons 9 and 12 through the written responses", () => {
    expect((assessment.responses ?? []).map((r) => r.id).sort()).toEqual(
      ["ja-assess-rs1", "ja-assess-rs2"].sort()
    );
  });

  it("does not repeat the same correct answer text within the MCQs", () => {
    const answers = assessment.quiz.map((q) => q.optionsEn[q.answerIndex]);
    expect(new Set(answers).size).toBe(answers.length);
  });
});

describe("Phase 06 — erp-accountant assessment semantic answer keys", () => {
  const path = jobPathBySlug("erp-accountant")!;
  const assessment = path.assessment;
  const byId = new Map(assessment.quiz.map((q) => [q.id, q]));

  const ANSWER_KEY: Record<string, { en: string; ar: string; lesson: string }> = {
    "ja-assess-q1": {
      en: "Recording and reviewing accounting transactions and preparing reports.",
      ar: "تسجيل ومراجعة الحركات المحاسبية وتجهيز التقارير.",
      lesson: "L1 understanding the accountant's role",
    },
    "ja-assess-q2": {
      en: "An organised list of all accounts so transactions are recorded in the right account.",
      ar: "قائمة منظّمة بكل الحسابات لتسجيل الحركات على الحساب الصحيح.",
      lesson: "L2 chart of accounts",
    },
    "ja-assess-q3": {
      en: "Total debits must equal total credits.",
      ar: "أن يتساوى إجمالي المدين مع إجمالي الدائن.",
      lesson: "L3 recording journal entries",
    },
    "ja-assess-q4": {
      en: "Matching the invoice with the purchase order and goods receipt before payment.",
      ar: "مطابقة الفاتورة بأمر الشراء وإيصال الاستلام قبل الدفع.",
      lesson: "L4 accounts payable",
    },
    "ja-assess-q5": {
      en: "To track overdue amounts and reduce the risk of non-collection.",
      ar: "لمتابعة المتأخرات وتقليل مخاطر عدم التحصيل.",
      lesson: "L5 accounts receivable",
    },
    "ja-assess-q6": {
      en: "Output tax.",
      ar: "ضريبة المخرجات.",
      lesson: "L6 tax compliance",
    },
    "ja-assess-q7": {
      en: "Comparing the bank statement with the general ledger and explaining the differences.",
      ar: "مقارنة كشف البنك مع دفتر الأستاذ وتفسير الفروقات.",
      lesson: "L7 bank reconciliation",
    },
    "ja-assess-q8": {
      en: "Reverse it with an entry, then post the correct one.",
      ar: "نعكسه بقيد ثم نرحّل القيد الصحيح.",
      lesson: "L8 reviewing the general ledger",
    },
  };

  it("covers the eight assessment questions exactly", () => {
    expect([...byId.keys()].sort()).toEqual(Object.keys(ANSWER_KEY).sort());
  });

  it("resolves every answerIndex to the intended English answer text", () => {
    for (const [id, expected] of Object.entries(ANSWER_KEY)) {
      const q = byId.get(id)!;
      expect(q.answerIndex, `${id} bounds`).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex, `${id} bounds`).toBeLessThan(q.optionsEn.length);
      expect(q.optionsEn[q.answerIndex], `${id} (${expected.lesson})`).toBe(expected.en);
    }
  });

  it("resolves every answerIndex to the intended Arabic answer text", () => {
    for (const [id, expected] of Object.entries(ANSWER_KEY)) {
      const q = byId.get(id)!;
      expect(q.optionsAr[q.answerIndex], `${id} (${expected.lesson})`).toBe(expected.ar);
    }
  });

  it("keeps every option distinct in both languages", () => {
    for (const q of assessment.quiz) {
      expect(q.optionsAr.length, `${q.id} length`).toBe(q.optionsEn.length);
      expect(new Set(q.optionsEn).size, `${q.id} en distinct`).toBe(q.optionsEn.length);
      expect(new Set(q.optionsAr).size, `${q.id} ar distinct`).toBe(q.optionsAr.length);
    }
  });

  it("keeps explanations non-empty and in the matching language", () => {
    const ARABIC_RE = /[\u0600-\u06FF]/;
    for (const q of assessment.quiz) {
      const explainEn = q.explainEn ?? "";
      const explainAr = q.explainAr ?? "";
      expect(explainEn.length, `${q.id} explainEn`).toBeGreaterThan(0);
      expect(explainAr.length, `${q.id} explainAr`).toBeGreaterThan(0);
      expect(ARABIC_RE.test(explainAr), `${q.id} explainAr is Arabic`).toBe(true);
      expect(ARABIC_RE.test(explainEn), `${q.id} explainEn is not Arabic`).toBe(false);
    }
  });

  it("keeps the written responses bilingual and well-formed", () => {
    for (const r of assessment.responses ?? []) {
      expect(r.situationAr && r.situationEn, r.id).toBeTruthy();
      expect(r.optionsAr.length, r.id).toBe(r.optionsEn.length);
      expect(r.answerIndex, r.id).toBeGreaterThanOrEqual(0);
      expect(r.answerIndex, r.id).toBeLessThan(r.optionsAr.length);
    }
  });

  it("keeps the speaking phrases bilingual with tips", () => {
    for (const s of assessment.speaking ?? []) {
      expect(s.en && s.ar, s.id).toBeTruthy();
      expect(s.tipAr && s.tipEn, s.id).toBeTruthy();
    }
  });
});

describe("Phase 06 — erp-accountant ownership boundaries", () => {
  const path = jobPathBySlug("erp-accountant")!;
  const bySlug = new Map(path.lessons.map((l) => [l.slug, l]));

  it("keeps AP owns vendor invoices and AR owns customer invoices", () => {
    const ap = bySlug.get("managing-accounts-payable")!;
    const ar = bySlug.get("managing-accounts-receivable")!;
    expect(ap.refs.processIds).toEqual(["p2p"]);
    expect(ap.refs.emailLessonSlugs).toContain("invoice-discrepancy");
    expect(ar.refs.processIds).toEqual(["o2c"]);
    expect(ar.refs.emailLessonSlugs).toContain("payment-reminder");
    // AR must not pull in AP-only business functions and vice versa.
    expect(ipLocal(ar.refs.businessFunctionIds)).not.toContain("finance-ap-pay-vendor");
    expect(ipLocal(ap.refs.businessFunctionIds)).not.toContain("finance-ar-receive-payment");
  });

  it("keeps journal entries (creating/posting) separate from GL review (reversal)", () => {
    const je = bySlug.get("recording-journal-entries")!;
    const gl = bySlug.get("reviewing-general-ledger")!;
    expect(je.refs.businessFunctionIds).toEqual([
      "finance-gl-create-journal",
      "finance-gl-post-entry",
    ]);
    expect(gl.refs.businessFunctionIds).toEqual(["finance-gl-reverse-entry"]);
  });

  it("keeps accruals (estimates) separate from monthly closing (close process)", () => {
    const accr = bySlug.get("managing-accruals-adjustments")!;
    const close = bySlug.get("preparing-monthly-closing")!;
    expect(accr.refs.subModuleIds).toContain("finance-fixed-assets");
    expect(accr.refs.businessFunctionIds).toEqual(["assets-depreciation-run"]);
    expect(close.refs.businessFunctionIds).toEqual(["finance-closing-close-period"]);
  });

  it("keeps tax scope generic (no country-specific business function or advice)", () => {
    const tax = bySlug.get("managing-tax-compliance")!;
    expect(tax.refs.businessFunctionIds ?? []).toEqual([]);
    expect(tax.refs.processIds ?? []).toEqual([]);
  });
});

// ═══════════════ Phase 07 — مسار أخصائي المشتريات (Procurement Specialist) ═══════════════

describe("Phase 07 — procurement-specialist path shape", () => {
  const path = jobPathBySlug("procurement-specialist")!;

  it("exists with the expected identity and metadata", () => {
    expect(path).toBeTruthy();
    expect(path.id).toBe("job-procurement-specialist");
    expect(path.slug).toBe("procurement-specialist");
    expect(path.status).toBe("ready");
    expect(path.level).toBe("B2");
    expect(path.titleEn).toBe("Procurement Specialist");
    expect(path.icon).toBeTruthy();
    expect(path.summaryAr && path.summaryEn, "summary").toBeTruthy();
    expect(path.descAr && path.descEn, "desc").toBeTruthy();
    expect(path.learningObjectivesAr.length).toBeGreaterThan(0);
    expect(path.learningObjectivesAr.length).toBe(path.learningObjectivesEn.length);
  });

  it("does not link to a career path (no procurement career path exists)", () => {
    expect(path.careerPathId).toBeUndefined();
  });

  it("has exactly 12 lessons ordered 1..12 with the approved slugs", () => {
    expect(path.lessons.length).toBe(12);
    path.lessons.forEach((l, i) => {
      expect(l.order, l.id).toBe(i + 1);
      expect(l.level, l.id).toBe("B2");
    });
    expect(path.lessons.map((l) => l.slug)).toEqual([
      "understanding-procurement-role",
      "raising-purchase-requisitions",
      "purchase-approval-workflows",
      "supplier-sourcing-and-rfq",
      "comparing-supplier-quotations",
      "evaluating-and-selecting-vendors",
      "creating-purchase-orders",
      "managing-purchase-order-amendments",
      "receiving-goods-and-handling-discrepancies",
      "matching-vendor-invoices",
      "procurement-reporting-and-spend",
      "communicating-and-escalating-supplier-issues",
    ]);
  });

  it("is released and exposed as a ready path", () => {
    expect(path.status).toBe("ready");
    expect(READY_JOB_PATHS.some((p) => p.slug === "procurement-specialist")).toBe(true);
  });
});

describe("Phase 07 — procurement-specialist lesson refs", () => {
  const path = jobPathBySlug("procurement-specialist")!;
  const bySlug = new Map(path.lessons.map((l) => [l.slug, l]));

  // Approved reference map (Phase 07.0.1). Pinned so a drift of a ref is caught.
  const EXPECTED_REFS: Record<
    string,
    {
      processIds?: string[];
      subModuleIds?: string[];
      businessFunctionIds?: string[];
      wordIds?: string[];
      screenIds?: string[];
      emailLessonSlugs?: string[];
      meetingLessonSlugs?: string[];
    }
  > = {
    "understanding-procurement-role": {
      processIds: ["p2p"],
      subModuleIds: ["purchasing-vendors"],
      wordIds: ["procurement", "vendor", "approval"],
      meetingLessonSlugs: ["introducing-yourself-role"],
    },
    "raising-purchase-requisitions": {
      processIds: ["p2p"],
      subModuleIds: ["purchasing-requisition"],
      businessFunctionIds: ["purchasing-requisition-create"],
      wordIds: ["purchase-request", "budget"],
      screenIds: ["scr-purchase-requisition"],
      meetingLessonSlugs: ["asking-for-clarification"],
    },
    "purchase-approval-workflows": {
      processIds: ["p2p"],
      subModuleIds: ["purchasing-orders"],
      businessFunctionIds: ["purchasing-orders-approve"],
      wordIds: ["approval", "budget", "purchase-order"],
      screenIds: ["scr-purchase-order"],
      meetingLessonSlugs: ["agreeing-disagreeing"],
    },
    "supplier-sourcing-and-rfq": {
      processIds: ["p2p"],
      subModuleIds: ["purchasing-rfq", "purchasing-vendors"],
      wordIds: ["rfq", "vendor", "procurement", "source", "lead-time"],
      emailLessonSlugs: ["supplier-follow-up"],
    },
    "comparing-supplier-quotations": {
      processIds: ["p2p"],
      subModuleIds: ["purchasing-vendor-comparison"],
      wordIds: ["quotation", "rfq", "vendor", "price-negotiation"],
    },
    "evaluating-and-selecting-vendors": {
      processIds: ["p2p"],
      subModuleIds: ["purchasing-vendor-comparison", "purchasing-vendors"],
      wordIds: ["vendor-rating", "vendor", "contract", "negotiation"],
      meetingLessonSlugs: ["agreeing-disagreeing"],
    },
    "creating-purchase-orders": {
      processIds: ["p2p"],
      subModuleIds: ["purchasing-orders"],
      businessFunctionIds: ["purchasing-orders-create"],
      wordIds: ["purchase-order", "vendor", "budget"],
      screenIds: ["scr-purchase-order"],
    },
    "managing-purchase-order-amendments": {
      processIds: ["p2p"],
      subModuleIds: ["purchasing-orders", "purchasing-agreements"],
      businessFunctionIds: ["purchasing-orders-approve"],
      wordIds: ["blanket-order", "open-po", "contract", "purchase-order", "approval"],
      screenIds: ["scr-purchase-order"],
      emailLessonSlugs: ["supplier-follow-up"],
      meetingLessonSlugs: ["asking-for-clarification"],
    },
    "receiving-goods-and-handling-discrepancies": {
      processIds: ["p2p"],
      subModuleIds: ["purchasing-receipts"],
      businessFunctionIds: ["purchasing-receipts-receive"],
      wordIds: ["goods-receipt", "grn", "delivery-note", "purchase-order"],
      screenIds: ["scr-goods-receipt"],
      meetingLessonSlugs: ["problems-action-items"],
    },
    "matching-vendor-invoices": {
      processIds: ["p2p"],
      subModuleIds: ["purchasing-vendor-bills", "finance-ap"],
      businessFunctionIds: ["purchasing-vendor-bills-register", "finance-ap-register-bill"],
      wordIds: ["three-way-match", "purchase-order", "goods-receipt"],
      emailLessonSlugs: ["invoice-discrepancy"],
    },
    "procurement-reporting-and-spend": {
      processIds: ["p2p"],
      subModuleIds: ["purchasing-reporting"],
      wordIds: ["open-po", "budget", "procurement", "vendor-rating"],
      meetingLessonSlugs: ["summarizing-minutes"],
    },
    "communicating-and-escalating-supplier-issues": {
      processIds: ["p2p"],
      subModuleIds: ["purchasing-vendors"],
      wordIds: ["escalate", "approval", "follow-up", "negotiation"],
      emailLessonSlugs: ["issue-escalation"],
      meetingLessonSlugs: ["problems-action-items", "summarizing-minutes"],
    },
  };

  it("covers all 12 lessons", () => {
    expect([...bySlug.keys()].sort()).toEqual(Object.keys(EXPECTED_REFS).sort());
  });

  it("matches the approved reference map exactly", () => {
    for (const [slug, expected] of Object.entries(EXPECTED_REFS)) {
      const refs = bySlug.get(slug)!.refs;
      expect(refs.processIds ?? [], `${slug} processIds`).toEqual(expected.processIds ?? []);
      expect(refs.subModuleIds ?? [], `${slug} subModuleIds`).toEqual(expected.subModuleIds ?? []);
      expect(refs.businessFunctionIds ?? [], `${slug} businessFunctionIds`).toEqual(
        expected.businessFunctionIds ?? []
      );
      expect(refs.wordIds ?? [], `${slug} wordIds`).toEqual(expected.wordIds ?? []);
      expect(refs.screenIds ?? [], `${slug} screenIds`).toEqual(expected.screenIds ?? []);
      expect(refs.emailLessonSlugs ?? [], `${slug} emailLessonSlugs`).toEqual(
        expected.emailLessonSlugs ?? []
      );
      expect(refs.meetingLessonSlugs ?? [], `${slug} meetingLessonSlugs`).toEqual(
        expected.meetingLessonSlugs ?? []
      );
    }
  });

  it("resolves every reference against the existing content", () => {
    for (const l of path.lessons) {
      const refs = l.refs;
      for (const id of refs.processIds ?? []) {
        expect(processById(id), `${l.slug} → process ${id}`).toBeTruthy();
      }
      for (const id of refs.subModuleIds ?? []) {
        expect(SUB_MODULE_ID_SET.has(id), `${l.slug} → subModule ${id}`).toBe(true);
      }
      for (const id of refs.businessFunctionIds ?? []) {
        expect(BUSINESS_FUNCTION_ID_SET.has(id), `${l.slug} → businessFunction ${id}`).toBe(true);
      }
      for (const id of [...(refs.wordIds ?? []), ...(refs.screenIds ?? [])]) {
        expect(wordById(id), `${l.slug} → word ${id}`).toBeTruthy();
      }
      for (const slug of refs.emailLessonSlugs ?? []) {
        expect(emailBySlug(slug), `${l.slug} → email ${slug}`).toBeTruthy();
      }
      for (const slug of refs.meetingLessonSlugs ?? []) {
        expect(meetingBySlug(slug), `${l.slug} → meeting ${slug}`).toBeTruthy();
      }
    }
  });

  it("only links quiz questions to existing words", () => {
    const quiz = [
      ...path.lessons.flatMap((l) => l.quiz),
      ...path.lessons.flatMap((l) => l.practice.mcqs ?? []),
      ...path.assessment.quiz,
    ];
    for (const q of quiz) {
      if (q.wordId) {
        expect(wordById(q.wordId), `${q.id} → word ${q.wordId}`).toBeTruthy();
      }
    }
  });
});

describe("Phase 07 — procurement-specialist practice shape", () => {
  const path = jobPathBySlug("procurement-specialist")!;

  it("gives every lesson 2 MCQs, 1 response, a 5-step ordering and 2 phrases", () => {
    for (const l of path.lessons) {
      expect(l.practice.mcqs?.length, `${l.id} mcqs`).toBe(2);
      expect(l.practice.responses?.length, `${l.id} responses`).toBe(1);
      expect(l.practice.order?.length, `${l.id} order`).toBe(5);
      expect(l.practice.phrases?.length, `${l.id} phrases`).toBe(2);
    }
  });

  it("gives every lesson a 5-question quiz with complete bilingual options", () => {
    for (const l of path.lessons) {
      expect(l.quiz.length, `${l.id} quiz`).toBe(5);
      for (const q of l.quiz) {
        expect(q.promptAr && q.promptEn, q.id).toBeTruthy();
        expect(q.optionsAr.length, q.id).toBe(q.optionsEn.length);
        expect(q.optionsAr.length, q.id).toBeGreaterThan(1);
        expect(q.answerIndex, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex, q.id).toBeLessThan(q.optionsAr.length);
      }
    }
  });
});

describe("Phase 07 — procurement-specialist assessment coverage", () => {
  const path = jobPathBySlug("procurement-specialist")!;
  const assessment = path.assessment;

  // Approved coverage map: 8 MCQs sample L1–L8, the 2 written responses cover
  // L9 and L12, and the 3 speaking phrases cover L10, L11 and L7+L12.
  const LESSON_BY_QUESTION: Record<string, number> = {
    "ja-pr-assess-q1": 1,
    "ja-pr-assess-q2": 2,
    "ja-pr-assess-q3": 3,
    "ja-pr-assess-q4": 4,
    "ja-pr-assess-q5": 5,
    "ja-pr-assess-q6": 6,
    "ja-pr-assess-q7": 7,
    "ja-pr-assess-q8": 8,
  };

  it("has 8 MCQs covering lessons 1–8 exactly once", () => {
    const ids = assessment.quiz.map((q) => q.id).sort();
    expect(ids).toEqual(Object.keys(LESSON_BY_QUESTION).sort());
    const lessons = Object.values(LESSON_BY_QUESTION);
    expect(new Set(lessons).size).toBe(lessons.length);
    for (const n of lessons) {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(8);
    }
  });

  it("has 2 written responses and 3 speaking phrases (13 activities total)", () => {
    expect(assessment.quiz.length).toBe(8);
    expect((assessment.responses ?? []).length).toBe(2);
    expect((assessment.speaking ?? []).length).toBe(3);
    expect(
      assessment.quiz.length + (assessment.responses ?? []).length + (assessment.speaking ?? []).length
    ).toBe(13);
  });

  it("covers lessons 9 and 12 through the written responses", () => {
    expect((assessment.responses ?? []).map((r) => r.id).sort()).toEqual(
      ["ja-pr-assess-rs1", "ja-pr-assess-rs2"].sort()
    );
  });

  it("does not support or declare an assessment Ordering activity", () => {
    // The assessment schema has no ordering field; guard against a future addition
    // that the UI cannot render.
    expect("order" in assessment).toBe(false);
    expect((assessment as { order?: unknown }).order).toBeUndefined();
  });

  it("does not repeat the same correct answer text within the MCQs", () => {
    const answers = assessment.quiz.map((q) => q.optionsEn[q.answerIndex]);
    expect(new Set(answers).size).toBe(answers.length);
  });
});

describe("Phase 07 — procurement-specialist assessment semantic answer keys", () => {
  const path = jobPathBySlug("procurement-specialist")!;
  const assessment = path.assessment;
  const byId = new Map(assessment.quiz.map((q) => [q.id, q]));

  // Semantic answer-key fixture: the exact answer text each question must resolve to,
  // in both languages. Pinning the TEXT (not just the index) means a drift of answerIndex,
  // an option reorder, or a wrong option will fail even if the index looks "in bounds".
  const ANSWER_KEY: Record<string, { en: string; ar: string; lesson: string }> = {
    "ja-pr-assess-q1": {
      en: "Raising purchase requisitions, creating purchase orders and following vendors through to delivery and invoice.",
      ar: "رفع طلبات الشراء وإصدار أوامر الشراء ومتابعة الموردين حتى التسليم والفاتورة.",
      lesson: "L1 understanding the procurement role",
    },
    "ja-pr-assess-q2": {
      en: "Documenting an internal need to start the purchasing process.",
      ar: "توثيق حاجة داخلية لبدء عملية الشراء.",
      lesson: "L2 raising purchase requisitions",
    },
    "ja-pr-assess-q3": {
      en: "Purchase order approval.",
      ar: "الموافقة على أمر الشراء.",
      lesson: "L3 purchase approval workflows",
    },
    "ja-pr-assess-q4": {
      en: "Requesting quotations from several vendors so they can be compared.",
      ar: "طلب عروض أسعار من عدة موردين لمقارنتها.",
      lesson: "L4 supplier sourcing and RFQ",
    },
    "ja-pr-assess-q5": {
      en: "Because quality, lead time and reliability affect the total value.",
      ar: "لأن الجودة والمدة والالتزام تؤثّر على القيمة الكلية.",
      lesson: "L5 comparing supplier quotations",
    },
    "ja-pr-assess-q6": {
      en: "The company's formal commitment to buy from a vendor on defined terms.",
      ar: "الالتزام الرسمي للشركة بالشراء من مورد بشروط محدّدة.",
      lesson: "L6 creating purchase orders",
    },
    "ja-pr-assess-q7": {
      en: "The content defines no dedicated function to create or review an order amendment; the change is documented and communicated for review and approval.",
      ar: "المحتوى لا يعرّف وظيفة مخصّصة لإنشاء تعديل الأمر أو مراجعته، والتغيير يُوثّق ويُتواصل به للمراجعة والموافقة.",
      lesson: "L7 managing purchase order amendments",
    },
    "ja-pr-assess-q8": {
      en: "Documenting the quantities actually received from the vendor.",
      ar: "توثيق الكميات المستلمة فعليًا من المورد.",
      lesson: "L8 receiving goods",
    },
  };

  it("covers the eight assessment questions exactly", () => {
    expect([...byId.keys()].sort()).toEqual(Object.keys(ANSWER_KEY).sort());
  });

  it("resolves every answerIndex to the intended English answer text", () => {
    for (const [id, expected] of Object.entries(ANSWER_KEY)) {
      const q = byId.get(id)!;
      expect(q.answerIndex, `${id} bounds`).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex, `${id} bounds`).toBeLessThan(q.optionsEn.length);
      expect(q.optionsEn[q.answerIndex], `${id} (${expected.lesson})`).toBe(expected.en);
    }
  });

  it("resolves every answerIndex to the intended Arabic answer text", () => {
    for (const [id, expected] of Object.entries(ANSWER_KEY)) {
      const q = byId.get(id)!;
      expect(q.optionsAr[q.answerIndex], `${id} (${expected.lesson})`).toBe(expected.ar);
    }
  });

  it("keeps every option distinct in both languages", () => {
    for (const q of assessment.quiz) {
      expect(q.optionsAr.length, `${q.id} length`).toBe(q.optionsEn.length);
      expect(new Set(q.optionsEn).size, `${q.id} en distinct`).toBe(q.optionsEn.length);
      expect(new Set(q.optionsAr).size, `${q.id} ar distinct`).toBe(q.optionsAr.length);
    }
  });

  it("keeps explanations non-empty and in the matching language", () => {
    const ARABIC_RE = /[\u0600-\u06FF]/;
    for (const q of assessment.quiz) {
      const explainEn = q.explainEn ?? "";
      const explainAr = q.explainAr ?? "";
      expect(explainEn.length, `${q.id} explainEn`).toBeGreaterThan(0);
      expect(explainAr.length, `${q.id} explainAr`).toBeGreaterThan(0);
      expect(ARABIC_RE.test(explainAr), `${q.id} explainAr is Arabic`).toBe(true);
      expect(ARABIC_RE.test(explainEn), `${q.id} explainEn is not Arabic`).toBe(false);
    }
  });

  it("keeps the written responses bilingual and well-formed", () => {
    for (const r of assessment.responses ?? []) {
      expect(r.situationAr && r.situationEn, r.id).toBeTruthy();
      expect(r.optionsAr.length, r.id).toBe(r.optionsEn.length);
      expect(r.answerIndex, r.id).toBeGreaterThanOrEqual(0);
      expect(r.answerIndex, r.id).toBeLessThan(r.optionsAr.length);
    }
  });

  it("keeps the speaking phrases bilingual with tips", () => {
    for (const s of assessment.speaking ?? []) {
      expect(s.en && s.ar, s.id).toBeTruthy();
      expect(s.tipAr && s.tipEn, s.id).toBeTruthy();
    }
  });
});

describe("Phase 07 — procurement-specialist business guardrails", () => {
  const path = jobPathBySlug("procurement-specialist")!;
  const bySlug = new Map(path.lessons.map((l) => [l.slug, l]));
  const ARABIC_RE = /[\u0600-\u06FF]/;

  // Teaching content only: scenario + explanations + prompts (NOT distractor options).
  // Distractors intentionally phrase the *wrong* claims to be rejected, so they must
  // not be scanned for forbidden wording.
  const teachingEnFor = (slug: string): string => {
    const l = bySlug.get(slug)!;
    return [
      l.scenarioEn,
      l.titleEn,
      ...(l.practice.mcqs ?? []).flatMap((q) => [q.promptEn, q.explainEn ?? ""]),
      ...(l.practice.responses ?? []).flatMap((r) => [r.situationEn, r.explainEn ?? ""]),
      ...l.quiz.flatMap((q) => [q.promptEn, q.explainEn ?? ""]),
    ]
      .join(" ")
      .toLowerCase();
  };

  // The correct (answerIndex-selected) option text across a lesson's questions.
  const correctEnFor = (slug: string): string => {
    const l = bySlug.get(slug)!;
    const picks = [
      ...(l.practice.mcqs ?? []),
      ...(l.practice.responses ?? []),
      ...l.quiz,
    ].map((q) => q.optionsEn[q.answerIndex]);
    return picks.join(" ").toLowerCase();
  };

  it("L2 teaches requisition creation without claiming a dedicated PR approval function", () => {
    const l = bySlug.get("raising-purchase-requisitions")!;
    expect(l.refs.businessFunctionIds).toEqual(["purchasing-requisition-create"]);
    // No lesson may claim a requisition/PR-approval business function.
    for (const lesson of path.lessons) {
      for (const id of lesson.refs.businessFunctionIds ?? []) {
        expect(id, `${lesson.id} must not claim a PR-approval function`).not.toMatch(
          /requisition.*approv|approv.*requisition/
        );
      }
    }
  });

  it("L3 scopes approval to purchase orders only (purchasing-orders-approve)", () => {
    const l = bySlug.get("purchase-approval-workflows")!;
    expect(l.refs.businessFunctionIds).toEqual(["purchasing-orders-approve"]);
  });

  it("L7 does not attach customer-order-confirmation content", () => {
    const l = bySlug.get("creating-purchase-orders")!;
    expect(l.refs.emailLessonSlugs ?? []).not.toContain("customer-order-confirmation");
    // The lesson narrative and objectives must frame a purchase order as a purchasing
    // document and must not present customer order confirmation as part of it.
    const narrative = [l.scenarioEn, l.titleEn, ...(l.objectivesEn ?? [])]
      .join(" ")
      .toLowerCase();
    expect(narrative).not.toContain("customer order confirmation");
  });

  it("L8 preserves the approved limitation that no dedicated amendment function exists", () => {
    const l = bySlug.get("managing-purchase-order-amendments")!;
    // Approved safety boundary wording: the taught content states the current ERP
    // content does not define a dedicated amendment creation/review function.
    const teaching = teachingEnFor(l.slug);
    const hasEnLimit =
      teaching.includes("does not define") &&
      teaching.includes("amendment") &&
      (teaching.includes("create") || teaching.includes("review"));
    expect(hasEnLimit, "EN must state no dedicated amendment function is defined").toBe(true);
    // Arabic counterpart must carry the same meaning.
    const arCorpus = [
      l.scenarioAr,
      ...l.quiz.flatMap((q) => [q.promptAr, q.explainAr ?? ""]),
      ...(l.practice.mcqs ?? []).flatMap((q) => [q.promptAr, q.explainAr ?? ""]),
    ]
      .join(" ")
      .toLowerCase();
    expect(ARABIC_RE.test(arCorpus)).toBe(true);
    expect(arCorpus.includes("لا يعرّف"), "AR must state the function is not defined").toBe(true);
  });

  it("L8 does not imply that PO approval creates or amends a PO", () => {
    // Only the correct answers and explanations are scanned: a distractor may phrase
    // the wrong claim to be rejected, but the lesson must never TEACH it.
    const taught = correctEnFor("managing-purchase-order-amendments") + " " + teachingEnFor("managing-purchase-order-amendments");
    for (const forbidden of [
      "approval creates the amendment",
      "approval creates the order",
      "approval amends",
      "automatically reverses",
      "recreates the order",
      "recreate the order",
    ]) {
      expect(taught, `forbidden taught claim: ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("L9 does not claim an unsupported receipt-discrepancy screen or function", () => {
    const l = bySlug.get("receiving-goods-and-handling-discrepancies")!;
    expect(l.refs.businessFunctionIds).toEqual(["purchasing-receipts-receive"]);
    // Correct answers must not present a dedicated discrepancy screen as available.
    expect(correctEnFor(l.slug)).not.toContain("dedicated screen");
    expect(correctEnFor(l.slug)).not.toContain("discrepancy screen exists");
    // The AP unit-price discrepancy email belongs to L10, not the receipt lesson.
    expect(l.refs.emailLessonSlugs ?? []).not.toContain("invoice-discrepancy");
  });

  it("L10 maps invoice-discrepancy to an AP unit-price mismatch, not a quantity discrepancy", () => {
    const l = bySlug.get("matching-vendor-invoices")!;
    expect(l.refs.emailLessonSlugs).toContain("invoice-discrepancy");
    // Correct answers associate it with a unit-price difference, not a receipt quantity.
    const correct = correctEnFor(l.slug);
    expect(correct).toContain("unit-price");
    expect(correct).not.toContain("receipt quantity");
  });

  it("L10 does not reference scr-payment as an invoice-matching screen", () => {
    const l = bySlug.get("matching-vendor-invoices")!;
    expect(l.refs.screenIds ?? []).not.toContain("scr-payment");
    expect(l.refs.wordIds ?? []).not.toContain("scr-payment");
    for (const lesson of path.lessons) {
      expect(lesson.refs.screenIds ?? [], lesson.id).not.toContain("scr-payment");
    }
  });

  it("keeps the procurement/AP ownership boundary clear", () => {
    const l = bySlug.get("matching-vendor-invoices")!;
    // Procurement cooperates with AP on invoice registration/matching but does not
    // own payment execution.
    expect(l.refs.subModuleIds).toContain("purchasing-vendor-bills");
    expect(l.refs.subModuleIds).toContain("finance-ap");
    expect(l.refs.businessFunctionIds).toEqual([
      "purchasing-vendor-bills-register",
      "finance-ap-register-bill",
    ]);
    expect(l.refs.businessFunctionIds ?? []).not.toContain("finance-ap-pay-vendor");
  });
});

describe("Phase 08 — manufacturing-planner path shape", () => {
  const path = jobPathBySlug("manufacturing-planner")!;

  it("exists with the expected identity and metadata", () => {
    expect(path).toBeTruthy();
    expect(path.id).toBe("job-manufacturing-planner");
    expect(path.slug).toBe("manufacturing-planner");
    expect(path.status).toBe("planned");
    expect(path.level).toBe("B2");
    expect(path.titleEn).toBe("ERP Manufacturing Planner");
    expect(path.icon).toBeTruthy();
    expect(path.summaryAr && path.summaryEn, "summary").toBeTruthy();
    expect(path.descAr && path.descEn, "desc").toBeTruthy();
    expect(path.learningObjectivesAr.length).toBeGreaterThan(0);
    expect(path.learningObjectivesAr.length).toBe(path.learningObjectivesEn.length);
  });

  it("does not link to a career path (no manufacturing career path exists)", () => {
    expect(path.careerPathId).toBeUndefined();
  });

  it("has exactly 12 lessons ordered 1..12 with the approved slugs", () => {
    expect(path.lessons.length).toBe(12);
    path.lessons.forEach((l, i) => {
      expect(l.order, l.id).toBe(i + 1);
      expect(l.level, l.id).toBe("B2");
    });
    expect(path.lessons.map((l) => l.slug)).toEqual([
      "understanding-manufacturing-planner-role",
      "reviewing-production-demand",
      "understanding-bills-of-materials-and-requirements",
      "checking-material-availability",
      "planning-manufacturing-orders",
      "scheduling-work-centers-and-operations",
      "managing-production-priorities",
      "coordinating-material-shortages-with-procurement",
      "monitoring-work-order-progress",
      "handling-production-delays-and-planning-changes",
      "reviewing-production-performance-and-variances",
      "communicating-production-plans-and-escalating-risks",
    ]);
  });

  it("remains planned and is not exposed as a ready path", () => {
    expect(path.status).toBe("planned");
    expect(READY_JOB_PATHS.some((p) => p.slug === "manufacturing-planner")).toBe(false);
  });
});

describe("Phase 08 — manufacturing-planner lesson refs", () => {
  const path = jobPathBySlug("manufacturing-planner")!;
  const bySlug = new Map(path.lessons.map((l) => [l.slug, l]));

  // Approved reference map (Phase 08.1). Pinned so a drift of a ref is caught.
  const EXPECTED_REFS: Record<
    string,
    {
      processIds?: string[];
      subModuleIds?: string[];
      businessFunctionIds?: string[];
      wordIds?: string[];
      screenIds?: string[];
      emailLessonSlugs?: string[];
      meetingLessonSlugs?: string[];
    }
  > = {
    "understanding-manufacturing-planner-role": {
      processIds: ["p2produce"],
      subModuleIds: ["manufacturing-planning", "manufacturing-orders"],
      wordIds: ["work-order", "mrp", "capacity"],
      meetingLessonSlugs: ["introducing-yourself-role"],
    },
    "reviewing-production-demand": {
      processIds: ["p2produce"],
      subModuleIds: ["planning-demand-planning", "planning-forecasting", "planning-master-schedule"],
      wordIds: ["forecast", "lead-time"],
      screenIds: ["scr-dashboard", "scr-report-center"],
    },
    "understanding-bills-of-materials-and-requirements": {
      processIds: ["p2produce"],
      subModuleIds: ["manufacturing-bom", "manufacturing-product-structure", "manufacturing-mrp"],
      businessFunctionIds: ["manufacturing-bom-define"],
      wordIds: ["bom", "mrp"],
      screenIds: ["scr-bill-of-materials", "scr-item-master"],
    },
    "checking-material-availability": {
      processIds: ["p2produce"],
      subModuleIds: ["manufacturing-mrp", "inventory-on-hand", "inventory-products"],
      wordIds: ["mrp", "bom", "lead-time", "min-max", "safety-stock", "reorder-point", "sku", "lot-number"],
      screenIds: ["scr-item-master"],
    },
    "planning-manufacturing-orders": {
      processIds: ["p2produce"],
      subModuleIds: ["manufacturing-orders", "manufacturing-planning"],
      businessFunctionIds: ["manufacturing-orders-create"],
      wordIds: ["work-order", "mrp"],
      screenIds: ["scr-production-order"],
    },
    "scheduling-work-centers-and-operations": {
      processIds: ["p2produce"],
      subModuleIds: [
        "manufacturing-work-centers",
        "manufacturing-routing",
        "planning-scheduling",
        "planning-capacity",
        "planning-master-schedule",
      ],
      wordIds: ["routing", "operation", "capacity", "bottleneck", "batch-size", "production-line"],
    },
    "managing-production-priorities": {
      processIds: ["p2produce"],
      subModuleIds: ["manufacturing-planning", "manufacturing-orders"],
      wordIds: ["backorder", "batch", "operation", "work-order"],
      screenIds: ["scr-production-order"],
      meetingLessonSlugs: ["problems-action-items"],
    },
    "coordinating-material-shortages-with-procurement": {
      processIds: ["p2produce"],
      subModuleIds: ["manufacturing-mrp", "inventory-on-hand", "planning-supply-planning"],
      wordIds: ["escalate", "lead-time", "safety-stock", "risk"],
      emailLessonSlugs: ["supplier-follow-up"],
      meetingLessonSlugs: ["problems-action-items"],
    },
    "monitoring-work-order-progress": {
      processIds: ["p2produce"],
      subModuleIds: ["manufacturing-work-orders", "manufacturing-orders"],
      businessFunctionIds: ["manufacturing-orders-produce"],
      wordIds: ["work-order", "operation", "yield"],
      screenIds: ["scr-work-order"],
      meetingLessonSlugs: ["summarizing-minutes"],
    },
    "handling-production-delays-and-planning-changes": {
      processIds: ["p2produce"],
      subModuleIds: ["manufacturing-orders", "manufacturing-planning"],
      wordIds: ["lead-time", "backorder", "escalate", "risk"],
      screenIds: ["scr-production-order"],
      emailLessonSlugs: ["production-delay-notification"],
      meetingLessonSlugs: ["problems-action-items"],
    },
    "reviewing-production-performance-and-variances": {
      processIds: ["p2produce"],
      subModuleIds: ["manufacturing-costing", "manufacturing-scrap", "quality-reporting"],
      wordIds: ["yield", "scrap", "downtime", "oee", "bottleneck"],
      screenIds: ["scr-report-center"],
      meetingLessonSlugs: ["giving-erp-project-updates"],
    },
    "communicating-production-plans-and-escalating-risks": {
      processIds: ["p2produce"],
      subModuleIds: ["manufacturing-planning", "manufacturing-orders"],
      wordIds: ["escalate", "escalation-matrix", "risk", "capacity"],
      emailLessonSlugs: ["issue-escalation"],
      meetingLessonSlugs: ["problems-action-items", "summarizing-minutes"],
    },
  };

  it("covers all 12 lessons", () => {
    expect([...bySlug.keys()].sort()).toEqual(Object.keys(EXPECTED_REFS).sort());
  });

  it("matches the approved reference map exactly", () => {
    for (const [slug, expected] of Object.entries(EXPECTED_REFS)) {
      const refs = bySlug.get(slug)!.refs;
      expect(refs.processIds ?? [], `${slug} processIds`).toEqual(expected.processIds ?? []);
      expect(refs.subModuleIds ?? [], `${slug} subModuleIds`).toEqual(expected.subModuleIds ?? []);
      expect(refs.businessFunctionIds ?? [], `${slug} businessFunctionIds`).toEqual(
        expected.businessFunctionIds ?? []
      );
      expect(refs.wordIds ?? [], `${slug} wordIds`).toEqual(expected.wordIds ?? []);
      expect(refs.screenIds ?? [], `${slug} screenIds`).toEqual(expected.screenIds ?? []);
      expect(refs.emailLessonSlugs ?? [], `${slug} emailLessonSlugs`).toEqual(
        expected.emailLessonSlugs ?? []
      );
      expect(refs.meetingLessonSlugs ?? [], `${slug} meetingLessonSlugs`).toEqual(
        expected.meetingLessonSlugs ?? []
      );
    }
  });

  it("resolves every reference against the existing content", () => {
    for (const l of path.lessons) {
      const refs = l.refs;
      for (const id of refs.processIds ?? []) {
        expect(processById(id), `${l.slug} → process ${id}`).toBeTruthy();
      }
      for (const id of refs.subModuleIds ?? []) {
        expect(SUB_MODULE_ID_SET.has(id), `${l.slug} → subModule ${id}`).toBe(true);
      }
      for (const id of refs.businessFunctionIds ?? []) {
        expect(BUSINESS_FUNCTION_ID_SET.has(id), `${l.slug} → businessFunction ${id}`).toBe(true);
      }
      for (const id of [...(refs.wordIds ?? []), ...(refs.screenIds ?? [])]) {
        expect(wordById(id), `${l.slug} → word ${id}`).toBeTruthy();
      }
      for (const slug of refs.emailLessonSlugs ?? []) {
        expect(emailBySlug(slug), `${l.slug} → email ${slug}`).toBeTruthy();
      }
      for (const slug of refs.meetingLessonSlugs ?? []) {
        expect(meetingBySlug(slug), `${l.slug} → meeting ${slug}`).toBeTruthy();
      }
    }
  });

  it("only links quiz questions to existing words", () => {
    const quiz = [
      ...path.lessons.flatMap((l) => l.quiz),
      ...path.lessons.flatMap((l) => l.practice.mcqs ?? []),
      ...path.assessment.quiz,
    ];
    for (const q of quiz) {
      if (q.wordId) {
        expect(wordById(q.wordId), `${q.id} → word ${q.wordId}`).toBeTruthy();
      }
    }
  });
});

describe("Phase 08 — manufacturing-planner practice shape", () => {
  const path = jobPathBySlug("manufacturing-planner")!;

  it("gives every lesson 2 MCQs, 1 response, a 5-step ordering and 2 phrases", () => {
    for (const l of path.lessons) {
      expect(l.practice.mcqs?.length, `${l.id} mcqs`).toBe(2);
      expect(l.practice.responses?.length, `${l.id} responses`).toBe(1);
      expect(l.practice.order?.length, `${l.id} order`).toBe(5);
      expect(l.practice.phrases?.length, `${l.id} phrases`).toBe(2);
    }
  });

  it("gives every lesson a 5-question quiz with complete bilingual options", () => {
    for (const l of path.lessons) {
      expect(l.quiz.length, `${l.id} quiz`).toBe(5);
      for (const q of l.quiz) {
        expect(q.promptAr && q.promptEn, q.id).toBeTruthy();
        expect(q.optionsAr.length, q.id).toBe(q.optionsEn.length);
        expect(q.optionsAr.length, q.id).toBeGreaterThan(1);
        expect(q.answerIndex, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex, q.id).toBeLessThan(q.optionsAr.length);
      }
    }
  });
});

describe("Phase 08 — manufacturing-planner assessment coverage", () => {
  const path = jobPathBySlug("manufacturing-planner")!;
  const assessment = path.assessment;

  // Approved coverage map: 8 MCQs sample L2–L6, L8, L9, L11; the 2 written
  // responses cover L8 and L10; the 3 speaking phrases cover L1, L7 and L12.
  const LESSON_BY_QUESTION: Record<string, number> = {
    "ja-mp-assess-q1": 2,
    "ja-mp-assess-q2": 3,
    "ja-mp-assess-q3": 4,
    "ja-mp-assess-q4": 5,
    "ja-mp-assess-q5": 6,
    "ja-mp-assess-q6": 8,
    "ja-mp-assess-q7": 9,
    "ja-mp-assess-q8": 11,
  };

  it("has 8 MCQs covering the approved lessons exactly once", () => {
    const ids = assessment.quiz.map((q) => q.id).sort();
    expect(ids).toEqual(Object.keys(LESSON_BY_QUESTION).sort());
    const lessons = Object.values(LESSON_BY_QUESTION);
    expect(new Set(lessons).size).toBe(lessons.length);
    for (const n of lessons) {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(11);
    }
  });

  it("has 2 written responses and 3 speaking phrases (13 activities total)", () => {
    expect(assessment.quiz.length).toBe(8);
    expect((assessment.responses ?? []).length).toBe(2);
    expect((assessment.speaking ?? []).length).toBe(3);
    expect(
      assessment.quiz.length + (assessment.responses ?? []).length + (assessment.speaking ?? []).length
    ).toBe(13);
  });

  it("covers the shortage, delay and escalation lessons through the written responses", () => {
    expect((assessment.responses ?? []).map((r) => r.id).sort()).toEqual(
      ["ja-mp-assess-rs1", "ja-mp-assess-rs2"].sort()
    );
  });

  it("covers the role, priority and communication lessons through the speaking phrases", () => {
    expect((assessment.speaking ?? []).map((s) => s.id).sort()).toEqual(
      ["ja-mp-assess-sp1", "ja-mp-assess-sp2", "ja-mp-assess-sp3"].sort()
    );
  });

  it("does not support or declare an assessment Ordering activity", () => {
    // The assessment schema has no ordering field; guard against a future addition
    // that the UI cannot render.
    expect("order" in assessment).toBe(false);
    expect((assessment as { order?: unknown }).order).toBeUndefined();
  });

  it("does not repeat the same correct answer text within the MCQs", () => {
    const answers = assessment.quiz.map((q) => q.optionsEn[q.answerIndex]);
    expect(new Set(answers).size).toBe(answers.length);
  });
});

describe("Phase 08 — manufacturing-planner assessment semantic answer keys", () => {
  const path = jobPathBySlug("manufacturing-planner")!;
  const assessment = path.assessment;
  const byId = new Map(assessment.quiz.map((q) => [q.id, q]));

  // Semantic answer-key fixture: the exact answer text each question must resolve to,
  // in both languages. Pinning the TEXT (not just the index) means a drift of answerIndex,
  // an option reorder, or a wrong option will fail even if the index looks "in bounds".
  const ANSWER_KEY: Record<string, { en: string; ar: string; lesson: string }> = {
    "ja-mp-assess-q1": {
      en: "Determining what must be produced in the coming period.",
      ar: "تحديد ما يجب إنتاجه في الفترة القادمة.",
      lesson: "L2 reviewing production demand",
    },
    "ja-mp-assess-q2": {
      en: "Turning the demand for a product into component requirements whose availability can be checked.",
      ar: "تحويل الطلب على المنتج إلى متطلبات مكوّنات يمكن التحقق من توافرها.",
      lesson: "L3 understanding bills of materials and requirements",
    },
    "ja-mp-assess-q3": {
      en: "Comparing required quantities with those on hand to identify shortages.",
      ar: "مقارنة الكميات المطلوبة بالمتوفّرة لتحديد النقص.",
      lesson: "L4 checking material availability",
    },
    "ja-mp-assess-q4": {
      en: "Documenting what must be produced, its quantity and dates so it is ready for scheduling and execution.",
      ar: "توثيق ما يجب إنتاجه وكميته وتواريخه ليصبح جاهزًا للجدولة والتنفيذ.",
      lesson: "L5 planning manufacturing orders",
    },
    "ja-mp-assess-q5": {
      en: "Time-ordering the operations on the work centers and balancing the load with capacity.",
      ar: "ترتيب العمليات زمنيًا على مراكز العمل وموازنة الحمل مع الطاقة.",
      lesson: "L6 scheduling work centers and operations",
    },
    "ja-mp-assess-q6": {
      en: "Identifying and documenting the shortage and coordinating the need with procurement without owning purchasing.",
      ar: "تحديد النقص وتوثيقه وتنسيق الحاجة مع المشتريات دون تملّك الشراء.",
      lesson: "L8 coordinating material shortages with procurement",
    },
    "ja-mp-assess-q7": {
      en: "Comparing work done with work remaining and identifying deviation from the schedule.",
      ar: "مقارنة العمل المنجز بالمتبقّي وتحديد الانحراف عن الجدول.",
      lesson: "L9 monitoring work order progress",
    },
    "ja-mp-assess-q8": {
      en: "Scrap, downtime and the efficiency metric.",
      ar: "الهوالك والتوقّف ومؤشر الكفاءة.",
      lesson: "L11 reviewing production performance and variances",
    },
  };

  it("covers the eight assessment questions exactly", () => {
    expect([...byId.keys()].sort()).toEqual(Object.keys(ANSWER_KEY).sort());
  });

  it("resolves every answerIndex to the intended English answer text", () => {
    for (const [id, expected] of Object.entries(ANSWER_KEY)) {
      const q = byId.get(id)!;
      expect(q.answerIndex, `${id} bounds`).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex, `${id} bounds`).toBeLessThan(q.optionsEn.length);
      expect(q.optionsEn[q.answerIndex], `${id} (${expected.lesson})`).toBe(expected.en);
    }
  });

  it("resolves every answerIndex to the intended Arabic answer text", () => {
    for (const [id, expected] of Object.entries(ANSWER_KEY)) {
      const q = byId.get(id)!;
      expect(q.optionsAr[q.answerIndex], `${id} (${expected.lesson})`).toBe(expected.ar);
    }
  });

  it("keeps every option distinct in both languages", () => {
    for (const q of assessment.quiz) {
      expect(q.optionsAr.length, `${q.id} length`).toBe(q.optionsEn.length);
      expect(new Set(q.optionsEn).size, `${q.id} en distinct`).toBe(q.optionsEn.length);
      expect(new Set(q.optionsAr).size, `${q.id} ar distinct`).toBe(q.optionsAr.length);
    }
  });

  it("keeps explanations non-empty and in the matching language", () => {
    const ARABIC_RE = /[\u0600-\u06FF]/;
    for (const q of assessment.quiz) {
      const explainEn = q.explainEn ?? "";
      const explainAr = q.explainAr ?? "";
      expect(explainEn.length, `${q.id} explainEn`).toBeGreaterThan(0);
      expect(explainAr.length, `${q.id} explainAr`).toBeGreaterThan(0);
      expect(ARABIC_RE.test(explainAr), `${q.id} explainAr is Arabic`).toBe(true);
      expect(ARABIC_RE.test(explainEn), `${q.id} explainEn is not Arabic`).toBe(false);
    }
  });

  it("keeps the written responses bilingual and well-formed", () => {
    for (const r of assessment.responses ?? []) {
      expect(r.situationAr && r.situationEn, r.id).toBeTruthy();
      expect(r.optionsAr.length, r.id).toBe(r.optionsEn.length);
      expect(r.answerIndex, r.id).toBeGreaterThanOrEqual(0);
      expect(r.answerIndex, r.id).toBeLessThan(r.optionsAr.length);
    }
  });

  it("keeps the speaking phrases bilingual with tips", () => {
    for (const s of assessment.speaking ?? []) {
      expect(s.en && s.ar, s.id).toBeTruthy();
      expect(s.tipAr && s.tipEn, s.id).toBeTruthy();
    }
  });
});

describe("Phase 08 — manufacturing-planner business guardrails", () => {
  const path = jobPathBySlug("manufacturing-planner")!;
  const bySlug = new Map(path.lessons.map((l) => [l.slug, l]));

  // Teaching content only: scenario + objectives + explanations + prompts (NOT distractor
  // options). Distractors intentionally phrase the *wrong* claims to be rejected, so they
  // must not be scanned for forbidden wording.
  const teachingAllFor = (slug: string): string => {
    const l = bySlug.get(slug)!;
    return [
      l.titleEn,
      l.scenarioEn,
      l.titleAr,
      l.scenarioAr,
      ...(l.objectivesEn ?? []),
      ...(l.objectivesAr ?? []),
      ...(l.practice.mcqs ?? []).flatMap((q) => [q.promptEn, q.explainEn ?? "", q.promptAr, q.explainAr ?? ""]),
      ...(l.practice.responses ?? []).flatMap((r) => [
        r.situationEn,
        r.explainEn ?? "",
        r.situationAr,
        r.explainAr ?? "",
      ]),
      ...l.quiz.flatMap((q) => [q.promptEn, q.explainEn ?? "", q.promptAr, q.explainAr ?? ""]),
    ]
      .join(" ")
      .toLowerCase();
  };

  const correctEnFor = (slug: string): string => {
    const l = bySlug.get(slug)!;
    const picks = [...(l.practice.mcqs ?? []), ...(l.practice.responses ?? []), ...l.quiz].map(
      (q) => q.optionsEn[q.answerIndex]
    );
    return picks.join(" ").toLowerCase();
  };

  it("keeps the whole path on the plan-to-produce process only", () => {
    for (const l of path.lessons) {
      expect(l.refs.processIds ?? [], l.id).toEqual(["p2produce"]);
    }
  });

  it("never references a forbidden screen, routing or capacity word as a dedicated feature", () => {
    const FORBIDDEN_SCREENS = [
      "scr-mrp",
      "scr-routing",
      "scr-work-center",
      "scr-capacity",
      "scr-shop-floor",
    ];
    for (const l of path.lessons) {
      for (const id of l.refs.screenIds ?? []) {
        expect(FORBIDDEN_SCREENS, `${l.id} → ${id}`).not.toContain(id);
      }
    }
  });

  it("never claims an unsupported scheduling, capacity, costing, scrap or quality business function", () => {
    const allowed = new Set([
      "manufacturing-bom-define",
      "manufacturing-orders-create",
      "manufacturing-orders-produce",
    ]);
    for (const l of path.lessons) {
      for (const id of l.refs.businessFunctionIds ?? []) {
        expect(allowed.has(id), `${l.id} → ${id} must be a supported manufacturing BF`).toBe(true);
      }
    }
  });

  it("L1 keeps the planner out of execution, stock, quality and costing", () => {
    const teaching = teachingAllFor("understanding-manufacturing-planner-role");
    expect(teaching).toContain("execution");
    expect(teaching).toMatch(/quality/);
    expect(teaching).toMatch(/accounting|cost/);
  });

  it("L2 reviews demand without claiming a dedicated demand-confirmation function", () => {
    const teaching = teachingAllFor("reviewing-production-demand");
    expect(teaching).toContain("forecast");
    expect(teaching).toContain("confirmed");
    // The review relies on the plan/forecast; no single confirm-demand function is claimed.
    expect(teaching).not.toContain("confirm demand button");
  });

  it("L3 keeps BOM requirements distinct from stock", () => {
    const teaching = teachingAllFor("understanding-bills-of-materials-and-requirements");
    expect(teaching).toMatch(/component/);
    expect(teaching).toMatch(/requirements?/);
  });

  it("L4 keeps required distinct from on-hand and does not own purchasing", () => {
    const l = bySlug.get("checking-material-availability")!;
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toContain("on-hand");
    expect(teaching).toContain("required");
    // The correct answers must frame the planner as documenting the shortage, not buying.
    const correct = correctEnFor(l.slug);
    expect(correct).toMatch(/without performing the purchasing|purchasing is procurement/);
  });

  it("L5 distinguishes a manufacturing order from a work order", () => {
    const l = bySlug.get("planning-manufacturing-orders")!;
    expect(l.refs.businessFunctionIds).toEqual(["manufacturing-orders-create"]);
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toMatch(/manufacturing order/);
    expect(teaching).toMatch(/work order/);
  });

  it("L6 schedules operations without claiming a dedicated routing/capacity screen", () => {
    const l = bySlug.get("scheduling-work-centers-and-operations")!;
    expect(l.refs.screenIds ?? []).toEqual([]);
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toContain("routing");
    expect(teaching).toContain("capacity");
    // Scheduling time-orders operations; it does not perform the physical operation.
    expect(teaching).not.toContain("performs the operation on the shop floor");
  });

  it("L8 documents buying coordination but never owns purchasing", () => {
    const l = bySlug.get("coordinating-material-shortages-with-procurement")!;
    // Purchasing/negotiation belong to procurement, not the planner.
    for (const lesson of path.lessons) {
      for (const id of lesson.refs.businessFunctionIds ?? []) {
        expect(id, `${lesson.id} must not claim a purchasing BF`).not.toMatch(
          /purchasing|vendor-bills|purchase-order/
        );
      }
    }
    const correct = correctEnFor(l.slug);
    expect(correct).toContain("negotiation and purchasing are your responsibility");
  });

  it("L10 does not assume an automated rescheduling or change-approval workflow", () => {
    const l = bySlug.get("handling-production-delays-and-planning-changes")!;
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toContain("reschedul");
    expect(teaching).toMatch(/automated|workflow/);
    for (const forbidden of [
      "automated rescheduling workflow exists",
      "rescheduling is automated",
      "change approval workflow exists",
    ]) {
      expect(teaching, `forbidden taught claim: ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("L11 reviews operational metrics without owning costing or valuation", () => {
    const l = bySlug.get("reviewing-production-performance-and-variances")!;
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toMatch(/scrap|downtime|efficiency/);
    // The path must teach that costing and valuation are NOT the planner's: the
    // wording "without owning costing" is the correct limitation, so scan for
    // positive ownership claims instead of the substring "owning costing".
    for (const forbidden of [
      "planner owns costing",
      "planner owns inventory valuation",
      "the planner calculates the production cost",
    ]) {
      expect(teaching, `forbidden taught claim: ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("L12 frames escalation as communication, not an automated approval workflow", () => {
    const l = bySlug.get("communicating-production-plans-and-escalating-risks")!;
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toContain("escalat");
    expect(teaching).toMatch(/communication|communicat/);
    for (const forbidden of [
      "escalation is an automated workflow",
      "escalation approval workflow exists",
      "escalation is automated",
    ]) {
      expect(teaching, `forbidden taught claim: ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("does not reuse plan-to-produce quiz text verbatim in the assessment", () => {
    const p2p = processById("p2produce")!;
    const source = p2p.quiz?.map((q) => q.promptEn.toLowerCase()) ?? [];
    for (const q of path.assessment.quiz) {
      expect(source, `${q.id} prompt must not be copied verbatim`).not.toContain(q.promptEn.toLowerCase());
    }
  });
});

// Tiny local helper: normalise an optional string[] to [] for safe `.toContain`.
function ipLocal(arr: string[] | undefined): string[] {
  return arr ?? [];
}

describe("Phase 09 — warehouse-officer path shape", () => {
  const path = jobPathBySlug("warehouse-officer")!;

  it("exists with the expected identity and metadata", () => {
    expect(path).toBeTruthy();
    expect(path.id).toBe("job-warehouse-officer");
    expect(path.slug).toBe("warehouse-officer");
    expect(path.status).toBe("planned");
    expect(path.level).toBe("B2");
    expect(path.titleEn).toBe("ERP Warehouse Officer");
    expect(path.icon).toBeTruthy();
    expect(path.summaryAr && path.summaryEn, "summary").toBeTruthy();
    expect(path.descAr && path.descEn, "desc").toBeTruthy();
    expect(path.learningObjectivesAr.length).toBeGreaterThan(0);
    expect(path.learningObjectivesAr.length).toBe(path.learningObjectivesEn.length);
  });

  it("does not link to a career path (no warehouse career path exists)", () => {
    expect(path.careerPathId).toBeUndefined();
  });

  it("has exactly 12 lessons ordered 1..12 with the approved slugs", () => {
    expect(path.lessons.length).toBe(12);
    path.lessons.forEach((l, i) => {
      expect(l.order, l.id).toBe(i + 1);
      expect(l.level, l.id).toBe("B2");
    });
    expect(path.lessons.map((l) => l.slug)).toEqual([
      "understanding-warehouse-officer-role",
      "receiving-goods",
      "handling-receiving-discrepancies",
      "putaway-and-storage-locations",
      "stock-availability-and-on-hand",
      "stock-picking-and-order-preparation",
      "packing-and-shipping",
      "internal-stock-transfers",
      "inventory-adjustments",
      "cycle-counting-and-physical-inventory",
      "lot-serial-batch-traceability",
      "managing-replenishment-and-stock-risks",
    ]);
  });

  it("uses the approved lesson ids job-wo-01..job-wo-12", () => {
    expect(path.lessons.map((l) => l.id)).toEqual([
      "job-wo-01-understanding-warehouse-officer-role",
      "job-wo-02-receiving-goods",
      "job-wo-03-handling-receiving-discrepancies",
      "job-wo-04-putaway-and-storage-locations",
      "job-wo-05-stock-availability-and-on-hand",
      "job-wo-06-stock-picking-and-order-preparation",
      "job-wo-07-packing-and-shipping",
      "job-wo-08-internal-stock-transfers",
      "job-wo-09-inventory-adjustments",
      "job-wo-10-cycle-counting-and-physical-inventory",
      "job-wo-11-lot-serial-batch-traceability",
      "job-wo-12-managing-replenishment-and-stock-risks",
    ]);
  });

  it("remains planned and is not exposed as a ready path", () => {
    expect(path.status).toBe("planned");
    expect(READY_JOB_PATHS.some((p) => p.slug === "warehouse-officer")).toBe(false);
  });

  it("keeps every lesson id and activity id unique project-wide", () => {
    const lessonIds = JOB_PATHS.flatMap((p) => p.lessons.map((l) => l.id));
    expect(new Set(lessonIds).size).toBe(lessonIds.length);

    const activityIds = JOB_PATHS.flatMap((p) => [
      ...p.lessons.flatMap((l) => [
        ...(l.practice.mcqs ?? []).map((a) => a.id),
        ...(l.practice.responses ?? []).map((a) => a.id),
        ...(l.practice.order ?? []).map((a) => a.id),
        ...(l.practice.phrases ?? []).map((a) => a.id),
        ...l.quiz.map((a) => a.id),
      ]),
      ...p.assessment.quiz.map((a) => a.id),
      ...(p.assessment.responses ?? []).map((a) => a.id),
      ...(p.assessment.speaking ?? []).map((a) => a.id),
    ]);
    expect(new Set(activityIds).size).toBe(activityIds.length);
  });
});

describe("Phase 09 — warehouse-officer lesson refs", () => {
  const path = jobPathBySlug("warehouse-officer")!;
  const bySlug = new Map(path.lessons.map((l) => [l.slug, l]));

  // Approved reference map (Phase 09.2). Pinned so a drift of a ref is caught.
  const EXPECTED_REFS: Record<
    string,
    {
      processIds?: string[];
      subModuleIds?: string[];
      businessFunctionIds?: string[];
      wordIds?: string[];
      screenIds?: string[];
      emailLessonSlugs?: string[];
      meetingLessonSlugs?: string[];
    }
  > = {
    "understanding-warehouse-officer-role": {
      processIds: ["o2c"],
      subModuleIds: ["warehouse-operations", "warehouse-receiving"],
      wordIds: ["warehouse", "goods-receipt", "put-away", "pick-list"],
      screenIds: ["scr-warehouse"],
      meetingLessonSlugs: ["introducing-yourself-role"],
    },
    "receiving-goods": {
      processIds: ["p2p"],
      subModuleIds: ["warehouse-receiving", "purchasing-receipts"],
      businessFunctionIds: ["purchasing-receipts-receive"],
      wordIds: ["goods-receipt", "barcode", "sku"],
      screenIds: ["scr-goods-receipt"],
    },
    "handling-receiving-discrepancies": {
      processIds: ["p2p"],
      subModuleIds: ["warehouse-receiving", "purchasing-receipts"],
      businessFunctionIds: ["purchasing-receipts-receive"],
      wordIds: ["goods-receipt", "stockout", "backorder"],
      screenIds: ["scr-goods-receipt"],
      emailLessonSlugs: ["issue-escalation"],
    },
    "putaway-and-storage-locations": {
      processIds: ["p2p"],
      subModuleIds: ["warehouse-putaway", "warehouse-locations"],
      wordIds: ["put-away", "bin-location", "warehouse"],
      screenIds: ["fld-warehouse", "fld-location"],
    },
    "stock-availability-and-on-hand": {
      processIds: ["o2c"],
      subModuleIds: ["inventory-on-hand", "warehouse-operations"],
      wordIds: ["stock", "sku", "stockout"],
      screenIds: ["scr-warehouse"],
    },
    "stock-picking-and-order-preparation": {
      processIds: ["o2c"],
      subModuleIds: ["warehouse-picking"],
      wordIds: ["pick-list", "bin-location", "barcode"],
      screenIds: ["scr-delivery"],
    },
    "packing-and-shipping": {
      processIds: ["o2c"],
      subModuleIds: ["warehouse-packing", "warehouse-shipping"],
      wordIds: ["delivery-note", "cross-docking"],
      screenIds: ["scr-delivery"],
    },
    "internal-stock-transfers": {
      processIds: ["p2p"],
      subModuleIds: ["warehouse-locations", "inventory-transfers"],
      businessFunctionIds: ["inventory-transfers-create"],
      wordIds: ["stock-transfer", "bin-location", "warehouse"],
      screenIds: ["scr-stock-transfer"],
    },
    "inventory-adjustments": {
      processIds: ["p2p"],
      subModuleIds: ["inventory-adjustments", "warehouse-operations"],
      businessFunctionIds: ["inventory-adjustments-apply"],
      wordIds: ["adjustment", "stock", "sku"],
      screenIds: ["scr-inventory-adjustment"],
    },
    "cycle-counting-and-physical-inventory": {
      processIds: ["p2p"],
      subModuleIds: ["warehouse-cycle-counting", "warehouse-operations"],
      businessFunctionIds: ["inventory-cycle-count"],
      wordIds: ["cycle-count", "physical-inventory", "abc-analysis"],
      screenIds: ["scr-stock-count"],
    },
    "lot-serial-batch-traceability": {
      processIds: ["p2produce"],
      subModuleIds: ["inventory-lot-serial", "warehouse-operations"],
      wordIds: ["lot-number", "batch", "sku"],
      screenIds: ["fld-batch", "fld-serial-number"],
    },
    "managing-replenishment-and-stock-risks": {
      processIds: ["p2p"],
      subModuleIds: ["inventory-reordering", "warehouse-operations"],
      wordIds: ["reorder-point", "safety-stock", "min-max", "lead-time", "abc-analysis"],
      screenIds: ["scr-report-center"],
      meetingLessonSlugs: ["problems-action-items"],
    },
  };

  it("covers all 12 lessons", () => {
    expect([...bySlug.keys()].sort()).toEqual(Object.keys(EXPECTED_REFS).sort());
  });

  it("matches the approved reference map exactly", () => {
    for (const [slug, expected] of Object.entries(EXPECTED_REFS)) {
      const refs = bySlug.get(slug)!.refs;
      expect(refs.processIds ?? [], `${slug} processIds`).toEqual(expected.processIds ?? []);
      expect(refs.subModuleIds ?? [], `${slug} subModuleIds`).toEqual(expected.subModuleIds ?? []);
      expect(refs.businessFunctionIds ?? [], `${slug} businessFunctionIds`).toEqual(
        expected.businessFunctionIds ?? []
      );
      expect(refs.wordIds ?? [], `${slug} wordIds`).toEqual(expected.wordIds ?? []);
      expect(refs.screenIds ?? [], `${slug} screenIds`).toEqual(expected.screenIds ?? []);
      expect(refs.emailLessonSlugs ?? [], `${slug} emailLessonSlugs`).toEqual(
        expected.emailLessonSlugs ?? []
      );
      expect(refs.meetingLessonSlugs ?? [], `${slug} meetingLessonSlugs`).toEqual(
        expected.meetingLessonSlugs ?? []
      );
    }
  });

  it("resolves every reference against the existing content", () => {
    for (const l of path.lessons) {
      const refs = l.refs;
      for (const id of refs.processIds ?? []) {
        expect(processById(id), `${l.slug} → process ${id}`).toBeTruthy();
      }
      for (const id of refs.subModuleIds ?? []) {
        expect(SUB_MODULE_ID_SET.has(id), `${l.slug} → subModule ${id}`).toBe(true);
      }
      for (const id of refs.businessFunctionIds ?? []) {
        expect(BUSINESS_FUNCTION_ID_SET.has(id), `${l.slug} → businessFunction ${id}`).toBe(true);
      }
      for (const id of [...(refs.wordIds ?? []), ...(refs.screenIds ?? [])]) {
        expect(wordById(id), `${l.slug} → word ${id}`).toBeTruthy();
      }
      for (const slug of refs.emailLessonSlugs ?? []) {
        expect(emailBySlug(slug), `${l.slug} → email ${slug}`).toBeTruthy();
      }
      for (const slug of refs.meetingLessonSlugs ?? []) {
        expect(meetingBySlug(slug), `${l.slug} → meeting ${slug}`).toBeTruthy();
      }
    }
  });

  it("only links quiz questions to existing words", () => {
    const quiz = [
      ...path.lessons.flatMap((l) => l.quiz),
      ...path.lessons.flatMap((l) => l.practice.mcqs ?? []),
      ...path.assessment.quiz,
    ];
    for (const q of quiz) {
      if (q.wordId) {
        expect(wordById(q.wordId), `${q.id} → word ${q.wordId}`).toBeTruthy();
      }
    }
  });
});

describe("Phase 09 — warehouse-officer practice shape", () => {
  const path = jobPathBySlug("warehouse-officer")!;

  it("gives every lesson 2 MCQs, 1 response, a 5-step ordering and 2 phrases", () => {
    for (const l of path.lessons) {
      expect(l.practice.mcqs?.length, `${l.id} mcqs`).toBe(2);
      expect(l.practice.responses?.length, `${l.id} responses`).toBe(1);
      expect(l.practice.order?.length, `${l.id} order`).toBe(5);
      expect(l.practice.phrases?.length, `${l.id} phrases`).toBe(2);
    }
  });

  it("gives every lesson a 5-question quiz with complete bilingual options", () => {
    for (const l of path.lessons) {
      expect(l.quiz.length, `${l.id} quiz`).toBe(5);
      for (const q of l.quiz) {
        expect(q.promptAr && q.promptEn, q.id).toBeTruthy();
        expect(q.optionsAr.length, q.id).toBe(q.optionsEn.length);
        expect(q.optionsAr.length, q.id).toBeGreaterThan(1);
        expect(q.answerIndex, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex, q.id).toBeLessThan(q.optionsAr.length);
      }
    }
  });
});

describe("Phase 09 — warehouse-officer assessment coverage", () => {
  const path = jobPathBySlug("warehouse-officer")!;
  const assessment = path.assessment;

  // Approved coverage map: 8 MCQs sample L2–L7, L9, L11; the 2 written
  // responses cover L3 and L12; the 3 speaking phrases cover L1, L8 and L10.
  const LESSON_BY_QUESTION: Record<string, number> = {
    "ja-wo-assess-q1": 2,
    "ja-wo-assess-q2": 3,
    "ja-wo-assess-q3": 4,
    "ja-wo-assess-q4": 5,
    "ja-wo-assess-q5": 6,
    "ja-wo-assess-q6": 7,
    "ja-wo-assess-q7": 9,
    "ja-wo-assess-q8": 11,
  };

  it("has 8 MCQs covering the approved lessons exactly once", () => {
    const ids = assessment.quiz.map((q) => q.id).sort();
    expect(ids).toEqual(Object.keys(LESSON_BY_QUESTION).sort());
    const lessons = Object.values(LESSON_BY_QUESTION);
    expect(new Set(lessons).size).toBe(lessons.length);
    for (const n of lessons) {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(12);
    }
  });

  it("has 2 written responses and 3 speaking phrases (13 activities total)", () => {
    expect(assessment.quiz.length).toBe(8);
    expect((assessment.responses ?? []).length).toBe(2);
    expect((assessment.speaking ?? []).length).toBe(3);
    expect(
      assessment.quiz.length + (assessment.responses ?? []).length + (assessment.speaking ?? []).length
    ).toBe(13);
  });

  it("covers the discrepancy and replenishment lessons through the written responses", () => {
    expect((assessment.responses ?? []).map((r) => r.id).sort()).toEqual(
      ["ja-wo-assess-r1", "ja-wo-assess-r2"].sort()
    );
  });

  it("covers the role, transfer and counting lessons through the speaking phrases", () => {
    expect((assessment.speaking ?? []).map((s) => s.id).sort()).toEqual(
      ["ja-wo-assess-sp1", "ja-wo-assess-sp2", "ja-wo-assess-sp3"].sort()
    );
  });

  it("does not support or declare an assessment Ordering activity", () => {
    // The assessment schema has no ordering field; guard against a future addition
    // that the UI cannot render.
    expect("order" in assessment).toBe(false);
    expect((assessment as { order?: unknown }).order).toBeUndefined();
  });

  it("does not repeat the same correct answer text within the MCQs", () => {
    const answers = assessment.quiz.map((q) => q.optionsEn[q.answerIndex]);
    expect(new Set(answers).size).toBe(answers.length);
  });
});

describe("Phase 09 — warehouse-officer assessment semantic answer keys", () => {
  const path = jobPathBySlug("warehouse-officer")!;
  const assessment = path.assessment;
  const byId = new Map(assessment.quiz.map((q) => [q.id, q]));

  // Semantic answer-key fixture: the exact answer text each question must resolve to,
  // in both languages. Pinning the TEXT (not just the index) means a drift of answerIndex,
  // an option reorder, or a wrong option will fail even if the index looks "in bounds".
  const ANSWER_KEY: Record<string, { en: string; ar: string; lesson: string }> = {
    "ja-wo-assess-q1": {
      en: "Confirming that what was ordered actually arrived before recording the receipt.",
      ar: "التأكد من وصول ما طُلب فعليًا قبل تسجيل الاستلام.",
      lesson: "L2 receiving goods",
    },
    "ja-wo-assess-q2": {
      en: "I count and document the discrepancy, record the receipt, then communicate with procurement to follow it up.",
      ar: "أعدّ وأوثّق الفرق وأسجّل الاستلام ثم أتواصل مع المشتريات لمتابعته.",
      lesson: "L3 handling receiving discrepancies",
    },
    "ja-wo-assess-q3": {
      en: "Moving the received goods to the appropriate location so they are stored in an organised and traceable way.",
      ar: "نقل البضاعة المستلمة إلى الموقع المناسب لتخزينها بشكل منظّم وقابل للتتبّع.",
      lesson: "L4 putaway and storage locations",
    },
    "ja-wo-assess-q4": {
      en: "The recorded quantity is what shows in stock, and part of it may be reserved or committed, so not all of it is available.",
      ar: "الكمية المسجّلة ما يظهر في المخزون، وقد تكون بعضها محجوزًا أو ملتزمًا به فليست كلها متاحة.",
      lesson: "L5 stock availability and on-hand",
    },
    "ja-wo-assess-q5": {
      en: "Specifying the items, quantities and locations to be picked to fulfil the order.",
      ar: "تحديد الأصناف والكميات والمواقع التي يجب سحبها لتلبية الطلب.",
      lesson: "L6 stock picking and order preparation",
    },
    "ja-wo-assess-q6": {
      en: "A document describing the shipped goods; it is a document, not proof of a goods-issue capability.",
      ar: "مستند يعرّف بالبضاعة المشحونة، وهو مستند وليس إثباتًا لوظيفة إصدار بضاعة.",
      lesson: "L7 packing and shipping",
    },
    "ja-wo-assess-q7": {
      en: "Identify, then verify and document, then obtain required authorization, then apply.",
      ar: "التحديد ثم التحقق والتوثيق ثم التصريح المطلوب ثم التطبيق.",
      lesson: "L9 inventory adjustments",
    },
    "ja-wo-assess-q8": {
      en: "Operational traceability of the goods' path without claiming regulatory or pharmaceutical coverage.",
      ar: "تتبّع تشغيلي لمسار البضاعة دون ادّعاء تغطية تنظيمية أو دوائية.",
      lesson: "L11 lot, serial and batch traceability",
    },
  };

  it("covers the eight assessment questions exactly", () => {
    expect([...byId.keys()].sort()).toEqual(Object.keys(ANSWER_KEY).sort());
  });

  it("resolves every answerIndex to the intended English answer text", () => {
    for (const [id, expected] of Object.entries(ANSWER_KEY)) {
      const q = byId.get(id)!;
      expect(q.answerIndex, `${id} bounds`).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex, `${id} bounds`).toBeLessThan(q.optionsEn.length);
      expect(q.optionsEn[q.answerIndex], `${id} (${expected.lesson})`).toBe(expected.en);
    }
  });

  it("resolves every answerIndex to the intended Arabic answer text", () => {
    for (const [id, expected] of Object.entries(ANSWER_KEY)) {
      const q = byId.get(id)!;
      expect(q.optionsAr[q.answerIndex], `${id} (${expected.lesson})`).toBe(expected.ar);
    }
  });

  it("places the MCQs at the planned answer indices [2,3,0,1,2,3,0,1]", () => {
    const planned = [2, 3, 0, 1, 2, 3, 0, 1];
    assessment.quiz.forEach((q, i) => {
      expect(q.answerIndex, q.id).toBe(planned[i]);
    });
  });

  it("keeps every option distinct in both languages", () => {
    for (const q of assessment.quiz) {
      expect(q.optionsAr.length, `${q.id} length`).toBe(q.optionsEn.length);
      expect(new Set(q.optionsEn).size, `${q.id} en distinct`).toBe(q.optionsEn.length);
      expect(new Set(q.optionsAr).size, `${q.id} ar distinct`).toBe(q.optionsAr.length);
    }
  });

  it("keeps explanations non-empty and in the matching language", () => {
    const ARABIC_RE = /[\u0600-\u06FF]/;
    for (const q of assessment.quiz) {
      const explainEn = q.explainEn ?? "";
      const explainAr = q.explainAr ?? "";
      expect(explainEn.length, `${q.id} explainEn`).toBeGreaterThan(0);
      expect(explainAr.length, `${q.id} explainAr`).toBeGreaterThan(0);
      expect(ARABIC_RE.test(explainAr), `${q.id} explainAr is Arabic`).toBe(true);
      expect(ARABIC_RE.test(explainEn), `${q.id} explainEn is not Arabic`).toBe(false);
    }
  });

  it("keeps the written responses bilingual and well-formed", () => {
    for (const r of assessment.responses ?? []) {
      expect(r.situationAr && r.situationEn, r.id).toBeTruthy();
      expect(r.optionsAr.length, r.id).toBe(r.optionsEn.length);
      expect(r.answerIndex, r.id).toBeGreaterThanOrEqual(0);
      expect(r.answerIndex, r.id).toBeLessThan(r.optionsAr.length);
    }
  });

  it("keeps the speaking phrases bilingual with tips", () => {
    for (const s of assessment.speaking ?? []) {
      expect(s.en && s.ar, s.id).toBeTruthy();
      expect(s.tipAr && s.tipEn, s.id).toBeTruthy();
    }
  });
});

describe("Phase 09 — warehouse-officer business guardrails", () => {
  const path = jobPathBySlug("warehouse-officer")!;
  const bySlug = new Map(path.lessons.map((l) => [l.slug, l]));

  // Teaching content only: scenario + objectives + explanations + prompts (NOT distractor
  // options). Distractors intentionally phrase the *wrong* claims to be rejected, so they
  // must not be scanned for forbidden wording.
  const teachingAllFor = (slug: string): string => {
    const l = bySlug.get(slug)!;
    return [
      l.titleEn,
      l.scenarioEn,
      l.titleAr,
      l.scenarioAr,
      ...(l.objectivesEn ?? []),
      ...(l.objectivesAr ?? []),
      ...(l.practice.mcqs ?? []).flatMap((q) => [q.promptEn, q.explainEn ?? "", q.promptAr, q.explainAr ?? ""]),
      ...(l.practice.responses ?? []).flatMap((r) => [
        r.situationEn,
        r.explainEn ?? "",
        r.situationAr,
        r.explainAr ?? "",
      ]),
      ...l.quiz.flatMap((q) => [q.promptEn, q.explainEn ?? "", q.promptAr, q.explainAr ?? ""]),
    ]
      .join(" ")
      .toLowerCase();
  };

  const correctEnFor = (slug: string): string => {
    const l = bySlug.get(slug)!;
    const picks = [...(l.practice.mcqs ?? []), ...(l.practice.responses ?? []), ...l.quiz].map(
      (q) => q.optionsEn[q.answerIndex]
    );
    return picks.join(" ").toLowerCase();
  };

  it("never claims an unsupported warehouse business function", () => {
    const allowed = new Set([
      "purchasing-receipts-receive",
      "inventory-transfers-create",
      "inventory-adjustments-apply",
      "inventory-cycle-count",
    ]);
    for (const l of path.lessons) {
      for (const id of l.refs.businessFunctionIds ?? []) {
        expect(allowed.has(id), `${l.id} → ${id} must be a supported warehouse-related BF`).toBe(true);
      }
    }
  });

  it("never references a forbidden screen as a dedicated capability", () => {
    const FORBIDDEN_SCREENS = [
      "scr-mrp",
      "scr-putaway",
      "scr-availability",
      "scr-replenishment",
      "scr-discrepancy",
      "scr-reservations",
      "scr-goods-issue",
    ];
    for (const l of path.lessons) {
      for (const id of l.refs.screenIds ?? []) {
        expect(FORBIDDEN_SCREENS, `${l.id} → ${id}`).not.toContain(id);
      }
    }
  });

  it("L1 keeps the warehouse out of purchasing, valuation and production", () => {
    const teaching = teachingAllFor("understanding-warehouse-officer-role");
    expect(teaching).toMatch(/purchas|procurement/);
    expect(teaching).toMatch(/valuation|account|cost/);
    expect(teaching).toContain("production");
  });

  it("L2 keeps goods receipt distinct from vendor invoice matching", () => {
    const l = bySlug.get("receiving-goods")!;
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toMatch(/invoice/);
    expect(teaching).toMatch(/receipt/);
    const correct = correctEnFor(l.slug);
    expect(correct).toMatch(/matching and payment are your responsibility/);
  });

  it("L3 teaches counting, documenting and communicating without an invented discrepancy screen", () => {
    const l = bySlug.get("handling-receiving-discrepancies")!;
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toContain("count");
    expect(teaching).toMatch(/document/);
    expect(teaching).toMatch(/communicat/);
    for (const forbidden of [
      "discrepancy screen exists",
      "automated discrepancy workflow exists",
      "a dedicated discrepancy screen handles",
    ]) {
      expect(teaching, `forbidden taught claim: ${forbidden}`).not.toContain(forbidden);
    }
    const correct = correctEnFor(l.slug);
    expect(correct).toMatch(/count and document the discrepancy/);
  });

  it("L4 keeps putaway operational without a dedicated screen or automatic allocation", () => {
    const l = bySlug.get("putaway-and-storage-locations")!;
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toContain("putaway");
    expect(teaching).toMatch(/location/);
    for (const forbidden of [
      "putaway screen exists",
      "automatic location allocation exists",
      "locations are allocated automatically",
    ]) {
      expect(teaching, `forbidden taught claim: ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("L5 keeps recorded distinct from available and avoids a reservations screen", () => {
    const l = bySlug.get("stock-availability-and-on-hand")!;
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toMatch(/recorded/);
    expect(teaching).toMatch(/available/);
    expect(teaching).toMatch(/commitment|reservation/);
    for (const forbidden of [
      "reservations screen exists",
      "availability screen exists",
      "the recorded quantity is always available",
    ]) {
      expect(teaching, `forbidden taught claim: ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("L6 distinguishes picking from packing and shipping", () => {
    const teaching = teachingAllFor("stock-picking-and-order-preparation");
    expect(teaching).toMatch(/pick/);
    expect(teaching).toMatch(/pack/);
    expect(teaching).toMatch(/ship/);
    expect(teaching).toMatch(/separate/);
  });

  it("L7 keeps the delivery note a document and denies it proves a goods-issue capability", () => {
    const l = bySlug.get("packing-and-shipping")!;
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toMatch(/document/);
    expect(teaching).toMatch(/process/);
    for (const forbidden of [
      "the delivery note executes goods issue",
      "the delivery note confirms goods issue",
      "goods-issue function exists",
    ]) {
      expect(teaching, `forbidden taught claim: ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("L8 keeps internal transfers out of purchasing and production", () => {
    const l = bySlug.get("internal-stock-transfers")!;
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toMatch(/transfer/);
    expect(teaching).toMatch(/purchas/);
    expect(teaching).toMatch(/production/);
    const correct = correctEnFor(l.slug);
    expect(correct).toMatch(/neither purchasing nor production|it is not a purchase/);
  });

  it("L9 distinguishes adjustment steps and requires authorization without an invented workflow", () => {
    const l = bySlug.get("inventory-adjustments")!;
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toMatch(/verif/);
    expect(teaching).toMatch(/document/);
    expect(teaching).toMatch(/authoriz/);
    for (const forbidden of [
      "approval workflow exists",
      "permission model exists",
      "adjustment is applied automatically",
    ]) {
      expect(teaching, `forbidden taught claim: ${forbidden}`).not.toContain(forbidden);
    }
    const correct = correctEnFor(l.slug);
    expect(correct).toMatch(/obtain any required authorization according to the organization's controls/);
  });

  it("L10 teaches that counting does not automatically update stock", () => {
    const l = bySlug.get("cycle-counting-and-physical-inventory")!;
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toMatch(/count/);
    for (const forbidden of [
      "counting updates stock automatically",
      "counting automatically corrects the quantities",
      "the system corrects the quantities automatically",
    ]) {
      expect(teaching, `forbidden taught claim: ${forbidden}`).not.toContain(forbidden);
    }
    const correct = correctEnFor(l.slug);
    expect(correct).toMatch(/counting records the results/);
  });

  it("L11 keeps traceability operational without regulatory or pharmaceutical claims", () => {
    const l = bySlug.get("lot-serial-batch-traceability")!;
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toMatch(/batch|serial|lot/);
    expect(teaching).toMatch(/trace/);
    for (const forbidden of [
      "regulatory compliance is covered",
      "ensures regulatory compliance",
      "pharmaceutical compliance is covered",
      "guarantees regulatory compliance",
    ]) {
      expect(teaching, `forbidden taught claim: ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("L12 frames replenishment as identify-and-communicate, not an automated purchase", () => {
    const l = bySlug.get("managing-replenishment-and-stock-risks")!;
    const teaching = teachingAllFor(l.slug);
    expect(teaching).toMatch(/communicat/);
    expect(teaching).toMatch(/procurement/);
    for (const forbidden of [
      "automated replenishment workflow exists",
      "replenishment is automated",
      "the warehouse buys",
    ]) {
      expect(teaching, `forbidden taught claim: ${forbidden}`).not.toContain(forbidden);
    }
    const correct = correctEnFor(l.slug);
    expect(correct).toMatch(/purchasing is (your|their) responsibility|identifying the need/);
  });

  it("keeps valuation and accounting out of warehouse ownership across the path", () => {
    // No lesson may reference an inventory-valuation business function.
    for (const l of path.lessons) {
      for (const id of l.refs.businessFunctionIds ?? []) {
        expect(id, `${l.id} must not claim a valuation BF`).not.toMatch(/valuation|journal|gl-/);
      }
    }
  });

  it("does not reuse plan-to-produce quiz text verbatim in the assessment", () => {
    const p2p = processById("p2produce")!;
    const source = p2p.quiz?.map((q) => q.promptEn.toLowerCase()) ?? [];
    for (const q of path.assessment.quiz) {
      expect(source, `${q.id} prompt must not be copied verbatim`).not.toContain(q.promptEn.toLowerCase());
    }
  });
});


