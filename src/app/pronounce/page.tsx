"use client";

import { useMemo, useState } from "react";
import { WORDS } from "@/data/words";
import { CONVERSATIONS } from "@/data/conversations";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";
import { PronunciationTrainer, type PronounceItem } from "@/components/PronunciationTrainer";

type Tab = "words" | "sentences";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const WORD_ITEMS: PronounceItem[] = WORDS.map((w) => ({
  id: `w:${w.id}`,
  text: w.english,
  translation: w.arabic,
  hint: w.pronunciation,
}));

const SENTENCE_ITEMS: PronounceItem[] = [
  ...WORDS.flatMap((w) =>
    w.examples.map((ex, i) => ({
      id: `ex:${w.id}:${i}`,
      text: ex,
      translation: w.arabic,
    }))
  ),
  ...CONVERSATIONS.flatMap((c) =>
    c.lines.map((l, k) => ({
      id: `conv:${c.id}:${k}`,
      text: l.en,
      translation: l.ar,
    }))
  ),
];

const THRESHOLD = 80;
const COUNTS = [5, 10, 15, 20];

export default function PronouncePage() {
  const { settings, pronunciation, recordPronunciation } = useProgress();
  const { t } = useT();
  const [tab, setTab] = useState<Tab>("words");
  const [screen, setScreen] = useState<"config" | "playing">("config");
  const [count, setCount] = useState(10);
  const [deck, setDeck] = useState<PronounceItem[]>([]);
  const [lastResult, setLastResult] = useState<{ correct: number; total: number } | null>(null);

  const source = tab === "words" ? WORD_ITEMS : SENTENCE_ITEMS;

  const stats = useMemo(() => {
    const ids = Object.keys(pronunciation ?? {});
    if (ids.length === 0) return { n: 0, avg: 0 };
    const sum = ids.reduce((acc, id) => acc + (pronunciation[id]?.best ?? 0), 0);
    return { n: ids.length, avg: Math.round(sum / ids.length) };
  }, [pronunciation]);

  function start() {
    setDeck(shuffle(source).slice(0, Math.min(count, source.length)));
    setLastResult(null);
    setScreen("playing");
  }

  function handleFinish(result: { correct: number; total: number }) {
    setLastResult(result);
    setScreen("config");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("pronounce.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("pronounce.subtitle")}</p>
      </div>

      {screen === "playing" ? (
        <PronunciationTrainer
          items={deck}
          voiceRate={settings?.voiceRate ?? 0.95}
          threshold={THRESHOLD}
          onResult={recordPronunciation}
          onFinish={handleFinish}
        />
      ) : (
        <>
          {lastResult && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-center font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              {t("pronounce.summary", { correct: lastResult.correct, total: lastResult.total })} ✓
            </div>
          )}

          <div>
            <h2 className="mb-3 font-bold">{tab === "words" ? t("pronounce.tabWords") : t("pronounce.tabSentences")}</h2>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "words", label: t("pronounce.tabWords"), icon: "🔤" },
                  { id: "sentences", label: t("pronounce.tabSentences"), icon: "💬" },
                ] as { id: Tab; label: string; icon: string }[]
              ).map((tb) => (
                <button
                  key={tb.id}
                  onClick={() => setTab(tb.id)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    tab === tb.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="ml-1">{tb.icon}</span>
                  {tb.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-bold">{t("pronounce.count")}</h2>
            <div className="flex flex-wrap gap-2">
              {COUNTS.map((n) => (
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
            {t("pronounce.start")}
          </button>

          <p className="text-xs text-slate-400">
            {t("pronounce.stats", { n: stats.n, avg: stats.avg })} • {t("pronounce.threshold", { n: THRESHOLD })}
          </p>
        </>
      )}
    </div>
  );
}
