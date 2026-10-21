import type { JobLesson, JobLessonRefs, JobPath } from "@/data/jobPaths";
import type { Lang } from "@/lib/i18n";
import { processById } from "@/data/processes";
import { SUB_MODULE_MAP } from "@/data/subModules";
import { BUSINESS_FUNCTION_MAP } from "@/data/businessFunctions";
import { MODULE_MAP } from "@/data/modules";
import { wordById } from "@/data/words";
import { emailBySlug } from "@/data/professionalEnglish";
import { meetingBySlug } from "@/data/meetings";
import { CAREER_PATHS_ALL, type CareerPath } from "@/data/careerPaths";

// منطق عرض Phase 05 (التعلّم حسب الوظيفة) — دوال نقية بلا DOM ولا منطق تقدّم،
// قابلة للاختبار مباشرة. تفصل مكوّنات الواجهة عن تفاصيل حلّ الروابط والتنقّل.

// ── مسارات (روابط) ──────────────────────────────────────────────────────────
export function jobPathsHref(): string {
  return "/job-based-learning";
}

export function jobPathHref(pathSlug: string): string {
  return `/job-based-learning/${pathSlug}`;
}

export function jobLessonHref(pathSlug: string, lessonSlug: string): string {
  return `/job-based-learning/${pathSlug}/${lessonSlug}`;
}

export function jobAssessmentHref(pathSlug: string): string {
  return `/job-based-learning/${pathSlug}/assessment`;
}

// مسارات محتوى المراحل السابقة (وجهات موجودة فعلًا).
export function processContentHref(slug: string): string {
  return `/processes/${slug}`;
}

export function wordsModuleHref(moduleId: string): string {
  return `/words?module=${moduleId}`;
}

export function emailLessonHref(slug: string): string {
  return `/professional-english/business-email-writing/${slug}`;
}

export function meetingLessonHref(slug: string): string {
  return `/professional-english/meetings-discussions/${slug}`;
}

export function careerPathHref(): string {
  return "/paths";
}

// ── اختيار النص حسب اللغة ───────────────────────────────────────────────────
export function jobPick(lang: Lang, ar: string, en: string): string {
  return lang === "en" ? en : ar;
}

// ── ترتيب الدروس والتنقّل (السابق/التالي) ───────────────────────────────────
export function jobSortedLessons(job: JobPath): JobLesson[] {
  return [...job.lessons].sort((a, b) => a.order - b.order);
}

export function jobLessonIndex(job: JobPath, lessonSlug: string): number {
  return jobSortedLessons(job).findIndex((l) => l.slug === lessonSlug);
}

export interface JobLessonNeighbors {
  index: number;
  prev?: JobLesson;
  next?: JobLesson;
}

export function jobLessonNeighbors(job: JobPath, lessonSlug: string): JobLessonNeighbors {
  const lessons = jobSortedLessons(job);
  const index = lessons.findIndex((l) => l.slug === lessonSlug);
  if (index < 0) return { index: -1 };
  return {
    index,
    prev: index > 0 ? lessons[index - 1] : undefined,
    next: index < lessons.length - 1 ? lessons[index + 1] : undefined,
  };
}

// ── حلّ روابط المحتوى المرتبط (refs) ────────────────────────────────────────
export type JobRefKey =
  | "processes"
  | "subModules"
  | "businessFunctions"
  | "words"
  | "screens"
  | "emails"
  | "meetings";

export interface ResolvedJobRef {
  id: string;
  label: string;
  sub?: string;
  href?: string;
  // مرجع لم يُحلّ: يُعرض بعلامة واضحة بدل إسقاطه صامتًا.
  missing?: boolean;
}

export interface JobRefGroup {
  key: JobRefKey;
  items: ResolvedJobRef[];
}

const REF_ORDER: JobRefKey[] = [
  "processes",
  "subModules",
  "businessFunctions",
  "words",
  "screens",
  "emails",
  "meetings",
];

function unique(ids: string[] | undefined): string[] {
  if (!ids || ids.length === 0) return [];
  return Array.from(new Set(ids));
}

function moduleSub(moduleId: string | undefined, lang: Lang): string | undefined {
  if (!moduleId) return undefined;
  const m = MODULE_MAP[moduleId as keyof typeof MODULE_MAP];
  return m ? jobPick(lang, m.labelAr, m.labelEn) : undefined;
}

function resolveProcesses(ids: string[] | undefined, lang: Lang): ResolvedJobRef[] {
  return unique(ids).map((id) => {
    const p = processById(id);
    if (!p) return { id, label: id, missing: true };
    return {
      id,
      label: jobPick(lang, p.titleAr, p.titleEn),
      sub: p.acronym,
      href: processContentHref(p.slug),
    };
  });
}

function resolveSubModules(ids: string[] | undefined, lang: Lang): ResolvedJobRef[] {
  return unique(ids).map((id) => {
    const s = SUB_MODULE_MAP[id];
    if (!s) return { id, label: id, missing: true };
    return {
      id,
      label: jobPick(lang, s.labelAr, s.labelEn),
      sub: moduleSub(s.moduleId, lang),
      href: wordsModuleHref(s.moduleId),
    };
  });
}

function resolveBusinessFunctions(ids: string[] | undefined, lang: Lang): ResolvedJobRef[] {
  return unique(ids).map((id) => {
    const f = BUSINESS_FUNCTION_MAP[id];
    if (!f) return { id, label: id, missing: true };
    return {
      id,
      label: jobPick(lang, f.labelAr, f.labelEn),
      sub: moduleSub(f.moduleId, lang),
      href: wordsModuleHref(f.moduleId),
    };
  });
}

function resolveWords(ids: string[] | undefined, lang: Lang): ResolvedJobRef[] {
  return unique(ids).map((id) => {
    const w = wordById(id);
    if (!w) return { id, label: id, missing: true };
    return {
      id,
      label: jobPick(lang, w.arabic, w.english),
      sub: jobPick(lang, w.english, w.arabic),
      href: wordsModuleHref(w.module),
    };
  });
}

function resolveScreens(ids: string[] | undefined, lang: Lang): ResolvedJobRef[] {
  // مصطلحات الواجهات تسكن نفس قاموس WORDS — حلّها مطابق للمصطلحات.
  return resolveWords(ids, lang);
}

function resolveEmails(slugs: string[] | undefined, lang: Lang): ResolvedJobRef[] {
  return unique(slugs).map((slug) => {
    const l = emailBySlug(slug);
    if (!l) return { id: slug, label: slug, missing: true };
    return {
      id: slug,
      label: jobPick(lang, l.titleAr, l.titleEn),
      sub: l.icon,
      href: emailLessonHref(slug),
    };
  });
}

function resolveMeetings(slugs: string[] | undefined, lang: Lang): ResolvedJobRef[] {
  return unique(slugs).map((slug) => {
    const l = meetingBySlug(slug);
    if (!l) return { id: slug, label: slug, missing: true };
    return {
      id: slug,
      label: jobPick(lang, l.titleAr, l.titleEn),
      sub: l.icon,
      href: meetingLessonHref(slug),
    };
  });
}

const RESOLVERS: Record<JobRefKey, (refs: JobLessonRefs, lang: Lang) => ResolvedJobRef[]> = {
  processes: (r, lang) => resolveProcesses(r.processIds, lang),
  subModules: (r, lang) => resolveSubModules(r.subModuleIds, lang),
  businessFunctions: (r, lang) => resolveBusinessFunctions(r.businessFunctionIds, lang),
  words: (r, lang) => resolveWords(r.wordIds, lang),
  screens: (r, lang) => resolveScreens(r.screenIds, lang),
  emails: (r, lang) => resolveEmails(r.emailLessonSlugs, lang),
  meetings: (r, lang) => resolveMeetings(r.meetingLessonSlugs, lang),
};

// تُعيد المجموعات غير الفارغة فقط، بترتيب ثابت.
export function resolveJobRefs(refs: JobLessonRefs, lang: Lang): JobRefGroup[] {
  return REF_ORDER.map((key) => ({ key, items: RESOLVERS[key](refs, lang) })).filter(
    (g) => g.items.length > 0
  );
}

export function jobRefsEmpty(groups: JobRefGroup[]): boolean {
  return groups.every((g) => g.items.length === 0);
}

// ── تحدّي الدرس (مبني على الموقف المكتوب — بلا محتوى جديد) ──────────────────
export interface JobChallenge {
  task: string;
  reference: string;
}

export function jobChallenge(lesson: JobLesson, lang: Lang): JobChallenge | null {
  const r = lesson.practice.responses?.[0];
  if (!r) return null;
  const task = jobPick(lang, r.situationAr, r.situationEn);
  const opts = lang === "en" ? r.optionsEn : r.optionsAr;
  const best = opts[r.answerIndex] ?? opts[0] ?? "";
  const explain = jobPick(lang, r.explainAr, r.explainEn);
  const reference = explain ? `${best}\n\n${explain}` : best;
  return { task, reference };
}

// ── مسار مهني مرتبط (Phase 01) ──────────────────────────────────────────────
export function jobCareerPath(careerPathId: string | undefined): CareerPath | undefined {
  if (!careerPathId) return undefined;
  return CAREER_PATHS_ALL.find((p) => p.id === careerPathId);
}
