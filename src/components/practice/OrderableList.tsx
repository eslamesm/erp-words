"use client";

import { useState } from "react";

// عنصر قابل للترتيب — ترتيب ابتدائي ثابت مشتق من المصفوفة (يفادي اختلاف الخادم والعميل).
export interface OrderableItem {
  id: string;
  labelAr: string;
  labelEn: string;
}

export interface OrderableLabels {
  prompt: string;
  check: string;
  correct: string;
  wrong: string;
  reset: string;
  up: string;
  down: string;
}

function startOrder(items: OrderableItem[]): OrderableItem[] {
  if (items.length < 2) return [...items];
  const shift = items.length > 2 ? 2 : 1;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

export function OrderableList({
  items,
  labels,
  lang,
}: {
  items: OrderableItem[];
  labels: OrderableLabels;
  lang: "ar" | "en";
}) {
  const [order, setOrder] = useState<OrderableItem[]>(() => startOrder(items));
  const [checked, setChecked] = useState(false);

  const isCorrect = order.every((it, i) => it.id === items[i].id);

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    setChecked(false);
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <p className="font-semibold text-slate-800 dark:text-slate-100">{labels.prompt}</p>
      <ol className="mt-3 flex flex-col gap-2">
        {order.map((item, i) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60"
          >
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {i + 1}. {lang === "en" ? item.labelEn : item.labelAr}
            </span>
            <span className="flex shrink-0 gap-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={labels.up}
                className="rounded-lg border border-slate-300 px-2 py-0.5 text-xs text-slate-600 disabled:opacity-30 dark:border-slate-600 dark:text-slate-300"
              >
                ↑
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === order.length - 1}
                aria-label={labels.down}
                className="rounded-lg border border-slate-300 px-2 py-0.5 text-xs text-slate-600 disabled:opacity-30 dark:border-slate-600 dark:text-slate-300"
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setChecked(true)}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {labels.check}
        </button>
        <button
          onClick={() => {
            setOrder(startOrder(items));
            setChecked(false);
          }}
          aria-label={labels.reset}
          className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          ↻ {labels.reset}
        </button>
      </div>
      {checked && (
        <p
          className={`mt-2 text-sm font-semibold ${
            isCorrect
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {isCorrect ? labels.correct : labels.wrong}
        </p>
      )}
    </div>
  );
}
