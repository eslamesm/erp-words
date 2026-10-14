"use client";

import type { ReactNode } from "react";
import { useT } from "@/hooks/useT";

export function GameFrame({
  icon,
  title,
  onExit,
  children,
}: {
  icon: string;
  title: string;
  onExit: () => void;
  children: ReactNode;
}) {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <span>{icon}</span>
          {title}
        </h2>
        <button
          onClick={onExit}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          ← {t("game.exit")}
        </button>
      </div>
      {children}
    </div>
  );
}

export function GameResult({
  score,
  total,
  best,
  onReplay,
  onExit,
}: {
  score: number;
  total: number;
  best: number;
  onReplay: () => void;
  onExit: () => void;
}) {
  const { t } = useT();
  const perfect = total > 0 && score >= total;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
      <div className="text-5xl">{perfect ? "🏆" : "🎯"}</div>
      <div className="mt-3 text-xl font-bold">{perfect ? t("game.perfect") : t("game.finished")}</div>
      <div className="mt-1 text-slate-600 dark:text-slate-300">
        {t("game.scoreLine", { score, total })}
      </div>
      <div className="mt-1 text-sm text-amber-600 dark:text-amber-400">
        {t("game.best", { n: best })}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={onReplay}
          className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
        >
          🔄 {t("game.replay")}
        </button>
        <button
          onClick={onExit}
          className="rounded-2xl border border-slate-300 px-6 py-3 font-semibold transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {t("game.backToHub")}
        </button>
      </div>
    </div>
  );
}
