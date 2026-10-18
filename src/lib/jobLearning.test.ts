import { describe, expect, it } from "vitest";
import {
  resolveJobRefs,
  jobRefsEmpty,
  jobSortedLessons,
  jobLessonIndex,
  jobLessonNeighbors,
  jobChallenge,
  jobCareerPath,
  jobPathHref,
  jobLessonHref,
  jobAssessmentHref,
  jobPathsHref,
  processContentHref,
  emailLessonHref,
  meetingLessonHref,
  wordsModuleHref,
} from "@/lib/jobLearning";
import { JOB_PATHS, READY_JOB_PATHS, jobLessonBySlug } from "@/data/jobPaths";
import type { JobLessonRefs } from "@/data/jobPaths";

const pilot = JOB_PATHS[0];

describe("jobLearning hrefs", () => {
  it("builds route hrefs", () => {
    expect(jobPathsHref()).toBe("/job-based-learning");
    expect(jobPathHref("erp-functional-consultant")).toBe("/job-based-learning/erp-functional-consultant");
    expect(jobLessonHref("erp-functional-consultant", "gathering-requirements")).toBe(
      "/job-based-learning/erp-functional-consultant/gathering-requirements"
    );
    expect(jobAssessmentHref("erp-functional-consultant")).toBe(
      "/job-based-learning/erp-functional-consultant/assessment"
    );
  });

  it("builds content hrefs for previous phases", () => {
    expect(processContentHref("p2p")).toBe("/processes/p2p");
    expect(wordsModuleHref("finance")).toBe("/words?module=finance");
    expect(emailLessonHref("production-delay-notification")).toBe(
      "/professional-english/business-email-writing/production-delay-notification"
    );
    expect(meetingLessonHref("summarizing-minutes")).toBe(
      "/professional-english/meetings-discussions/summarizing-minutes"
    );
  });
});

describe("jobLearning lesson order & navigation", () => {
  it("sorts lessons by order", () => {
    const orders = jobSortedLessons(pilot).map((l) => l.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(orders[0]).toBe(1);
    expect(orders[orders.length - 1]).toBe(12);
  });

  it("indexes lessons by slug", () => {
    const first = jobSortedLessons(pilot)[0];
    expect(jobLessonIndex(pilot, first.slug)).toBe(0);
    expect(jobLessonIndex(pilot, "does-not-exist")).toBe(-1);
  });

  it("returns prev/next with proper ends", () => {
    const lessons = jobSortedLessons(pilot);

    const first = jobLessonNeighbors(pilot, lessons[0].slug);
    expect(first.index).toBe(0);
    expect(first.prev).toBeUndefined();
    expect(first.next?.slug).toBe(lessons[1].slug);

    const last = jobLessonNeighbors(pilot, lessons[lessons.length - 1].slug);
    expect(last.index).toBe(lessons.length - 1);
    expect(last.next).toBeUndefined();
    expect(last.prev?.slug).toBe(lessons[lessons.length - 2].slug);

    const middle = jobLessonNeighbors(pilot, lessons[5].slug);
    expect(middle.prev?.slug).toBe(lessons[4].slug);
    expect(middle.next?.slug).toBe(lessons[6].slug);
  });

  it("handles unknown slug", () => {
    const n = jobLessonNeighbors(pilot, "nope");
    expect(n.index).toBe(-1);
    expect(n.prev).toBeUndefined();
    expect(n.next).toBeUndefined();
  });
});

describe("jobLearning ref resolution", () => {
  it("resolves pilot lesson 1 refs to labels and existing destinations", () => {
    const lesson = jobLessonBySlug(pilot, "understanding-client-business");
    expect(lesson).toBeDefined();

    const groups = resolveJobRefs(lesson!.refs, "en");
    const byKey = Object.fromEntries(groups.map((g) => [g.key, g.items]));

    const processes = byKey["processes"];
    expect(processes.map((p) => p.id)).toEqual(["p2p", "o2c"]);
    expect(processes.every((p) => p.href?.startsWith("/processes/") && !p.missing)).toBe(true);

    const words = byKey["words"];
    expect(words.length).toBe(lesson!.refs.wordIds!.length);
    expect(words.every((w) => w.href?.startsWith("/words?module="))).toBe(true);

    const screens = byKey["screens"];
    expect(screens.length).toBe(lesson!.refs.screenIds!.length);

    expect(groups.every((g) => g.items.length > 0)).toBe(true);
    expect(jobRefsEmpty(groups)).toBe(false);
  });

  it("resolves lesson 12 email & meeting refs to the right routes", () => {
    const lesson = jobLessonBySlug(pilot, "preparing-for-go-live");
    expect(lesson).toBeDefined();

    const byKey = Object.fromEntries(resolveJobRefs(lesson!.refs, "en").map((g) => [g.key, g.items]));

    expect(byKey["emails"]).toBeDefined();
    expect(byKey["emails"].every((e) => e.href?.startsWith("/professional-english/business-email-writing/"))).toBe(true);

    expect(byKey["meetings"]).toBeDefined();
    expect(byKey["meetings"].every((m) => m.href?.startsWith("/professional-english/meetings-discussions/"))).toBe(true);
  });

  it("keeps groups in a stable order and de-duplicates ids", () => {
    const refs: JobLessonRefs = {
      processIds: ["p2p", "p2p", "o2c"],
      wordIds: ["stakeholder", "stakeholder"],
    };
    const groups = resolveJobRefs(refs, "ar");
    expect(groups.map((g) => g.key)).toEqual(["processes", "words"]);
    expect(groups[0].items).toHaveLength(2);
    expect(groups[1].items).toHaveLength(1);
  });

  it("flags unresolved refs instead of dropping them", () => {
    const refs: JobLessonRefs = {
      processIds: ["__missing_process__"],
      wordIds: ["__missing_word__"],
      emailLessonSlugs: ["__missing_email__"],
    };
    const groups = resolveJobRefs(refs, "en");
    for (const g of groups) {
      expect(g.items).toHaveLength(1);
      expect(g.items[0].missing).toBe(true);
      expect(g.items[0].label).toBe(g.items[0].id);
      expect(g.items[0].href).toBeUndefined();
    }
  });

  it("returns empty list and true for empty refs", () => {
    const groups = resolveJobRefs({}, "en");
    expect(groups).toHaveLength(0);
    expect(jobRefsEmpty(groups)).toBe(true);
  });

  it("every ready-path lesson resolves all refs without missing entries", () => {
    for (const path of READY_JOB_PATHS) {
      for (const lesson of path.lessons) {
        const groups = resolveJobRefs(lesson.refs, "en");
        for (const g of groups) {
          for (const item of g.items) {
            expect(item.missing, `${path.slug}/${lesson.slug} ${g.key}:${item.id}`).toBeFalsy();
            expect(item.href, `${path.slug}/${lesson.slug} ${g.key}:${item.id}`).toBeTruthy();
          }
        }
      }
    }
  });

  it("renders bilingual labels for both languages", () => {
    const lesson = jobLessonBySlug(pilot, "understanding-client-business")!;
    const ar = resolveJobRefs(lesson.refs, "ar");
    const en = resolveJobRefs(lesson.refs, "en");
    const arWord = ar.find((g) => g.key === "words")!.items[0].label;
    const enWord = en.find((g) => g.key === "words")!.items[0].label;
    expect(arWord).not.toBe(enWord);
  });
});

describe("jobLearning challenge", () => {
  it("derives a challenge from the lesson response situation", () => {
    const lesson = jobLessonBySlug(pilot, "understanding-client-business")!;
    const challenge = jobChallenge(lesson, "en");
    expect(challenge).not.toBeNull();
    expect(challenge!.task.length).toBeGreaterThan(0);
    expect(challenge!.reference.length).toBeGreaterThan(0);
    // المرجع يحتوي نص الخيار الأفضل على الأقل.
    const r = lesson.practice.responses![0];
    expect(challenge!.reference).toContain(r.optionsEn[r.answerIndex]);
  });

  it("returns bilingual challenge text", () => {
    const lesson = jobLessonBySlug(pilot, "understanding-client-business")!;
    expect(jobChallenge(lesson, "ar")!.task).not.toBe(jobChallenge(lesson, "en")!.task);
  });

  it("returns null when the lesson has no written response", () => {
    const lesson = jobLessonBySlug(pilot, "understanding-client-business")!;
    const withoutResponses = { ...lesson, practice: { ...lesson.practice, responses: [] } };
    expect(jobChallenge(withoutResponses, "en")).toBeNull();
  });
});

describe("jobLearning career path", () => {
  it("resolves the pilot career path id", () => {
    expect(jobCareerPath(pilot.careerPathId)?.id).toBe("functional-consultant");
  });

  it("returns undefined for unknown or absent ids", () => {
    expect(jobCareerPath("nope")).toBeUndefined();
    expect(jobCareerPath(undefined)).toBeUndefined();
  });
});
