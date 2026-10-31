"use client";

import Link from "next/link";
import type { JobPath } from "@/data/jobPaths";
import { useT } from "@/hooks/useT";
import { jobPathHref, jobPick } from "@/lib/jobLearning";

// بطاقات المسارات الوظيفية (الرئيسية + صفحة الفهرس).
export function JobPathCards({ paths }: { paths: JobPath[] }) {
  const { t, lang } = useT();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {paths.map((p) => {
        const title = jobPick(lang, p.titleAr, p.titleEn);
        const summary = jobPick(lang, p.summaryAr, p.summaryEn);
        const body = (
          <>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{p.icon}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{title}</span>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                    {p.level}
                  </span>
                </div>
                <div className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                  {summary}
                </div>
              </div>
            </div>
            <span className="mt-2 flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-400">
                {t("job.lessonsCount", { n: p.lessons.length })}
              </span>
              {p.status === "ready" ? (
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {t("job.open")} ‹
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  {t("job.comingSoon")}
                </span>
              )}
            </span>
          </>
        );

        const baseCls = "flex flex-col rounded-2xl border p-4 shadow-sm transition-all";

        return p.status === "ready" ? (
          <Link
            key={p.id}
            href={jobPathHref(p.slug)}
            className={`${baseCls} border-emerald-200 bg-white hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-emerald-200 dark:border-emerald-900 dark:bg-slate-900`}
          >
            {body}
          </Link>
        ) : (
          <div
            key={p.id}
            className={`${baseCls} border-slate-200 bg-slate-50 opacity-80 dark:border-slate-800 dark:bg-slate-900/60`}
            aria-label={t("job.comingSoonAria", { title: title })}
          >
            {body}
          </div>
        );
      })}
    </div>
  );
}