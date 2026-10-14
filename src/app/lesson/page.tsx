"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WORDS } from "@/data/words";
import { buildLessonQuiz, pickLessonWords } from "@/lib/lesson";
import { speak } from "@/lib/speech";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";

export default function LessonPage() {
  const { t } = useT();
  const {
    profile,
    progress,
    lessons,
    today,
    settings,
    ensureLesson,
    markLessonViewed,
    completeLesson,
  } = useProgress();

  const rec = today ? lessons[today] : undefined;

  const words = useMemo(() => {
    if (!profile || !today) return [];
    const ids = rec?.wordIds;
    if (ids && ids.length > 0) {
      return ids.map((id) => WORDS.find((w) => w.id === id)).filter((w): w is (typeof WORDS)[number] => Boolean(w));
    }
    return pickLessonWords(today, profile.level, progress);
  }, [profile, today, rec?.wordIds, progress]);

  useEffect(() => {
    if (!today || !profile) return;
    ensureLesson(today, pickLessonWords(today, profile.level, progress).map((w) => w.id));
  }, [today, profile, progress, ensureLesson]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const quiz = useMemo(() => (today ? buildLessonQuiz(words, today) : []), [words, today]);
  const score = quiz.filter((q) => answers[q.wordId] === q.answer).length;
  const viewedAll = words.length > 0 && words.every((w) => rec?.viewed.includes(w.id));

  function submit() {
    setSubmitted(true);
    if (score === quiz.length && quiz.length > 0 && !rec?.done) {
      completeLesson(today, rec?.wordIds ?? words.map((w) => w.id), score, quiz.length);
    }
  }

  function retry() {
    setAnswers({});
    setSubmitted(false);
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="text-5xl">🎓</div>
        <p className="text-slate-600 dark:text-slate-300">{t("lesson.noProfile")}</p>
        <Link
          href="/settings"
          className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white dark:bg-white dark:text-slate-900"
        >
          {t("nav.settings")}
        </Link>
      </div>
    );
  }

  const done = rec?.done ?? false;
  const rate = settings?.voiceRate ?? 0.95;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("hub.lesson.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("hub.lesson.todayDesc")}</p>
      </div>

      {done && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
          <div className="font-bold text-emerald-700 dark:text-emerald-300">{t("lesson.done")}</div>
          <div className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-300/80">{t("lesson.doneDesc")}</div>
        </div>
      )}

      <section>
        <h2 className="mb-3 font-bold">{t("lesson.wordsTitle")}</h2>
        <div className="flex flex-col gap-4">
          {words.map((w) => {
            const viewed = rec?.viewed.includes(w.id) ?? false;
            return (
              <div
                key={w.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{w.english}</div>
                    {w.pronunciation && <div className="text-sm text-slate-400">{w.pronunciation}</div>}
                  </div>
                  <button
                    onClick={() => speak(w.english, { rate })}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-lg transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    aria-label={t("lesson.listen")}
                  >
                    🔊
                  </button>
                </div>

                <div className="mt-3">
                  <div className="text-xs font-bold uppercase text-slate-400">{t("lesson.meaning")}</div>
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400">{w.arabic}</div>
                  {w.definitionAr && <div className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{w.definitionAr}</div>}
                </div>

                <div className="mt-3">
                  <div className="text-xs font-bold uppercase text-slate-400">{t("lesson.example")}</div>
                  <div className="text-slate-700 dark:text-slate-200">{w.examples[0]}</div>
                  {w.examplesAr?.[0] && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">{w.examplesAr[0]}</div>
                  )}
                </div>

                {w.note && (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
                    <span className="font-bold text-slate-500 dark:text-slate-400">{t("lesson.context")}: </span>
                    <span className="text-slate-700 dark:text-slate-200">{w.note}</span>
                  </div>
                )}

                <button
                  onClick={() => markLessonViewed(today, w.id)}
                  disabled={viewed}
                  className={`mt-4 w-full rounded-xl px-4 py-2.5 font-semibold transition-colors ${
                    viewed
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"
                  }`}
                >
                  {viewed ? t("lesson.gotItDone") + " ✓" : t("lesson.gotIt")}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center text-xs text-slate-400">
          {t("lesson.viewedCount", { n: words.filter((w) => rec?.viewed.includes(w.id)).length, total: words.length })}
        </p>
      </section>

      <section>
        <h2 className="mb-1 font-bold">{t("lesson.quizTitle")}</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{t("lesson.quizIntro")}</p>

        {!viewedAll && !done && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-slate-700">
            🔒 {t("lesson.gotIt")}
          </div>
        )}

        {(viewedAll || done) && (
          <div className="flex flex-col gap-4">
            {quiz.map((q) => {
              const chosen = answers[q.wordId];
              return (
                <div key={q.wordId} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-3 font-bold text-slate-900 dark:text-white">
                    {q.prompt} <span className="text-slate-400">— ?</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {q.options.map((opt) => {
                      const isChosen = chosen === opt;
                      const isCorrect = submitted && opt === q.answer;
                      const isWrong = submitted && isChosen && opt !== q.answer;
                      return (
                        <button
                          key={opt}
                          disabled={submitted || done}
                          onClick={() => setAnswers((a) => ({ ...a, [q.wordId]: opt }))}
                          className={`rounded-xl border px-3 py-2 text-start text-sm transition-colors ${
                            isCorrect
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                              : isWrong
                                ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40"
                                : isChosen
                                  ? "border-slate-900 bg-slate-100 dark:border-white dark:bg-slate-800"
                                  : "border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {!done && (
              <div className="flex flex-col gap-3">
                {!submitted && (
                  <button
                    onClick={submit}
                    disabled={Object.keys(answers).length < quiz.length}
                    className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-3.5 font-bold text-white shadow-lg transition-transform enabled:hover:scale-[1.02] disabled:opacity-50"
                  >
                    {t("lesson.submit")}
                  </button>
                )}

                {submitted && score === quiz.length && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {t("lesson.pass")}
                    <div className="mt-1 text-sm font-normal">{t("lesson.score", { score, total: quiz.length })}</div>
                  </div>
                )}

                {submitted && score < quiz.length && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-900 dark:bg-amber-950/40">
                    <div className="font-bold text-amber-700 dark:text-amber-300">
                      {t("lesson.score", { score, total: quiz.length })}
                    </div>
                    <div className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/80">{t("lesson.failHint")}</div>
                    <button onClick={retry} className="mt-3 rounded-xl border border-amber-400 px-5 py-2 font-semibold text-amber-700 dark:text-amber-300">
                      🔄 {t("lesson.retry")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-1 font-bold">{t("lesson.reviewTitle")}</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{t("lesson.reviewDesc")}</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(lessons)
            .filter(([d]) => d !== today)
            .sort(([a], [b]) => (a < b ? 1 : -1))
            .slice(0, 3)
            .flatMap(([, r]) => r.wordIds)
            .map((id) => WORDS.find((w) => w.id === id))
            .filter((w): w is (typeof WORDS)[number] => Boolean(w))
            .slice(0, 8)
            .map((w) => (
              <button
                key={w.id}
                onClick={() => speak(w.english, { rate })}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                🔊 {w.english}
              </button>
            ))}
        </div>
        <Link
          href="/learn"
          className="mt-4 inline-block rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {t("lesson.startReview")}
        </Link>
      </section>
    </div>
  );
}
