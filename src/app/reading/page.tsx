"use client";

import { useState } from "react";
import { READING } from "@/data/reading";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";
import { speak } from "@/lib/speech";
import { LevelBadge } from "@/components/Badges";

export default function ReadingPage() {
  const { t } = useT();
  const { settings } = useProgress();
  const rate = settings?.voiceRate ?? 0.95;
  const [openId, setOpenId] = useState<string | null>(null);
  const open = READING.find((a) => a.id === openId) ?? null;

  if (open) {
    return (
      <div className="flex flex-col gap-6">
        <button
          onClick={() => setOpenId(null)}
          className="self-start rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ← {t("reading.back")}
        </button>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl">{open.icon}</span>
            <h1 className="text-2xl font-bold" dir="ltr">
              {open.titleEn}
            </h1>
            <LevelBadge level={open.level} />
          </div>
          <p className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-300">{open.titleAr}</p>
        </div>

        <article className="flex flex-col gap-3">
          {open.paragraphs.map((p, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start gap-3">
                <p className="flex-1 text-slate-700 dark:text-slate-200" dir="ltr">
                  {p.en}
                </p>
                <button
                  onClick={() => speak(p.en, { rate })}
                  className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  title={t("reading.listen")}
                >
                  🔊
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{p.ar}</p>
            </div>
          ))}
        </article>

        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/40">
          <h2 className="font-bold text-emerald-800 dark:text-emerald-300">{t("reading.glossary")}</h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {open.glossary.map((g) => (
              <li key={g.term} className="flex items-center justify-between gap-2">
                <span className="font-medium text-emerald-800 dark:text-emerald-300" dir="ltr">
                  {g.term}
                </span>
                <span className="text-slate-600 dark:text-slate-300">{g.ar}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("reading.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("reading.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {READING.map((a) => (
          <button
            key={a.id}
            onClick={() => setOpenId(a.id)}
            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="text-2xl">{a.icon}</span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-bold" dir="ltr">
                {a.titleEn}
              </span>
              <span className="text-sm text-emerald-700 dark:text-emerald-300">{a.titleAr}</span>
              <span className="mt-1 flex items-center gap-2">
                <LevelBadge level={a.level} />
                <span className="text-xs text-slate-400">
                  ⏱ {a.minutes} {t("reading.minutes")}
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
