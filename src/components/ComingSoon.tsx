"use client";

import Link from "next/link";
import { useT } from "@/hooks/useT";

export function ComingSoon({ icon, title }: { icon: string; title: string }) {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="text-6xl">{icon}</div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
        {t("common.comingSoon")}
      </span>
      <p className="max-w-md text-slate-600 dark:text-slate-300">{t("common.comingSoonDesc")}</p>
      <Link
        href="/"
        className="mt-2 rounded-xl border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {t("nav.home")}
      </Link>
    </div>
  );
}
