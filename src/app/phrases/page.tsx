"use client";

import { useState } from "react";
import { PROCESS_PACKS, ABBREVIATIONS, COLLOCATIONS, EMAIL_TEMPLATES } from "@/data/phrases";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";
import { speak } from "@/lib/speech";

type Tab = "packs" | "abbr" | "colloc" | "email";

export default function PhrasesPage() {
  const { t } = useT();
  const { settings } = useProgress();
  const rate = settings?.voiceRate ?? 0.95;
  const [tab, setTab] = useState<Tab>("packs");

  const TABS: { id: Tab; label: string }[] = [
    { id: "packs", label: t("phrases.tabPacks") },
    { id: "abbr", label: t("phrases.tabAbbr") },
    { id: "colloc", label: t("phrases.tabColloc") },
    { id: "email", label: t("phrases.tabEmail") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("phrases.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("phrases.subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((x) => (
          <button
            key={x.id}
            onClick={() => setTab(x.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === x.id
                ? "bg-emerald-600 text-white"
                : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {tab === "packs" && (
        <div className="grid grid-cols-1 gap-4">
          {PROCESS_PACKS.map((p) => (
            <section
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl">{p.icon}</span>
                <h2 className="text-lg font-bold">
                  {p.titleEn} <span className="text-slate-400">·</span>{" "}
                  <span className="text-emerald-700 dark:text-emerald-300">{p.titleAr}</span>
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {p.code}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.descAr}</p>
              <ol className="mt-4 flex flex-col gap-2">
                {p.steps.map((s, i) => (
                  <li
                    key={s.en}
                    className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                      {i + 1}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm text-slate-700 dark:text-slate-200" dir="ltr">
                        {s.en}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{s.ar}</span>
                    </span>
                    <button
                      onClick={() => speak(s.en, { rate })}
                      className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      title={t("phrases.listen")}
                    >
                      🔊
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      {tab === "abbr" && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ABBREVIATIONS.map((a) => (
            <div
              key={a.abbr}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                {a.abbr}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm text-slate-700 dark:text-slate-200" dir="ltr">
                  {a.en}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{a.ar}</span>
              </span>
              <button
                onClick={() => speak(a.abbr, { rate })}
                className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                🔊
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "colloc" && (
        <div className="flex flex-col gap-2">
          {COLLOCATIONS.map((c) => (
            <div
              key={c.en}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200" dir="ltr">
                  {c.en}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{c.ar}</span>
              </span>
              <button
                onClick={() => speak(c.en, { rate })}
                className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                🔊
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "email" && (
        <div className="grid grid-cols-1 gap-4">
          {EMAIL_TEMPLATES.map((m) => (
            <section
              key={m.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl">{m.icon}</span>
                <h2 className="text-lg font-bold">
                  {m.titleEn} <span className="text-slate-400">·</span>{" "}
                  <span className="text-emerald-700 dark:text-emerald-300">{m.titleAr}</span>
                </h2>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-400">{t("phrases.subject")}</p>
              <div className="flex items-center gap-2">
                <p className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200" dir="ltr">
                  {m.subjectEn}
                </p>
                <button
                  onClick={() => speak(m.subjectEn, { rate })}
                  className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  🔊
                </button>
              </div>
              <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700 dark:bg-slate-800 dark:text-slate-200" dir="ltr">
                {m.bodyEn}
              </p>
              <p className="mt-2 whitespace-pre-line rounded-lg bg-emerald-50 p-3 text-sm leading-6 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                {m.bodyAr}
              </p>
              <ul className="mt-3 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                {m.tipsAr.map((tip) => (
                  <li key={tip}>• {tip}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
