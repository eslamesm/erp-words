"use client";

import { useState } from "react";
import type { Level, Word } from "@/types";
import { WORDS } from "@/data/words";
import { LevelBadge } from "@/components/Badges";
import { PLAN_META } from "@/lib/plan";
import { useT } from "@/hooks/useT";

interface TestQuestion extends Word {
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

const LEVEL_WEIGHT: Record<Level, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };
const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

function buildTest(): TestQuestion[] {
  const picked: Word[] = [];
  for (const level of LEVELS) {
    const pool = shuffle(WORDS.filter((w) => w.level === level));
    picked.push(...pool.slice(0, 2));
  }
  const unique = new Map<string, Word>();
  for (const w of picked) if (!unique.has(w.id)) unique.set(w.id, w);
  const words = Array.from(unique.values());
  return words.map((w) => ({
    ...w,
    options: shuffle([w.arabic, ...shuffle(WORDS.filter((x) => x.id !== w.id).map((x) => x.arabic)).slice(0, 3)]),
  }));
}

function levelFromScore(pct: number): Level {
  if (pct >= 0.5) {
    const groups: [number, Level][] = [
      [0.85, "C1"],
      [0.7, "B2"],
      [0.5, "B1"],
    ];
    for (const [t, l] of groups) if (pct >= t) return l as Level;
  }
  if (pct >= 0.3) return "A2";
  return "A1";
}

interface Props {
  name: string;
  onComplete: (level: Level) => void;
}

export function PlacementTest({ name, onComplete }: Props) {
  const { lang } = useT();
  const [questions] = useState<TestQuestion[]>(() => buildTest());
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const q = questions[index];
  const finished = index >= questions.length;

  function choose(opt: string) {
    if (selected) return;
    setSelected(opt);
    setAnswers((a) => [...a, opt === q.arabic]);
  }

  function next() {
    setIndex((i) => i + 1);
    setSelected(null);
  }

  if (finished) {
    const totalScore = questions.reduce((acc, qq) => acc + LEVEL_WEIGHT[qq.level], 0);
    const earned = questions.reduce((acc, qq, i) => acc + (answers[i] ? LEVEL_WEIGHT[qq.level] : 0), 0);
    const pct = totalScore ? earned / totalScore : 0;
    const level = levelFromScore(pct);
    const meta = PLAN_META[level];
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
        <div className="text-6xl">{meta.icon}</div>
        <h2 className="mt-3 text-2xl font-bold text-emerald-800 dark:text-emerald-300">
          نتيجتك: {lang === "en" ? meta.titleEn : meta.title}
        </h2>
        <p className="mt-2 text-emerald-700 dark:text-emerald-400">
          النسبة: %{Math.round(pct * 100)} • أجبت صحيحًا على {answers.filter(Boolean).length} من {questions.length}
        </p>
        <p className="mt-2 text-sm text-emerald-700/80 dark:text-emerald-400/80">
          على أساس نتيجة هذا الاختبار سنبني لك خطة تعلمّ مُحفّزة تناسبك.
        </p>
        <button
          onClick={() => onComplete(level)}
          className="mt-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          ✨ أنشئ خطتي
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          السؤال {index + 1} من {questions.length}
        </span>
        <LevelBadge level={q.level} />
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">📌 ما معنى هذه الكلمة؟</p>
        <h2 className="mt-2 text-center text-4xl font-bold text-slate-900 dark:text-white" dir="ltr">
          {q.english}
        </h2>
        <div className="mt-6 grid gap-3">
          {q.options.map((opt) => {
            let cls = "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
            if (selected) {
              if (opt === q.arabic) cls = "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
              else if (opt === selected) cls = "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
              else cls = "border-slate-200 bg-slate-50 text-slate-700 opacity-45 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
            }
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                disabled={!!selected}
                className={`rounded-xl border-2 px-4 py-3 font-semibold transition-colors ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-center">
        {selected && (
          <button
            onClick={next}
            className="rounded-xl bg-slate-900 px-8 py-3 font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {index + 1 < questions.length ? "التالي ←" : "عرض النتيجة"}
          </button>
        )}
      </div>
      {selected && (
        <p className="text-center text-sm text-slate-400">
          صباح الخير يا {name} 👋 — استمر بالوتيرة المريحة لك.
        </p>
      )}
    </div>
  );
}