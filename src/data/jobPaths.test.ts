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

  it("uses a valid status and ships one ready pilot path", () => {
    for (const p of JOB_PATHS) {
      expect(["ready", "planned"], p.id).toContain(p.status);
    }
    expect(JOB_PATHS.length).toBe(1);
    expect(JOB_PATHS[0].slug).toBe("erp-functional-consultant");
    expect(JOB_PATHS[0].status).toBe("ready");
    expect(READY_JOB_PATHS.map((p) => p.slug)).toEqual(["erp-functional-consultant"]);
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
    const lessons = JOB_PATHS[0].lessons;
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
    for (const l of allLessons()) {
      for (const q of [...l.quiz, ...JOB_PATHS[0].assessment.quiz]) {
        if (q.wordId) {
          expect(wordById(q.wordId), `${q.id} → word ${q.wordId}`).toBeTruthy();
        }
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
  const assessment = JOB_PATHS[0].assessment;

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
    const path: JobPath = JOB_PATHS[0];
    expect(jobLessonSlugs(path)).toEqual(path.lessons.map((l) => l.slug));
    expect(jobLessonBySlug(path, "gathering-requirements")?.order).toBe(3);
    expect(jobLessonBySlug(path, "does-not-exist")).toBeUndefined();
  });
});
