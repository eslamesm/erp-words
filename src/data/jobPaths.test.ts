import { describe, it, expect } from "vitest";
import {
  JOB_PATHS,
  JOB_PATH_SLUGS,
  READY_JOB_PATHS,
  jobPathBySlug,
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

// Every MCQ-like item in the curriculum (lesson mcqs, lesson quiz, assessment quiz,
// lesson responses, assessment responses). Order in optionsAr mirrors optionsEn 1:1,
// so a single answerIndex applies to both languages.
function collectMcqItems() {
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

describe("Phase 05.6 — answer positions (Task 1)", () => {
  const items = collectMcqItems();

  it("covers all 106 MCQ items", () => {
    expect(items.length).toBe(106);
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

  it("does not ship placeholder planned paths in the pilot release", () => {
    // Phase 05.6 decision: planned paths stay hidden and no placeholder path is added.
    expect(JOB_PATHS.filter((p) => p.status === "planned").length).toBe(0);
    expect(JOB_PATHS.length).toBe(READY_JOB_PATHS.length);
  });
});
