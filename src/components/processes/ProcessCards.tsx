"use client";

import Link from "next/link";
import { BUSINESS_PROCESSES } from "@/data/processes";
import { useT } from "@/hooks/useT";

// بطاقات العمليات التجارية (تُستخدم في الرئيسية وصفحة الفهرس).
export function ProcessCards() {
  const { t, lang } = useT();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {BUSINESS_PROCESSES.map((p) => {
        const title = lang === "en" ? p.titleEn : p.titleAr;
        const desc = lang === "en" ? p.descEn : p.descAr;
        const body = (
          <>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{p.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                    {p.acronym}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{title}</span>
                </div>
                <div className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                  {desc}
                </div>
              </div>
            </div>
            <span className="shrink-0 self-center text-xs font-bold">
              {p.status === "ready" ? (
                <span className="text-emerald-600 dark:text-emerald-400">{t("process.open")} ‹</span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  {t("process.comingSoon")}
                </span>
              )}
            </span>
          </>
        );

        const baseCls =
          "flex items-start justify-between gap-3 rounded-2xl border p-4 shadow-sm transition-all";

        return p.status === "ready" ? (
          <Link
            key={p.id}
            href={`/processes/${p.slug}`}
            className={`${baseCls} border-emerald-200 bg-white hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900 dark:bg-slate-900`}
          >
            {body}
          </Link>
        ) : (
          <div
            key={p.id}
            className={`${baseCls} border-slate-200 bg-slate-50 opacity-80 dark:border-slate-800 dark:bg-slate-900/60`}
          >
            {body}
          </div>
        );
      })}
    </div>
  );
}
