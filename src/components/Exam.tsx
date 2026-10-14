"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Word } from "@/types";
import { speak, stop } from "@/lib/speech";
import { LevelBadge, ModuleBadge } from "@/components/Badges";

const TIME_PER_QUESTION = 45;

type QuestionKind = "mc" | "type" | "dictation";

interface Question {
  word: Word;
  kind: QuestionKind;
  options: string[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(words: Word[]): Question[] {
  return words.map((word, i) => {
    const kind: QuestionKind = (["mc", "type", "dictation"] as const)[i % 3];
    const distractors = shuffle(worldsWithout(words, word).map((w) => w.arabic)).slice(0, 3);
    return { word, kind, options: shuffle([word.arabic, ...distractors]) };
  });
}

function worldsWithout(words: Word[], word: Word): Word[] {
  return words.filter((w) => w.id !== word.id);
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const KIND_META: Record<QuestionKind, { label: string; icon: string }> = {
  mc: { label: "اختيار من متعدد", icon: "☑️" },
  type: { label: "كتابة المصطلح", icon: "⌨️" },
  dictation: { label: "نطق (استماع وكتابة)", icon: "🎧" },
};

export function Exam({
  words,
  voiceRate,
  onFinish,
}: {
  words: Word[];
  voiceRate: number;
  onFinish: (result: { correct: number; total: number; elapsed: number }) => void;
}) {
  const questions = useMemo(() => buildQuestions(words), [words]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(TIME_PER_QUESTION);
  const [results, setResults] = useState<boolean[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mountAt = useRef(0);
  const finishedRef = useRef(false);

  const q = questions[index];

  function finishQuestion(ok: boolean) {
    if (answered !== null) return;
    setAnswered(ok);
    setResults((r) => [...r, ok]);
  }

  function grade(q: Question, ok: boolean) {
    setAnswered(ok);
    setResults((r) => [...r, ok]);
    speak(q.word.english, { rate: voiceRate, pitch: ok ? 1.05 : 1 });
  }

  function mcSelect(opt: string) {
    if (answered !== null || !q) return;
    grade(q, opt === q.word.arabic);
  }

  function checkTyping() {
    if (answered !== null || !q) return;
    const normalized = normalize(input);
    const accepted = [q.word.english, ...(q.word.synonyms ?? [])].map((w) => normalize(w));
    grade(q, accepted.some((a) => normalized === a || normalized.includes(a)));
  }

  useEffect(() => {
    mountAt.current = new Date().getTime();
  }, []);

  useEffect(() => {
    if (!q || finished || answered !== null) return;
    const t = setTimeout(() => {
      if (secondsLeft <= 1) finishQuestion(false);
      else setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, q, finished, answered]);

  useEffect(
    () => () => {
      stop();
    },
    []
  );

  function next() {
    if (!q) return;
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setInput("");
      setAnswered(null);
      setRevealed(false);
      setSecondsLeft(TIME_PER_QUESTION);
    } else {
      setElapsed(Math.round((new Date().getTime() - mountAt.current) / 1000));
      setFinished(true);
    }
  }

  function submit() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const used = elapsed || Math.round((new Date().getTime() - mountAt.current) / 1000);
    onFinish({
      correct: results.filter(Boolean).length,
      total: questions.length,
      elapsed: used,
    });
  }

  const correctCount = results.filter(Boolean).length;

  if (finished) {
    const pct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
    return (
      <section className="flex flex-col gap-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-6xl">{pct >= 80 ? "🏅" : pct >= 50 ? "🎯" : "💪"}</div>
          <h2 className="mt-3 text-2xl font-bold">تقرير الامتحان الذاتي</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            أصبت <strong className="text-emerald-600 dark:text-emerald-400">{correctCount}</strong> من{" "}
            <strong>{questions.length}</strong> ({pct}%) • استغرقت <strong>{elapsed}</strong> ثانية
          </p>
          <div className="mx-auto mt-4 h-3 max-w-sm overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 font-bold">تفاصيل الأسئلة ({questions.length})</h3>
          <div className="flex flex-col gap-2">
            {questions.map((question, i) => {
              const ok = results[i];
              return (
                <div key={question.word.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" dir="ltr">
                        {question.word.english}
                      </span>
                      <span className="text-[10px] text-slate-400">{KIND_META[question.kind].icon} {KIND_META[question.kind].label}</span>
                    </div>
                    <span className="text-xs text-emerald-700 dark:text-emerald-300">{question.word.arabic}</span>
                  </div>
                  {ok === undefined ? (
                    <span className="shrink-0 text-xs font-semibold text-slate-400">⏭ لم تُجب</span>
                  ) : ok ? (
                    <span className="shrink-0 text-xs font-bold text-emerald-600">✓</span>
                  ) : (
                    <span className="shrink-0 text-xs font-bold text-rose-600">✗</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <button
          onClick={submit}
          className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
        >
          إنهاء وعرض الخلاصة
        </button>
      </section>
    );
  }

  if (!q) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">
          السؤال {index + 1} من {questions.length}
        </span>
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {KIND_META[q.kind].icon} {KIND_META[q.kind].label}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              secondsLeft <= 10 ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            }`}
          >
            ⏱ {secondsLeft}
          </span>
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${secondsLeft <= 10 ? "bg-rose-500" : "bg-emerald-500"}`}
          style={{ width: `${(secondsLeft / TIME_PER_QUESTION) * 100}%` }}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex justify-center gap-2">
          <ModuleBadge moduleId={q.word.module} />
          <LevelBadge level={q.word.level} />
        </div>

        {q.kind === "mc" ? (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400">ما ترجمة هذه الكلمة؟</p>
            <h2 className="mt-2 text-4xl font-bold text-slate-900 dark:text-white" dir="ltr">
              {q.word.english}
            </h2>
            <button
              onClick={() => speak(q.word.english, { rate: voiceRate })}
              className="mt-3 rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              🔊 استمع
            </button>
            <div className="mt-6 grid gap-3">
              {q.options.map((opt, i) => {
                let cls = "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
                if (answered !== null) {
                  if (opt === q.word.arabic) {
                    cls = "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
                  } else {
                    cls = "border-slate-200 bg-slate-50 text-slate-700 opacity-45 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
                  }
                }
                return (
                  <button key={i} onClick={() => mcSelect(opt)} disabled={answered !== null} className={`rounded-xl border-2 px-4 py-3 font-semibold transition-colors ${cls}`}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        ) : q.kind === "type" ? (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400">اكتب المصطلح الإنجليزي لهذه الكلمة:</p>
            <h2 className="mt-2 text-3xl font-bold text-emerald-700 dark:text-emerald-300">{q.word.arabic}</h2>
            {!revealed ? (
              <>
                <input
                  dir="ltr"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (answered !== null ? next() : checkTyping())}
                  disabled={answered !== null}
                  placeholder="اكتب بالإنجليزية..."
                  className="mt-6 w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-semibold outline-none transition-colors focus:border-emerald-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  onClick={() => setRevealed(true)}
                  disabled={answered !== null}
                  className="mt-3 rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  💡 عرِضها كخيارات
                </button>
              </>
            ) : (
              <div className="mt-6 grid gap-3">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => mcSelect(opt)}
                    disabled={answered !== null}
                    className={`rounded-xl border-2 px-4 py-3 font-semibold transition-colors ${
                      answered !== null
                        ? opt === q.word.arabic
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "border-slate-200 bg-slate-50 text-slate-700 opacity-45 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400">🎧 استمع واكتب ما تسمعه:</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => speak(q.word.english, { rate: voiceRate })}
                className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-3 text-white shadow transition-transform hover:scale-105"
              >
                🔊 تشغيل
              </button>
              <button
                onClick={() => speak(q.word.english, { rate: Math.min(1, voiceRate * 0.75) })}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                🐢 أبطأ
              </button>
            </div>
            <input
              dir="ltr"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (answered !== null ? next() : checkTyping())}
              disabled={answered !== null}
              placeholder="اكتب ما سمعت..."
              className="mt-6 w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg outline-none transition-colors focus:border-emerald-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {answered !== null && (
              <p className="mt-3 text-sm text-slate-500" dir="ltr">
                الصحيح: <span className="font-bold text-emerald-700 dark:text-emerald-300">{q.word.arabic} — {q.word.english}</span>
              </p>
            )}
          </>
        )}

        {answered !== null && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              results[index] ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
            }`}
          >
            <div className="font-semibold">{results[index] ? "✓ أحسنت!" : "✗ الإجابة الصحيحة:"}</div>
            {!results[index] && (
              <p className="mt-1 font-medium" dir="ltr">
                {q.word.english}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        {answered !== null ? (
          <button
            onClick={next}
            className="rounded-xl bg-slate-900 px-8 py-3 font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {index + 1 < questions.length ? "التالي ←" : "عرض التقرير"}
          </button>
        ) : (
          q.kind !== "mc" && (
            <button
              onClick={checkTyping}
              disabled={!input.trim()}
              className="rounded-xl bg-slate-900 px-8 py-3 font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              تحقق
            </button>
          )
        )}
      </div>
    </div>
  );
}