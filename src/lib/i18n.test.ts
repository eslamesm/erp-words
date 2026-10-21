import { describe, it, expect } from "vitest";
import { DICTS } from "@/lib/i18n";

// المفاتيح المشتركة لواجهة «التعلّم حسب الوظيفة» (Phase 05.2).
// لا تتضمّن أي محتوى دروس — ذلك يبقى مزدوج اللغة داخل src/data/jobPaths.ts.
const JOB_KEYS = [
  "job.title",
  "job.subtitle",
  "job.pathsTitle",
  "job.plannedTitle",
  "job.open",
  "job.comingSoon",
  "job.notFound",
  "job.lessonNotFound",
  "job.backToPaths",
  "job.lessonsCount",
  "job.status.ready",
  "job.status.planned",
  "job.pathOverview",
  "job.goals",
  "job.careerPath",
  "job.openCareerPath",
  "job.totalLessons",
  "job.lessonList",
  "job.lessonLabel",
  "job.lessonOf",
  "job.prevLesson",
  "job.nextLesson",
  "job.backToPath",
  "job.progressLabel",
  "job.progressCount",
  "job.markComplete",
  "job.lessonDone",
  "job.pathDone",
  "job.section.context",
  "job.section.objectives",
  "job.section.refs",
  "job.section.practice",
  "job.section.quiz",
  "job.section.assessment",
  "job.section.challenge",
  "job.stage.learn",
  "job.stage.learnDesc",
  "job.stage.practice",
  "job.stage.practiceDesc",
  "job.stage.challenge",
  "job.stage.challengeDesc",
  "job.refs.processes",
  "job.refs.subModules",
  "job.refs.businessFunctions",
  "job.refs.words",
  "job.refs.screens",
  "job.refs.emails",
  "job.refs.meetings",
  "job.refs.none",
  "job.practiceIntro",
  "job.practiceChoose",
  "job.practiceRespond",
  "job.practiceOrder",
  "job.practicePhrases",
  "job.orderPrompt",
  "job.checkOrder",
  "job.correctOrder",
  "job.wrongOrder",
  "job.resetOrder",
  "job.moveUp",
  "job.moveDown",
  "job.chooseBest",
  "job.quizIntro",
  "job.submit",
  "job.retry",
  "job.score",
  "job.pass",
  "job.failHint",
  "job.correct",
  "job.incorrect",
  "job.wellDone",
  "job.tryAgain",
  "job.continue",
  "job.start",
  "job.restart",
  "job.assessment.intro",
  "job.assessment.start",
  "job.assessment.responsesTitle",
  "job.assessment.speakingTitle",
  "job.assessment.scoreLabel",
  "job.speaking.intro",
  "job.speaking.listen",
  "job.speaking.limit",
  "job.challenge.taskTitle",
  "job.challenge.checklist",
  "job.challenge.writeArea",
  "job.challenge.placeholder",
  "job.challenge.selfAssess",
  "job.challenge.showReference",
  "job.challenge.hideReference",
  "job.challenge.referenceTitle",
  "job.empty",
  "job.emptyDesc",
  "job.comingSoonDesc",
];

describe("i18n dictionaries parity", () => {
  it("defines the same key set in Arabic and English", () => {
    const arKeys = Object.keys(DICTS.ar).sort();
    const enKeys = Object.keys(DICTS.en).sort();
    const onlyAr = arKeys.filter((k) => !(k in DICTS.en));
    const onlyEn = enKeys.filter((k) => !(k in DICTS.ar));
    expect(onlyAr, "keys only in ar").toEqual([]);
    expect(onlyEn, "keys only in en").toEqual([]);
    expect(arKeys).toEqual(enKeys);
  });
});

describe("job.* i18n coverage (Phase 05.2)", () => {
  it("defines every required job.* key in both Arabic and English", () => {
    for (const key of JOB_KEYS) {
      expect(DICTS.ar[key], `ar missing: ${key}`).toBeTruthy();
      expect(DICTS.en[key], `en missing: ${key}`).toBeTruthy();
    }
  });

  it("keeps English distinct from Arabic for translated labels", () => {
    const suspicious = JOB_KEYS.filter(
      (k) => DICTS.en[k] === DICTS.ar[k] && !DICTS.en[k].startsWith("{")
    );
    expect(suspicious).toEqual([]);
  });

  it("has an equal number of job.* keys in both dictionaries", () => {
    const arCount = Object.keys(DICTS.ar).filter((k) => k.startsWith("job.")).length;
    const enCount = Object.keys(DICTS.en).filter((k) => k.startsWith("job.")).length;
    expect(arCount).toBe(enCount);
    expect(arCount).toBeGreaterThanOrEqual(90);
  });

  it("lists every defined job.* key in the required coverage set", () => {
    const required = new Set(JOB_KEYS);
    const defined = Object.keys(DICTS.ar).filter((k) => k.startsWith("job."));
    const undocumented = defined.filter((k) => !required.has(k));
    expect(undocumented, "job.* keys not covered by the test").toEqual([]);
  });
});
