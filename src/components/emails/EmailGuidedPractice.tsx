"use client";

import { useState } from "react";
import type { EmailGuidedPractice as GuidedData, EmailPart } from "@/types";
import { useT } from "@/hooks/useT";

const CANONICAL: EmailPart[] = [
  "subject",
  "greeting",
  "opening",
  "body",
  "action",
  "closing",
  "signature",
];

// ترتيب ابتدائي ثابت (يفادي اختلاف العرض بين الخادم والعميل).
const INITIAL_ORDER: EmailPart[] = [
  "body",
  "signature",
  "greeting",
  "action",
  "subject",
  "closing",
  "opening",
];

function FillBlank({
  item,
  index,
  total,
}: {
  item: GuidedData["fillBlanks"][number];
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
      <p className="font-semibold text-slate-800 dark:text-slate-100" dir="ltr">
        {prompt}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((opt, i) => {
          let cls =
            "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
          if (selected !== null) {
            if (i === item.answerIndex) {
              cls = "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
            } else if (i === selected) {
              cls = "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
            } else {
              cls = "border-slate-200 bg-slate-50 text-slate-700 opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
            }
          }
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              disabled={selected !== null}
              className={`rounded-xl border-2 px-3 py-2 text-start font-semibold transition-colors ${cls}`}
              dir="ltr"
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

function ChooseExpression({
  item,
  index,
  total,
}: {
  item: GuidedData["choose"][number];
  index: number;
  total: number;
}) {
  const { lang } = useT();
  const [selected, setSelected] = useState<number | null>(null);
  const scenario = lang === "en" ? item.scenarioEn : item.scenarioAr;
  const options = lang === "en" ? item.optionsEn : item.optionsAr;
  const explain = lang === "en" ? item.explainEn : item.explainAr;

  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="mb-2 text-xs font-bold text-slate-400">
        {index + 1}/{total}
      </div>
      <p className="font-semibold text-slate-800 dark:text-slate-100">{scenario}</p>
      <div className="mt-3 grid gap-2">
        {options.map((opt, i) => {
          let cls =
            "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
          if (selected !== null) {
            if (i === item.answerIndex) {
              cls = "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
            } else if (i === selected) {
              cls = "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
            } else {
              cls = "border-slate-200 bg-slate-50 text-slate-700 opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
            }
          }
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              disabled={selected !== null}
              className={`rounded-xl border-2 px-3 py-2 text-start font-semibold transition-colors ${cls}`}
              dir="ltr"
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

function ArrangeSections() {
  const { t } = useT();
  const [order, setOrder] = useState<EmailPart[]>(INITIAL_ORDER);
  const [checked, setChecked] = useState(false);

  const isCorrect = order.every((p, i) => p === CANONICAL[i]);

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
      <p className="font-semibold text-slate-800 dark:text-slate-100">{t("email.arrangePrompt")}</p>
      <ol className="mt-3 flex flex-col gap-2">
        {order.map((part, i) => (
          <li
            key={part}
            className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60"
          >
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {i + 1}. {t(`email.part.${part}`)}
            </span>
            <span className="flex shrink-0 gap-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={t("email.moveUp")}
                className="rounded-lg border border-slate-300 px-2 py-0.5 text-xs text-slate-600 disabled:opacity-30 dark:border-slate-600 dark:text-slate-300"
              >
                ↑
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === order.length - 1}
                aria-label={t("email.moveDown")}
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
          {t("email.checkOrder")}
        </button>
        <button
          onClick={() => {
            setOrder(INITIAL_ORDER);
            setChecked(false);
          }}
          aria-label={t("email.resetOrder")}
          className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          ↻ {t("email.resetOrder")}
        </button>
      </div>
      {checked && (
        <p
          className={`mt-2 text-sm font-semibold ${
            isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {isCorrect ? t("email.correctOrder") : t("email.wrongOrder")}
        </p>
      )}
    </div>
  );
}

export function EmailGuidedPractice({ guided }: { guided: GuidedData }) {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 font-bold text-slate-900 dark:text-white">{t("email.guidedFill")}</h3>
        <div className="flex flex-col gap-3">
          {guided.fillBlanks.map((item, i) => (
            <FillBlank key={item.id} item={item} index={i} total={guided.fillBlanks.length} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-bold text-slate-900 dark:text-white">{t("email.guidedArrange")}</h3>
        <ArrangeSections />
      </div>

      <div>
        <h3 className="mb-3 font-bold text-slate-900 dark:text-white">{t("email.guidedChoose")}</h3>
        <div className="flex flex-col gap-3">
          {guided.choose.map((item, i) => (
            <ChooseExpression key={item.id} item={item} index={i} total={guided.choose.length} />
          ))}
        </div>
      </div>
    </div>
  );
}
