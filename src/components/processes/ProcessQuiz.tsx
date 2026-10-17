"use client";

import { useState } from "react";
import type { ProcessQuizQuestion } from "@/types";
import { wordById } from "@/data/words";
import { speak } from "@/lib/speech";
import { useT } from "@/hooks/useT";

// اختبار فهم مستقل داخل الدرس (مبني على أسئلة الدرس المُعدّة يدويًا).
export function ProcessQuiz({ questions }: { questions: ProcessQuizQuestion[] }) {
  const { t, lang } = useT();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) return null;
  const q = questions[index];

  const prompt = lang === "en" ? q.promptEn : q.promptAr;
  const options = lang === "en" ? q.optionsEn : q.optionsAr;
  const explain = lang === "en" ? q.explainEn : q.explainAr;
  const isCorrect = selected === q.answerIndex;
  const linked = q.wordId ? wordById(q.wordId) : undefined;

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answerIndex) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  function retry() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="text-5xl">{pct >= 70 ? "🎉" : "💪"}</div>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
          {t("process.quizScore", { score, total: questions.length })}
        </p>
        <button
          onClick={retry}
          className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          🔄 {t("process.quizRetry")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>{t("process.quizQuestion", { n: index + 1, total: questions.length })}</span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {t("process.quizPoints", { n: score })}
        </span>
      </div>

      <p className="text-lg font-bold text-slate-900 dark:text-white">{prompt}</p>

      {linked && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/60">
          <span className="font-bold text-slate-500 dark:text-slate-400">
            {t("process.quizLinkedWord")}:
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-100" dir="ltr">
            {linked.english}
          </span>
          <span className="text-emerald-700 dark:text-emerald-300">{linked.arabic}</span>
          <button
            onClick={() => speak(linked.english)}
            className="rounded-full border border-slate-300 px-2 py-0.5 text-[11px] text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            🔊
          </button>
        </div>
      )}

      <div className="grid gap-3">
        {options.map((opt, i) => {
          let cls =
            "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
          if (selected !== null) {
            if (i === q.answerIndex) {
              cls = "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
            } else if (i === selected) {
              cls = "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
            } else {
              cls = "border-slate-200 bg-slate-50 text-slate-700 opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
            }
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={selected !== null}
              className={`rounded-xl border-2 px-4 py-3 text-start font-semibold transition-colors ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${
            isCorrect
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
          }`}
        >
          <div>{isCorrect ? `✓ ${t("process.quizCorrect")}` : `✗ ${t("process.quizWrong")}`}</div>
          {explain && <div className="mt-1 font-normal opacity-90">{explain}</div>}
        </div>
      )}

      {selected !== null && (
        <button
          onClick={next}
          className="self-start rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {index + 1 < questions.length ? t("common.next") : t("process.quizFinish")}
        </button>
      )}
    </div>
  );
}
