"use client";

import Link from "next/link";
import { processBySlug } from "@/data/processes";
import { useT } from "@/hooks/useT";
import { ProcessLesson } from "./ProcessLesson";

// صفحة العملية (عميل) — تستقبل slug من الصفحة الخادمية وتتعامل مع الحالات الثلاث.
export function ProcessPageClient({ slug }: { slug: string }) {
  const { t, lang } = useT();
  const process = processBySlug(slug);

  if (!process) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="text-5xl">🔍</span>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
          {t("process.notFound")}
        </p>
        <Link
          href="/processes"
          className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white dark:bg-white dark:text-slate-900"
        >
          {t("process.backToIndex")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/processes"
        className="self-start text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
      >
        ← {t("process.backToIndex")}
      </Link>

      {process.status === "ready" ? (
        <ProcessLesson process={process} />
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <span className="text-5xl">{process.icon}</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {lang === "en" ? process.titleEn : process.titleAr}
          </h1>
          <p className="max-w-md px-4 text-sm text-slate-500 dark:text-slate-400">
            {lang === "en" ? process.descEn : process.descAr}
          </p>
          <span className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            🚧 {t("process.comingSoon")}
          </span>
        </div>
      )}
    </div>
  );
}
