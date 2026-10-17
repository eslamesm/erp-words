"use client";

import Link from "next/link";
import { PRO_ENG_UNITS } from "@/data/professionalEnglish";
import { useT } from "@/hooks/useT";

// بطاقات وحدات الإنجليزية المهنية (تُستخدم في الرئيسية وصفحة الفهرس).
export function ProEngUnitCards() {
  const { t, lang } = useT();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {PRO_ENG_UNITS.map((u) => {
        const title = lang === "en" ? u.titleEn : u.titleAr;
        const desc = lang === "en" ? u.descEn : u.descAr;
        const body = (
          <>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{u.icon}</span>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 dark:text-white">{title}</div>
                <div className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                  {desc}
                </div>
              </div>
            </div>
            <span className="shrink-0 self-center text-xs font-bold">
              {u.status === "ready" ? (
                <span className="text-emerald-600 dark:text-emerald-400">{t("proeng.open")} ‹</span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  {t("proeng.comingSoon")}
                </span>
              )}
            </span>
          </>
        );

        const baseCls = "flex items-start justify-between gap-3 rounded-2xl border p-4 shadow-sm transition-all";

        return u.status === "ready" ? (
          <Link
            key={u.id}
            href={`/professional-english/${u.slug}`}
            className={`${baseCls} border-emerald-200 bg-white hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900 dark:bg-slate-900`}
          >
            {body}
          </Link>
        ) : (
          <div
            key={u.id}
            className={`${baseCls} border-slate-200 bg-slate-50 opacity-80 dark:border-slate-800 dark:bg-slate-900/60`}
          >
            {body}
          </div>
        );
      })}
    </div>
  );
}
