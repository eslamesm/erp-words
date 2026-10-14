"use client";

import { useState } from "react";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";
import { WordChallenge } from "@/components/games/WordChallenge";
import { MatchingGame } from "@/components/games/MatchingGame";
import { WordBuilder } from "@/components/games/WordBuilder";
import { SentenceBuilder } from "@/components/games/SentenceBuilder";
import { ConversationBuilder } from "@/components/games/ConversationBuilder";

type GameId =
  | "word-challenge"
  | "matching"
  | "word-builder"
  | "sentence-builder"
  | "conversation-builder";

const GAMES: { id: GameId; icon: string; titleKey: string; descKey: string }[] = [
  { id: "word-challenge", icon: "⚡", titleKey: "game.wordChallenge", descKey: "game.wordChallengeDesc" },
  { id: "matching", icon: "🧠", titleKey: "game.matching", descKey: "game.matchingDesc" },
  { id: "word-builder", icon: "🔤", titleKey: "game.wordBuilder", descKey: "game.wordBuilderDesc" },
  { id: "sentence-builder", icon: "🧩", titleKey: "game.sentenceBuilder", descKey: "game.sentenceBuilderDesc" },
  { id: "conversation-builder", icon: "💬", titleKey: "game.conversationBuilder", descKey: "game.conversationBuilderDesc" },
];

export default function GamesPage() {
  const { t } = useT();
  const { games } = useProgress();
  const [active, setActive] = useState<GameId | null>(null);

  if (active === "word-challenge") return <WordChallenge onExit={() => setActive(null)} />;
  if (active === "matching") return <MatchingGame onExit={() => setActive(null)} />;
  if (active === "word-builder") return <WordBuilder onExit={() => setActive(null)} />;
  if (active === "sentence-builder") return <SentenceBuilder onExit={() => setActive(null)} />;
  if (active === "conversation-builder") return <ConversationBuilder onExit={() => setActive(null)} />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("nav.games")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("game.hubDesc")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GAMES.map((g) => {
          const rec = games[g.id];
          return (
            <button
              key={g.id}
              onClick={() => setActive(g.id)}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-start shadow-sm transition-transform hover:scale-[1.01] hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="text-3xl">{g.icon}</div>
              <div className="text-lg font-bold">{t(g.titleKey)}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{t(g.descKey)}</div>
              <div className="mt-1 flex items-center gap-3 text-xs font-semibold">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {t("game.best", { n: rec?.best ?? 0 })}
                </span>
                <span className="text-slate-400">{t("game.plays", { n: rec?.plays ?? 0 })}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
