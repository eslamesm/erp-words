"use client";

import { useEffect, useRef, useState } from "react";
import { speak } from "@/lib/speech";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";
import { GameFrame, GameResult } from "./GameFrame";
import { playableWords, sample, shuffle } from "./util";

interface Tile {
  key: string;
  wordId: string;
  text: string;
  type: "en" | "ar";
}

const PAIRS = 6;

function makeTiles(): Tile[] {
  const words = sample(playableWords(), PAIRS);
  const tiles: Tile[] = words.flatMap((w) => [
    { key: `${w.id}-en`, wordId: w.id, text: w.english, type: "en" as const },
    { key: `${w.id}-ar`, wordId: w.id, text: w.arabic, type: "ar" as const },
  ]);
  return shuffle(tiles);
}

export function MatchingGame({ onExit }: { onExit: () => void }) {
  const { t } = useT();
  const { games, settings, recordGame } = useProgress();
  const rate = settings?.voiceRate ?? 0.95;

  const [tiles, setTiles] = useState<Tile[]>(makeTiles);
  const [selected, setSelected] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [flawed, setFlawed] = useState(0);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const best = games["matching"]?.best ?? 0;
  const score = Math.max(0, PAIRS - flawed);

  function reset() {
    setTiles(makeTiles());
    setSelected([]);
    setMatched([]);
    setFlawed(0);
    setMoves(0);
    setLocked(false);
    setFinished(false);
  }

  function onTile(i: number) {
    if (locked || matched.includes(tiles[i].wordId) || selected.includes(i)) return;
    const next = [...selected, i];
    setSelected(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      const match = tiles[a].wordId === tiles[b].wordId && tiles[a].type !== tiles[b].type;
      if (match) {
        const wordId = tiles[a].wordId;
        const en = tiles[a].type === "en" ? tiles[a].text : tiles[b].text;
        speak(en, { rate });
        setSelected([]);
        const newMatched = [...matched, wordId];
        setMatched(newMatched);
        if (newMatched.length === PAIRS) {
          const flawedNow = flawed;
          timer.current = setTimeout(() => {
            const finalScore = Math.max(0, PAIRS - flawedNow);
            recordGame("matching", finalScore, PAIRS);
            setFinished(true);
          }, 500);
        }
      } else {
        setLocked(true);
        const flawedNow = flawed + 1;
        setFlawed(flawedNow);
        timer.current = setTimeout(() => {
          setSelected([]);
          setLocked(false);
        }, 750);
      }
    }
  }

  if (finished) {
    return (
      <GameFrame icon="🧠" title={t("game.matching")} onExit={onExit}>
        <GameResult score={score} total={PAIRS} best={best} onReplay={reset} onExit={onExit} />
      </GameFrame>
    );
  }

  return (
    <GameFrame icon="🧠" title={t("game.matching")} onExit={onExit}>
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>{t("game.pairsProgress", { n: matched.length, total: PAIRS })}</span>
        <span>{t("game.moves", { n: moves })}</span>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{t("game.matchingHint")}</p>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
        {tiles.map((tile, i) => {
          const isMatched = matched.includes(tile.wordId);
          const isSelected = selected.includes(i);
          const cls = isMatched
            ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
            : isSelected
              ? "border-slate-900 bg-slate-100 dark:border-white dark:bg-slate-800"
              : "border-slate-200 bg-white hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-900";
          return (
            <button
              key={tile.key}
              disabled={isMatched}
              onClick={() => onTile(i)}
              className={`flex min-h-20 items-center justify-center rounded-2xl border p-3 text-center text-sm font-semibold transition-colors ${cls}`}
            >
              {tile.text}
            </button>
          );
        })}
      </div>
    </GameFrame>
  );
}
