"use client";

import Link from "next/link";
import { devWords, DEV_TOPICS } from "@/data/devWords";
import { speak } from "@/lib/speech";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";

export default function ItSectionPage() {
  const { t, lang } = useT();
  const { settings } = useProgress();
  const rate = settings?.voiceRate ?? 0.95;

  const allIds = devWords.map((w) => w.id).join(",");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("it.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("it.subtitle")}</p>
      </div>

      <Link
        href={`/learn?ids=${allIds}`}
        className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-3.5 text-center font-bold text-white shadow-lg transition-transform hover:scale-[1.01]"
      >
        {t("it.studyAll", { n: devWords.length })}
      </Link>

      {DEV_TOPICS.map((topic) => {
        const words = devWords.filter((w) => w.tags?.includes(topic.id));
        if (words.length === 0) return null;
        const ids = words.map((w) => w.id).join(",");
        return (
          <section
            key={topic.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <span>{topic.icon}</span>
                {lang === "en" ? topic.labelEn : topic.labelAr}
                <span className="text-sm font-normal text-slate-400">({words.length})</span>
              </h2>
              <Link
                href={`/learn?ids=${ids}`}
                className="rounded-xl bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {t("it.study")} ←
              </Link>
            </div>

            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {words.map((w) => (
                <li key={w.id} className="flex items-start gap-3 py-3">
                  <button
                    onClick={() => speak(w.english, { rate })}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    aria-label={t("lesson.listen")}
                  >
                    🔊
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-bold text-slate-900 dark:text-white" dir="ltr">
                        {w.english}
                      </span>
                      <span className="text-sm text-emerald-700 dark:text-emerald-400">{w.arabic}</span>
                    </div>
                    {w.definitionAr && (
                      <div className="text-sm text-slate-600 dark:text-slate-300">{w.definitionAr}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
