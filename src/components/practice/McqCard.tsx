"use client";

import { useState } from "react";
import { useT } from "@/hooks/useT";

// بطاقة اختيار من متعدد مستقلة عن وحدة البريد — تخدم أسئلة الفهم والتمرين الموجّه.
export interface McqItem {
  id: string;
  promptAr: string;
  promptEn: string;
  optionsAr: string[];
  optionsEn: string[];
  answerIndex: number;
  explainAr: string;
  explainEn: string;
}

export function McqCard({
  item,
  index,
  total,
}: {
  item: McqItem;
  index: number;
  total: number;
}) {
  const { lang } = useT();
  const [selected, setSelected] = useState<number | null>(null);
  const prompt = lang === "en" ? item.promptEn : item.promptAr;
  const options = lang === "en" ? item.optionsEn : item.optionsAr;
  const explain = lang === "en" ? item.explainEn : item.explainAr;

  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="mb-2 text-xs font-bold text-slate-400">
        {index + 1}/{total}
      </div>
      <p
        className="font-semibold text-slate-800 dark:text-slate-100"
        dir={lang === "en" ? "ltr" : "rtl"}
      >
        {prompt}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((opt, i) => {
          let cls =
            "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
          if (selected !== null) {
            if (i === item.answerIndex) {
              cls =
                "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
            } else if (i === selected) {
              cls =
                "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
            } else {
              cls =
                "border-slate-200 bg-slate-50 text-slate-700 opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
            }
          }
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              disabled={selected !== null}
              className={`rounded-xl border-2 px-3 py-2 text-start font-semibold transition-colors ${cls}`}
              dir="auto"
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && explain && (
        <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
          {explain}
        </p>
      )}
    </div>
  );
}
