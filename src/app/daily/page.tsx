"use client";

import { useState } from "react";
import type { Word } from "@/types";
import { dailyWords, weeklyWords, DAILY_SIZE, WEEKLY_SIZE } from "@/lib/daily";
import { Quiz } from "@/components/Quiz";
import { useProgress } from "@/hooks/useProgress";
import { useWordOfTheDay } from "@/lib/today";
import { speak } from "@/lib/speech";
import { ModuleBadge } from "@/components/Badges";
import { useT } from "@/hooks/useT";

export default function DailyPage() {
  const { t } = useT();
  const { settings, dailyToday, weeklyToday, recordDailyResult, recordWeeklyResult } = useProgress();
  const [words, setWords] = useState<Word[]>([]);
  const [playing, setPlaying] = useState(false);
  const [last, setLast] = useState<{ correct: number; total: number } | null>(null);
  const [weeklyPlaying, setWeeklyPlaying] = useState(false);
  const [weeklyLast, setWeeklyLast] = useState<{ correct: number; total: number } | null>(null);
  const wotd = useWordOfTheDay();

  function start() {
    setWords(dailyWords());
    setLast(null);
    setPlaying(true);
  }

  function finish(r: { correct: number; total: number }) {
    recordDailyResult(r.correct, r.total);
    setLast(r);
    setPlaying(false);
  }

  function startWeekly() {
    setWords(weeklyWords());
    setWeeklyLast(null);
    setWeeklyPlaying(true);
  }

  function finishWeekly(r: { correct: number; total: number }) {
    recordWeeklyResult(r.correct, r.total);
    setWeeklyLast(r);
    setWeeklyPlaying(false);
  }

  const stars = (score: number, total: number) => {
    const pct = score / Math.max(1, total);
    return pct >= 0.9 ? "⭐⭐⭐" : pct >= 0.6 ? "⭐⭐" : "⭐";
  };

  const voiceRate = settings?.voiceRate ?? 0.95;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("daily.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("daily.subtitle")}</p>
      </div>

      {wotd && (
        <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm dark:border-amber-900 dark:from-amber-950/40 dark:to-slate-900">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-amber-700 dark:text-amber-300">{t("daily.wotd")}</h2>
            <ModuleBadge moduleId={wotd.module} />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-2xl font-bold" dir="ltr">
                {wotd.english}
              </p>
              <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">{wotd.arabic}</p>
              {wotd.definitionAr && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{wotd.definitionAr}</p>
              )}
            </div>
            <button
              onClick={() => speak(wotd.english, { rate: voiceRate })}
              className="shrink-0 rounded-full border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950"
            >
              🔊
            </button>
          </div>
        </section>
      )}

      {dailyToday && !playing && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
          <div className="text-4xl">{stars(dailyToday.score, dailyToday.total)}</div>
          <h2 className="mt-2 text-xl font-bold text-emerald-800 dark:text-emerald-300">
            {t("daily.done")}
          </h2>
          <p className="mt-1 text-emerald-700 dark:text-emerald-400">
            {t("daily.yourScore", { score: dailyToday.score, total: dailyToday.total })}
          </p>
        </div>
      )}

      {last && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-center font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          {t("daily.attempt", { score: last.correct, total: last.total })}
        </div>
      )}

      {playing && words.length > 0 ? (
        <Quiz
          words={words}
          questionCount={DAILY_SIZE}
          mode="mix"
          voiceRate={voiceRate}
          onFinish={finish}
        />
      ) : weeklyPlaying && words.length > 0 ? (
        <Quiz
          words={words}
          questionCount={WEEKLY_SIZE}
          mode="mix"
          voiceRate={voiceRate}
          onFinish={finishWeekly}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <button
            onClick={start}
            className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-5 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
          >
            {dailyToday ? t("daily.practiceAgain") : t("daily.start")}
          </button>

          <section className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm dark:border-indigo-900 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{t("daily.weeklyTitle")}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {t("daily.weeklyDesc", { n: WEEKLY_SIZE })}
            </p>
            {weeklyToday && (
              <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {t("daily.weeklyDone", { score: weeklyToday.score, total: weeklyToday.total })}
              </p>
            )}
            {weeklyLast && (
              <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {t("daily.attempt", { score: weeklyLast.correct, total: weeklyLast.total })}
              </p>
            )}
            <button
              onClick={startWeekly}
              className="mt-3 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow transition-colors hover:bg-indigo-700"
            >
              {weeklyToday ? t("daily.weeklyAgain") : t("daily.weeklyStart")}
            </button>
          </section>
        </div>
      )}

      <p className="text-center text-xs text-slate-400">{t("daily.tip")}</p>
    </div>
  );
}
