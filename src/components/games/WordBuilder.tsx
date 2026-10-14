"use client";

import { useEffect, useRef, useState } from "react";
import type { Word } from "@/types";
import { speak } from "@/lib/speech";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";
import { GameFrame, GameResult } from "./GameFrame";
import { playableWords, sample, scramble } from "./util";

interface Round {
  word: Word;
  pool: string[];
}

const ROUND = 6;

function makeRound(): Round[] {
  const pool = playableWords().filter(
    (w) => w.english.length >= 3 && w.english.length <= 12 && /^[a-z]+$/i.test(w.english)
  );
  return sample(pool, ROUND).map((word) => ({ word, pool: scramble(word.english) }));
}

export function WordBuilder({ onExit }: { onExit: () => void }) {
  const { t } = useT();
  const { games, settings, recordGame } = useProgress();
  const rate = settings?.voiceRate ?? 0.95;

  const [round, setRound] = useState<Round[]>(makeRound);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [bad, setBad] = useState(false);
  const [finished, setFinished] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const r = round[idx];
  const best = games["word-builder"]?.best ?? 0;
  const built = chosen.map((i) => r.pool[i]).join("");
  const solved = built.toLowerCase() === r.word.english.toLowerCase();

  function reset() {
    setRound(makeRound());
    setIdx(0);
    setChosen([]);
    setScore(0);
    setMistakes(0);
    setHintUsed(false);
    setBad(false);
    setFinished(false);
  }

  function advance(finalScore: number) {
    if (idx + 1 >= round.length) {
      recordGame("word-builder", finalScore, ROUND);
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setChosen([]);
    setMistakes(0);
    setHintUsed(false);
    setBad(false);
  }

  function clickLetter(i: number) {
    if (chosen.includes(i) || solved) return;
    const next = [...chosen, i];
    setChosen(next);
    const candidate = next.map((k) => r.pool[k]).join("");
    if (candidate.length === r.word.english.length) {
      if (candidate.toLowerCase() === r.word.english.toLowerCase()) {
        const gained = mistakes === 0 && !hintUsed ? 1 : 0;
        const newScore = score + gained;
        setScore(newScore);
        speak(r.word.english, { rate });
        timer.current = setTimeout(() => advance(newScore), 800);
      } else {
        setMistakes((m) => m + 1);
        setBad(true);
        timer.current = setTimeout(() => {
          setChosen([]);
          setBad(false);
        }, 650);
      }
    }
  }

  function removeAt(pos: number) {
    if (solved) return;
    setChosen((c) => c.filter((_, k) => k !== pos));
  }

  function hint() {
    if (solved) return;
    const target = r.word.english.toLowerCase();
    const need = target[chosen.length];
    if (!need) return;
    const used = new Set(chosen);
    const poolIdx = r.pool.findIndex((ch, i) => !used.has(i) && ch.toLowerCase() === need);
    if (poolIdx < 0) return;
    setHintUsed(true);
    setChosen((c) => [...c, poolIdx]);
  }

  if (finished) {
    return (
      <GameFrame icon="🔤" title={t("game.wordBuilder")} onExit={onExit}>
        <GameResult score={score} total={ROUND} best={best} onReplay={reset} onExit={onExit} />
      </GameFrame>
    );
  }

  return (
    <GameFrame icon="🔤" title={t("game.wordBuilder")} onExit={onExit}>
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>{t("game.question", { n: idx + 1, total: ROUND })}</span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {t("game.scoreShort", { n: score })}
        </span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="text-xs font-bold uppercase text-slate-400">{t("game.buildWord")}</div>
        <div className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400">{r.word.arabic}</div>
        {r.word.definitionAr && (
          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{r.word.definitionAr}</div>
        )}
        <div className="mt-5 flex min-h-12 flex-wrap items-center justify-center gap-2">
          {r.word.english.split("").map((_, pos) => {
            const ch = built[pos];
            const isSolved = solved && !!ch;
            return (
              <button
                key={pos}
                onClick={() => removeAt(pos)}
                className={`flex h-11 w-9 items-center justify-center rounded-xl border text-lg font-bold uppercase transition-colors ${
                  bad
                    ? "border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/40"
                    : isSolved
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : ch
                        ? "border-slate-900 bg-slate-100 text-slate-900 dark:border-white dark:bg-slate-800 dark:text-white"
                        : "border-dashed border-slate-300 dark:border-slate-700"
                }`}
              >
                {ch ?? ""}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {r.pool.map((ch, i) => (
          <button
            key={i}
            disabled={chosen.includes(i) || solved}
            onClick={() => clickLetter(i)}
            className={`h-11 w-11 rounded-xl border text-lg font-bold uppercase transition-colors ${
              chosen.includes(i)
                ? "border-slate-200 bg-slate-100 text-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-600"
                : "border-slate-300 bg-white hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            {ch}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={hint}
          disabled={solved}
          className="rounded-xl border border-amber-400 px-5 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50 dark:text-amber-300 dark:hover:bg-amber-950/40"
        >
          💡 {t("game.hint")}
        </button>
        <button
          onClick={() => setChosen([])}
          disabled={solved || chosen.length === 0}
          className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          ⌫ {t("game.clear")}
        </button>
      </div>
    </GameFrame>
  );
}
