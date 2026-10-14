"use client";

import { useEffect, useRef, useState } from "react";
import { speak } from "@/lib/speech";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";
import { GameFrame, GameResult } from "./GameFrame";
import { playableWords, sample, shuffle } from "./util";

interface Round {
  answer: string;
  ar: string;
  tokens: string[];
}

const ROUND = 5;

function splitTokens(sentence: string): string[] {
  return sentence.trim().split(/\s+/);
}

function makeRound(): Round[] {
  const pool = playableWords().filter(
    (w) => w.examples[0] && w.examplesAr?.[0] && splitTokens(w.examples[0]).length >= 3
  );
  return sample(pool, ROUND).map((w) => {
    const answer = w.examples[0].trim();
    return { answer, ar: w.examplesAr![0], tokens: shuffle(splitTokens(answer)) };
  });
}

export function SentenceBuilder({ onExit }: { onExit: () => void }) {
  const { t } = useT();
  const { games, settings, recordGame } = useProgress();
  const rate = settings?.voiceRate ?? 0.95;

  const [round, setRound] = useState<Round[]>(makeRound);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [tried, setTried] = useState(false);
  const [bad, setBad] = useState(false);
  const [finished, setFinished] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const r = round[idx];
  const best = games["sentence-builder"]?.best ?? 0;

  function reset() {
    setRound(makeRound());
    setIdx(0);
    setChosen([]);
    setScore(0);
    setTried(false);
    setBad(false);
    setFinished(false);
  }

  function clickToken(i: number) {
    if (chosen.includes(i) || bad) return;
    const next = [...chosen, i];
    setChosen(next);
    if (next.length === r.tokens.length) {
      const candidate = next.map((k) => r.tokens[k]).join(" ");
      if (candidate.toLowerCase() === r.answer.toLowerCase()) {
        const gained = tried ? 0 : 1;
        const newScore = score + gained;
        setScore(newScore);
        speak(r.answer, { rate });
        timer.current = setTimeout(() => {
          if (idx + 1 >= round.length) {
            recordGame("sentence-builder", newScore, ROUND);
            setFinished(true);
          } else {
            setIdx((n) => n + 1);
            setChosen([]);
            setTried(false);
            setBad(false);
          }
        }, 900);
      } else {
        setTried(true);
        setBad(true);
        timer.current = setTimeout(() => {
          setChosen([]);
          setBad(false);
        }, 700);
      }
    }
  }

  if (finished) {
    return (
      <GameFrame icon="🧱" title={t("game.sentenceBuilder")} onExit={onExit}>
        <GameResult score={score} total={ROUND} best={best} onReplay={reset} onExit={onExit} />
      </GameFrame>
    );
  }

  return (
    <GameFrame icon="🧩" title={t("game.sentenceBuilder")} onExit={onExit}>
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>{t("game.question", { n: idx + 1, total: ROUND })}</span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {t("game.scoreShort", { n: score })}
        </span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="text-xs font-bold uppercase text-slate-400">{t("game.buildSentence")}</div>
        <div dir="rtl" className="mt-2 text-lg font-semibold text-emerald-700 dark:text-emerald-400">
          {r.ar}
        </div>
        <div
          className={`mt-5 flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border border-dashed p-3 ${
            bad ? "border-rose-400 bg-rose-50 dark:bg-rose-950/30" : "border-slate-300 dark:border-slate-700"
          }`}
        >
          {chosen.length === 0 && (
            <span className="text-sm text-slate-400">{t("game.tapWords")}</span>
          )}
          {chosen.map((i, pos) => (
            <button
              key={pos}
              onClick={() => setChosen((c) => c.filter((_, k) => k !== pos))}
              className="rounded-xl border border-slate-900 bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-900 dark:border-white dark:bg-slate-800 dark:text-white"
            >
              {r.tokens[i]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {r.tokens.map((tok, i) => (
          <button
            key={i}
            disabled={chosen.includes(i) || bad}
            onClick={() => clickToken(i)}
            className={`rounded-xl border px-4 py-2 font-semibold transition-colors ${
              chosen.includes(i)
                ? "border-slate-200 bg-slate-100 text-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-600"
                : "border-slate-300 bg-white hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            {r.tokens[i]}
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setChosen([])}
          disabled={chosen.length === 0}
          className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          ⌫ {t("game.clear")}
        </button>
      </div>
    </GameFrame>
  );
}
