"use client";

import { useState } from "react";
import type { ModuleId } from "@/types";
import { MODULES } from "@/data/modules";
import { WORDS } from "@/data/words";
import { useProgress } from "@/hooks/useProgress";
import { Dictation, type DictationItem } from "@/components/Dictation";

type Mode = "words" | "sentences";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function DictationPage() {
  const { settings, recordDictation, dailyToday } = useProgress();
  const [screen, setScreen] = useState<"config" | "playing">("config");
  const [mode, setMode] = useState<Mode>("words");
  const [module, setModule] = useState<ModuleId | "all">("all");
  const [count, setCount] = useState(10);
  const [items, setItems] = useState<DictationItem[]>([]);
  const [last, setLast] = useState<{ correct: number; total: number } | null>(null);

  function start() {
    const filtered = WORDS.filter((w) => module === "all" || w.module === module);
    let pool: DictationItem[];
    if (mode === "sentences") {
      pool = filtered
        .flatMap((w) => w.examples.map((ex, i) => ({ id: `${w.id}-${i}`, text: ex })))
        .filter((it) => it.text.split(" ").length >= 3);
    } else {
      pool = filtered.map((w) => ({ id: w.id, text: w.english, hint: w.arabic }));
    }
    setItems(shuffle(pool).slice(0, Math.min(count, pool.length)));
    setLast(null);
    setScreen("playing");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">🎧 التفقيط الصوتي</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          اسمع الكلمة أو الجملة واكتبها بالإنجليزية. تدريب قوي على السمع والهجاء.
        </p>
      </div>

      {dailyToday && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          اكتمل تحديك اليومي ({dailyToday.score}/{dailyToday.total}) ✓
        </p>
      )}

      {screen === "playing" && items.length > 0 ? (
        <Dictation
          items={items}
          voiceRate={settings?.voiceRate ?? 0.95}
          onFinish={(r) => {
            setLast(r);
            recordDictation(r.correct, r.total);
            setScreen("config");
          }}
        />
      ) : (
        <>
          {last && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-center font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              آخر نتيجة: {last.correct} من {last.total} ✓
            </div>
          )}

          <div>
            <h2 className="mb-3 font-bold">النوع</h2>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "words", label: "كلمات", icon: "🔤" },
                  { id: "sentences", label: "جُمل", icon: "💬" },
                ] as { id: Mode; label: string; icon: string }[]
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
                </button>
              ))}
            </div>
          </div>

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
            <h2 className="mb-3 font-bold">عدد العناصر</h2>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 15, 20].map((n) => (
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
            ابدأ التفقيط ←
          </button>
        </>
      )}
    </div>
  );
}