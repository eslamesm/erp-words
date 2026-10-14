"use client";

import { useEffect, useRef, useState } from "react";
import type { Word } from "@/types";
import { speak } from "@/lib/speech";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";
import { GameFrame, GameResult } from "./GameFrame";
import { playableWords, sample } from "./util";

interface Question {
  word: Word;
  options: string[];
}

const ROUND = 10;

function makeRound(): Question[] {
  const pool = playableWords();
  const picked = sample(pool, ROUND);
  return picked.map((word) => {
    const distractors = sample(
      pool.filter((w) => w.id !== word.id && w.arabic !== word.arabic),
      3
    ).map((w) => w.arabic);
    return { word, options: sample([word.arabic, ...distractors], 4) };
  });
}

export function WordChallenge({ onExit }: { onExit: () => void }) {
  const { t } = useT();
  const { games, settings, recordGame } = useProgress();
  const rate = settings?.voiceRate ?? 0.95;

  const [round, setRound] = useState<Question[]>(makeRound);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const q = round[idx];
  const best = games["word-challenge"]?.best ?? 0;

  function replay() {
    setRound(makeRound());
    setIdx(0);
    setScore(0);
    setChosen(null);
    setFinished(false);
  }

  function pick(opt: string) {
    if (chosen) return;
    setChosen(opt);
    const correct = opt === q.word.arabic;
    const next = correct ? score + 1 : score;
    setScore(next);
    if (correct) speak(q.word.english, { rate });
    timer.current = setTimeout(() => {
      if (idx + 1 >= round.length) {
        recordGame("word-challenge", next, ROUND);
        setFinished(true);
      } else {
        setIdx((i) => i + 1);
        setChosen(null);
      }
    }, correct ? 850 : 1400);
  }

  if (finished) {
    return (
      <GameFrame icon="⚡" title={t("game.wordChallenge")} onExit={onExit}>
        <GameResult score={score} total={ROUND} best={best} onReplay={replay} onExit={onExit} />
      </GameFrame>
    );
  }

  return (
    <GameFrame icon="⚡" title={t("game.wordChallenge")} onExit={onExit}>
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>{t("game.question", { n: idx + 1, total: ROUND })}</span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {t("game.scoreShort", { n: score })}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(idx / ROUND) * 100}%` }} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="text-xs font-bold uppercase text-slate-400">{t("game.chooseMeaning")}</div>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">{q.word.english}</span>
          <button
            onClick={() => speak(q.word.english, { rate })}
            className="rounded-xl border border-slate-300 px-3 py-2 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            aria-label={t("lesson.listen")}
          >
            🔊
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {q.options.map((opt) => {
          const isCorrect = opt === q.word.arabic;
          const isChosen = chosen === opt;
          const state = !chosen
            ? "border-slate-200 bg-white hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-900"
            : isCorrect
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
              : isChosen
                ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40"
                : "border-slate-200 bg-white opacity-60 dark:border-slate-800 dark:bg-slate-900";
          return (
            <button
              key={opt}
              disabled={!!chosen}
              onClick={() => pick(opt)}
              className={`rounded-2xl border px-4 py-3 text-lg font-semibold transition-colors ${state}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </GameFrame>
  );
}
