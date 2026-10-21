"use client";

import Link from "next/link";
import type { JobPath } from "@/data/jobPaths";
import { useT } from "@/hooks/useT";
import { jobLessonHref, jobPick, jobSortedLessons } from "@/lib/jobLearning";

// قائمة دروس المسار الوظيفي (روابط مرتّبة حسب lesson.order).
export function JobLessonCards({ job }: { job: JobPath }) {
  const { lang } = useT();

  return (
    <div className="flex flex-col gap-3">
      {jobSortedLessons(job).map((lesson) => (
        <Link
          key={lesson.id}
          href={jobLessonHref(job.slug, lesson.slug)}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-extrabold text-white">
            {lesson.order}
          </span>
          <span className="text-2xl">{lesson.icon}</span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-slate-900 dark:text-white">
              {jobPick(lang, lesson.titleAr, lesson.titleEn)}
            </span>
            <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
              {jobPick(lang, lesson.titleEn, lesson.titleAr)}
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            {lesson.level}
          </span>
          <span className="shrink-0 text-slate-300 dark:text-slate-600">‹</span>
        </Link>
      ))}
    </div>
  );
}
