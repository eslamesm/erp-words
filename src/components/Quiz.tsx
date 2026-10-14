"use client";

import { useMemo, useState } from "react";
import type { Word } from "@/types";
import { ModuleBadge } from "@/components/Badges";
import { speak } from "@/lib/speech";

interface Props {
  words: Word[];
  questionCount: number;
  mode: "mc" | "type" | "mix";
  voiceRate?: number;
  onFinish: (result: { correct: number; total: number }) => void;
}

interface Question {
  word: Word;
  kind: "mc" | "type";
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

function buildQuestions(words: Word[], count: number, mode: "mc" | "type" | "mix"): Question[] {
  const picked = shuffle(words).slice(0, count);
  return picked.map((word) => {
    const kind = mode === "mix" ? (Math.random() < 0.5 ? "mc" : "type") : mode;
    const distractors = shuffle(
      words.filter((w) => w.id !== word.id).map((w) => w.arabic)
    ).slice(0, 3);
    const options = shuffle([word.arabic, ...distractors]);
    return { word, kind, options };
  });
}

export function Quiz({ words, questionCount, mode, voiceRate = 0.95, onFinish }: Props) {
  const questions = useMemo(() => buildQuestions(words, questionCount, mode), [words, questionCount, mode]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = questions[index];
  if (!q) return null;

  function optionCls(opt: string): string {
    let cls = "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
    if (answer !== null) {
      if (opt === q.word.arabic) {
        cls = "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
      } else if (opt === answer && !isCorrect) {
        cls = "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
      } else {
        cls = "border-slate-200 bg-slate-50 text-slate-700 opacity-45 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
      }
    }
    return cls;
  }

  function renderOptions() {
    return (
      <div className="mt-6 grid gap-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => mcSelect(opt)}
            disabled={answer !== null}
            className={`rounded-xl border-2 px-4 py-3 font-semibold transition-colors ${optionCls(opt)}`}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  function grade(correct: boolean) {
    if (correct) setScore((s) => s + 1);
    setIsCorrect(correct);
    setAnswer(correct ? q.word.arabic : q.word.english);
    speak(q.word.english, { rate: voiceRate, pitch: correct ? 1.05 : 1 });
  }

  function mcSelect(opt: string) {
    if (answer) return;
    grade(opt === q.word.arabic);
  }

  function checkTyping() {
    if (answer) return;
    const normalized = input.trim().replace(/[()]/g, "").toLowerCase();
    const accepted = [q.word.english, ...(q.word.synonyms ?? [])].map((w) => w.toLowerCase());
    const correct = accepted.some((w) => normalized === w || normalized.includes(w.split(" ")[0]));
    grade(correct);
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setAnswer(null);
      setInput("");
      setRevealed(false);
      setIsCorrect(false);
    } else {
      setFinished(true);
      onFinish({ correct: score, total: questions.length });
    }
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="text-6xl">{score / Math.max(1, questions.length) >= 0.7 ? "🎉" : "💪"}</div>
        <h2 className="text-2xl font-bold">انتهى الاختبار</h2>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          نتيجتك: <strong className="text-emerald-600 dark:text-emerald-400">{score}</strong> من <strong>{questions.length}</strong>
        </p>
        <button
          onClick={() => {
            setIndex(0);
            setScore(0);
            setAnswer(null);
            setInput("");
            setRevealed(false);
            setFinished(false);
          }}
          className="mt-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          🔄 إعادة الاختبار
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          السؤال {index + 1} من {questions.length}
        </span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">النقاط: {score}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${((index + (answer ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex justify-center">
          <ModuleBadge moduleId={q.word.module} />
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
            <div className="mt-6 grid gap-3">{renderOptions()}</div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400">اكتب المصطلح الإنجليزي لهذه الكلمة:</p>
            <h2 className="mt-2 text-3xl font-bold text-emerald-700 dark:text-emerald-300">{q.word.arabic}</h2>
            {q.word.partOfSpeech && <p className="mt-1 text-xs text-slate-400">{q.word.partOfSpeech}</p>}
            {!revealed ? (
              <>
                <input
                  dir="ltr"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (answer ? next() : checkTyping())}
                  disabled={answer !== null}
                  placeholder="اكتب بالإنجليزية..."
                  className="mt-6 w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-semibold outline-none transition-colors focus:border-emerald-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  onClick={() => setRevealed(true)}
                  disabled={answer !== null}
                  className="mt-3 rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  💡 عرِضها كخيارات متعددة
                </button>
              </>
            ) : (
              <div className="mt-6 grid gap-3">{renderOptions()}</div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-center">
        {q.kind === "mc" ? (
          answer !== null && (
            <button
              onClick={next}
              className="rounded-xl bg-slate-900 px-8 py-3 font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {index + 1 < questions.length ? "التالي ←" : "إنهاء"}
            </button>
          )
        ) : (
          <button
            onClick={answer ? next : checkTyping}
            disabled={revealed && !answer}
            className="rounded-xl bg-slate-900 px-8 py-3 font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {answer
              ? index + 1 < questions.length
                ? "التالي ←"
                : "إنهاء"
              : revealed
                ? "اختر إجابة من الخيارات"
                : "تحقق"}
          </button>
        )}
      </div>

      {answer && (
        <div
          className={`flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-center font-semibold ${
            isCorrect
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
          }`}
        >
          <span>{isCorrect ? "✓ إجابة صحيحة!" : `✗ الإجابة الصحيحة: ${answer}`}</span>
          {!isCorrect && (
            <button
              onClick={() => speak(q.word.english, { rate: voiceRate })}
              className="shrink-0 rounded-full bg-white/60 px-3 py-1 text-xs transition-colors hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800"
            >
              🔊 نطقها
            </button>
          )}
        </div>
      )}
    </div>
  );
}