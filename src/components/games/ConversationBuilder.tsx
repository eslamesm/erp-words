"use client";

import { useEffect, useRef, useState } from "react";
import { CONVERSATIONS } from "@/data/conversations";
import { speak } from "@/lib/speech";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";
import { GameFrame, GameResult } from "./GameFrame";
import { sample, shuffle } from "./util";

interface Line {
  en: string;
  ar: string;
  role: string;
  orig: number;
}

interface Round {
  title: string;
  topic: string;
  lines: Line[];
  pool: Line[];
}

function makeRound(): Round {
  const convos = CONVERSATIONS.filter((c) => c.lines.length >= 4);
  const c = sample(convos, 1)[0];
  const lines: Line[] = c.lines.slice(0, 6).map((l, i) => ({ en: l.en, ar: l.ar, role: l.role, orig: i }));
  return { title: c.title, topic: c.topic, lines, pool: shuffle(lines) };
}

export function ConversationBuilder({ onExit }: { onExit: () => void }) {
  const { t } = useT();
  const { games, settings, recordGame } = useProgress();
  const rate = settings?.voiceRate ?? 0.95;

  const [round, setRound] = useState<Round>(makeRound);
  const [chosen, setChosen] = useState<number[]>([]);
  const [wrong, setWrong] = useState(0);
  const [bad, setBad] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const best = games["conversation-builder"]?.best ?? 0;
  const total = round.pool.length;

  function reset() {
    setRound(makeRound());
    setChosen([]);
    setWrong(0);
    setBad(false);
    setFinished(false);
    setFinalScore(0);
  }

  function clickLine(i: number) {
    if (chosen.includes(i) || bad) return;
    const next = [...chosen, i];
    setChosen(next);
    if (next.length === total) {
      const ordered = next.map((k) => round.pool[k].orig);
      const correct = ordered.every((v, pos) => v === pos);
      if (correct) {
        speak(round.lines.map((l) => l.en).join(" "), { rate });
        const sc = Math.max(0, total - wrong);
        setFinalScore(sc);
        timer.current = setTimeout(() => {
          recordGame("conversation-builder", sc, total);
          setFinished(true);
        }, 700);
      } else {
        setWrong((w) => w + 1);
        setBad(true);
        timer.current = setTimeout(() => {
          setChosen([]);
          setBad(false);
        }, 800);
      }
    }
  }

  function removeAt(pos: number) {
    setChosen((c) => c.filter((_, k) => k !== pos));
  }

  if (finished) {
    return (
      <GameFrame icon="💬" title={t("game.conversationBuilder")} onExit={onExit}>
        <GameResult score={finalScore} total={total} best={best} onReplay={reset} onExit={onExit} />
      </GameFrame>
    );
  }

  return (
    <GameFrame icon="💬" title={t("game.conversationBuilder")} onExit={onExit}>
      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
        <div className="font-bold">{round.title}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{round.topic}</div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{t("game.orderLines")}</p>

      <div className="flex flex-col gap-2">
        {chosen.length === 0 && (
          <div
            className={`rounded-2xl border border-dashed p-6 text-center text-sm ${
              bad ? "border-rose-400 text-rose-500" : "border-slate-300 text-slate-400 dark:border-slate-700"
            }`}
          >
            {t("game.tapLines")}
          </div>
        )}
        {chosen.map((poolIdx, pos) => {
          const line = round.pool[poolIdx];
          const misplaced = bad && line.orig !== pos;
          return (
            <button
              key={pos}
              onClick={() => removeAt(pos)}
              className={`rounded-2xl border p-3 text-start ${
                misplaced
                  ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40"
                  : "border-slate-900 bg-white dark:border-white dark:bg-slate-900"
              }`}
            >
              <span className="me-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">{line.role}</span>
              <span className="font-semibold">{line.en}</span>
              <div dir="rtl" className="mt-1 text-sm text-slate-500 dark:text-slate-400">{line.ar}</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        {round.pool.map((line, i) => (
          <button
            key={i}
            disabled={chosen.includes(i) || bad}
            onClick={() => clickLine(i)}
            className={`rounded-2xl border p-3 text-start transition-colors ${
              chosen.includes(i)
                ? "border-slate-200 bg-slate-100 opacity-50 dark:border-slate-800 dark:bg-slate-800"
                : "border-slate-200 bg-white hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-900"
            }`}
          >
            <span className="me-2 text-xs font-bold text-slate-400">{line.role}</span>
            <span className="font-semibold">{line.en}</span>
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
