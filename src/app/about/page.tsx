"use client";

import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { BRAND } from "@/lib/brand";
import { DICTS } from "@/lib/i18n";
import { useT } from "@/hooks/useT";

export default function AboutPage() {
  const { t, lang } = useT();

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <BrandMark size={96} withBackground />
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{BRAND.name}</h1>
        <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          {lang === "en" ? BRAND.taglineEn : BRAND.taglineAr}
        </p>
      </div>

      <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 text-start shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-lg font-bold">{t("about.blurbTitle")}</h2>
        <p lang="ar" dir="rtl" className="text-sm leading-8 text-slate-600 dark:text-slate-300">
          {DICTS.ar["brand.blurb"]}
        </p>
        <div className="my-4 h-px w-full bg-slate-200 dark:bg-slate-800" />
        <p lang="en" dir="ltr" className="text-sm leading-8 text-slate-600 dark:text-slate-300">
          {DICTS.en["brand.blurb"]}
        </p>
      </section>

      <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            {t("about.versionLabel")}
          </span>
          <span className="font-bold tabular-nums">{BRAND.version}</span>
        </div>
      </section>

      <Link
        href="/assistant"
        className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-3 font-bold text-white shadow transition-transform hover:scale-[1.02]"
      >
        {t("brand.startChat")}
      </Link>

      <Link href="/" className="text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
        {t("about.back")}
      </Link>
    </div>
  );
}
