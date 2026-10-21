"use client";

import Link from "next/link";
import { READY_JOB_PATHS, jobPathBySlug } from "@/data/jobPaths";
import { useT } from "@/hooks/useT";
import { JobPathCards } from "./JobPathCards";
import { JobLessonCards } from "./JobLessonCards";
import { JobLesson } from "./JobLesson";
import { JobAssessment } from "./JobAssessment";
import {
  jobPathsHref,
  jobPathHref,
  jobPick,
} from "@/lib/jobLearning";

// ── صفحة الفهرس الرئيسية ──
export function JobPathsPageClient() {
  const { t } = useT();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("job.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("job.subtitle")}</p>
      </div>

      <section>
        <h2 className="mb-3 font-bold text-slate-900 dark:text-white">{t("job.pathsTitle")}</h2>
        <JobPathCards paths={READY_JOB_PATHS} />
      </section>

      <section>
        <h2 className="mb-3 font-bold text-slate-900 dark:text-white">{t("job.plannedTitle")}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("job.comingSoonDesc")}</p>
      </section>
    </div>
  );
}

// ── صفحة عرض المسار ──
export function JobPathPageClient({ slug }: { slug: string }) {
  const { t, lang } = useT();
  const path = jobPathBySlug(slug);

  if (!path) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="text-5xl">🔍</span>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{t("job.notFound")}</p>
        <Link
          href={jobPathsHref()}
          className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white dark:bg-white dark:text-slate-900"
        >
          ← {t("job.backToPaths")}
        </Link>
      </div>
    );
  }

  const objectives =
    lang === "en" ? path.learningObjectivesEn : path.learningObjectivesAr;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{path.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {jobPick(lang, path.titleAr, path.titleEn)}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {jobPick(lang, path.titleEn, path.titleAr)}
            </p>
          </div>
        </div>
        <span className="mt-3 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
          {path.level}
        </span>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-bold text-slate-900 dark:text-white">{t("job.pathOverview")}</h2>
        <p className="mt-2 text-slate-700 dark:text-slate-300">
          {jobPick(lang, path.summaryAr, path.summaryEn)}
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {jobPick(lang, path.descAr, path.descEn)}
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-bold text-slate-900 dark:text-white">{t("job.goals")}</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {objectives.map((o, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">✓</span>
              {o}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 dark:text-white">{t("job.lessonList")}</h2>
          <span className="text-xs font-semibold text-slate-400">
            {t("job.lessonsCount", { n: path.lessons.length })}
          </span>
        </div>
        <JobLessonCards job={path} />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-bold text-slate-900 dark:text-white">{t("job.section.assessment")}</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t("job.assessment.intro")}
        </p>
        <Link
          href={jobPathHref(path.slug) + "/assessment"}
          className="mt-3 inline-block rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {t("job.assessment.start")}
        </Link>
      </section>

      <Link
        href={jobPathsHref()}
        className="self-start rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        ← {t("job.backToPaths")}
      </Link>
    </div>
  );
}

// ── صفحة الدرس ──
export function JobLessonPageClient({
  pathSlug,
  lessonSlug,
}: {
  pathSlug: string;
  lessonSlug: string;
}) {
  const { t } = useT();
  const path = jobPathBySlug(pathSlug);
  const lesson = path?.lessons.find((l) => l.slug === lessonSlug);

  if (!path || !lesson) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="text-5xl">🔍</span>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
          {!path ? t("job.notFound") : t("job.lessonNotFound")}
        </p>
        <Link
          href={!path ? jobPathsHref() : jobPathHref(path.slug)}
          className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white dark:bg-white dark:text-slate-900"
        >
          ← {!path ? t("job.backToPaths") : t("job.backToPath")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={jobPathHref(path.slug)}
        className="self-start text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
      >
        ← {t("job.backToPath")}
      </Link>
      <JobLesson job={path} lesson={lesson} />
    </div>
  );
}

// ── صفحة التقييم النهائي ──
export function JobAssessmentPageClient({ pathSlug }: { pathSlug: string }) {
  const { t } = useT();
  const path = jobPathBySlug(pathSlug);

  if (!path) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="text-5xl">🔍</span>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
          {t("job.notFound")}
        </p>
        <Link
          href={jobPathsHref()}
          className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white dark:bg-white dark:text-slate-900"
        >
          ← {t("job.backToPaths")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={jobPathHref(path.slug)}
        className="self-start text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
      >
        ← {t("job.backToPath")}
      </Link>
      <JobAssessment job={path} />
    </div>
  );
}
