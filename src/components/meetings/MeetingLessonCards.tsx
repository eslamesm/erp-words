"use client";

import Link from "next/link";
import { READY_MEETING_LESSONS } from "@/data/meetings";
import { useT } from "@/hooks/useT";

// بطاقات دروس وحدة الاجتماعات والمناقشات.
export function MeetingLessonCards() {
  const { t, lang } = useT();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {READY_MEETING_LESSONS.map((l) => (
        <Link
          key={l.id}
          href={`/professional-english/meetings-discussions/${l.slug}`}
          className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900 dark:bg-slate-900"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-extrabold text-white">
              {l.order}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{l.icon}</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {lang === "en" ? l.titleEn : l.titleAr}
                </span>
              </div>
              <div className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                {lang === "en" ? l.processLabelEn : l.processLabelAr}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                  {t("mtg.level")}: {l.level}
                </span>
              </div>
            </div>
          </div>
          <span className="shrink-0 self-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {t("proeng.open")} ‹
          </span>
        </Link>
      ))}
    </div>
  );
}
