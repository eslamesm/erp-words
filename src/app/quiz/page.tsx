"use client";

import { useState } from "react";
import type { ModuleId } from "@/types";
import { MODULES } from "@/data/modules";
import { WORDS } from "@/data/words";
import { useProgress } from "@/hooks/useProgress";
import { Quiz } from "@/components/Quiz";
import { Exam } from "@/components/Exam";

type Mode = "mc" | "type" | "mix" | "exam";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizPage() {
  const { stats, recordQuiz, settings, progress } = useProgress();
  const [screen, setScreen] = useState<"config" | "playing">("config");
  const [module, setModule] = useState<ModuleId | "all">("all");
  const [mode, setMode] = useState<Mode>("mix");
  const [count, setCount] = useState(10);
  const [deck, setDeck] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<{ correct: number; total: number } | null>(null);

  function start() {
    const filtered = WORDS.filter((w) => module === "all" || w.module === module);
    if (mode === "exam") {
      // الامتحان الذاتي يبدأ من أخطائك أولا ثم يكمل بكلمات عشوائية من النطاق
      const mistakes = filtered.filter((w) => (progress[w.id]?.lapses ?? 0) > 0);
      const rest = filtered.filter((w) => (progress[w.id]?.lapses ?? 0) === 0);
      const ids = [...shuffle(mistakes).map((w) => w.id), ...shuffle(rest).map((w) => w.id)];
      setDeck(ids.slice(0, Math.min(count, ids.length)));
    } else {
      setDeck(shuffle(filtered).slice(0, Math.min(count, filtered.length)).map((w) => w.id));
    }
    setLastResult(null);
    setScreen("playing");
  }

  function handleFinish(result: { correct: number; total: number }) {
    setLastResult(result);
    recordQuiz(result.correct, result.total);
    setScreen("config");
  }

  const words = deck.map((id) => WORDS.find((w) => w.id === id)!).filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">📝 اختبار</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          اختبر حفظك للمفردات. إجاباتك تؤثر على خوارزمية التعلم أيضًا.
        </p>
      </div>

      {screen === "playing" ? (
        mode === "exam" ? (
          <Exam words={words} voiceRate={settings?.voiceRate ?? 0.95} onFinish={handleFinish} />
        ) : (
          <Quiz
            words={words}
            questionCount={words.length}
            mode={mode}
            voiceRate={settings?.voiceRate ?? 0.95}
            onFinish={handleFinish}
          />
        )
      ) : (
        <>
          {lastResult && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-center font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              آخر نتيجة: {lastResult.correct} من {lastResult.total} ✓
            </div>
          )}

          <div>
            <h2 className="mb-3 font-bold">الوحدة</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setModule("all")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  module === "all"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                كل الوحدات
              </button>
              {MODULES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModule(m.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    module === m.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {m.icon} {m.labelAr}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-bold">نوع الاختبار</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  { id: "mc", label: "اختيار من متعدد", icon: "☑️", hint: "" },
                  { id: "type", label: "كتابة المصطلح", icon: "⌨️", hint: "" },
                  { id: "mix", label: "مختلط", icon: "🔀", hint: "" },
                  { id: "exam", label: "الامتحان الذاتي", icon: "🕒", hint: "موقوت وبني على أخطائك" },
                ] as { id: Mode; label: string; icon: string; hint: string }[]
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                    mode === m.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="block text-lg">{m.icon}</span>
                  {m.label}
                  {m.hint && <span className="mt-0.5 block text-[10px] font-normal opacity-70">{m.hint}</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-bold">عدد الأسئلة</h2>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 15, 20, 30].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${
                    count === n
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={start}
            className="mt-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
          >
            ابدأ الاختبار ←
          </button>

          <p className="text-xs text-slate-400">
            إجمالي مراجعاتك: {stats?.reviews ?? 0} • دقة إجاباتك:{" "}
            {stats && stats.reviews > 0 ? Math.round((stats.correct / stats.reviews) * 100) : 0}%
          </p>
          <p className="text-xs text-slate-400">كلمات متاحة في هذه الوحدة: {WORDS.filter((w) => module === "all" || w.module === module).length}</p>
        </>
      )}
    </div>
  );
}