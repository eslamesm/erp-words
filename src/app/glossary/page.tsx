"use client";

import { useMemo, useState } from "react";
import { GLOSSARY_PACKS } from "@/data/glossaries";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";
import { speak } from "@/lib/speech";

export default function GlossaryPage() {
  const { t, lang } = useT();
  const { settings } = useProgress();
  const rate = settings?.voiceRate ?? 0.95;
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");

  const packs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = active === "all" ? GLOSSARY_PACKS : GLOSSARY_PACKS.filter((p) => p.id === active);
    return pool
      .map((p) => ({
        ...p,
        terms: q
          ? p.terms.filter(
              (term) =>
                term.en.toLowerCase().includes(q) ||
                term.ar.includes(q) ||
                (term.note ?? "").toLowerCase().includes(q),
            )
          : p.terms,
      }))
      .filter((p) => p.terms.length > 0);
  }, [active, query]);

  const total = packs.reduce((sum, p) => sum + p.terms.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("glossary.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("glossary.subtitle")}</p>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("glossary.search")}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActive("all")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            active === "all"
              ? "bg-emerald-600 text-white"
              : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {t("glossary.all")}
        </button>
        {GLOSSARY_PACKS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active === p.id
                ? "bg-emerald-600 text-white"
                : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <span>{p.icon}</span>
            {lang === "en" ? p.titleEn : p.titleAr}
          </button>
        ))}
      </div>

      {total === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t("glossary.empty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {packs.map((p) => (
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
                  {p.terms.length} {t("glossary.terms")}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {lang === "en" ? p.descEn : p.descAr}
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {p.terms.map((term) => (
                  <li
                    key={`${p.id}-${term.en}`}
                    className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span
                          className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                          dir="ltr"
                        >
                          {term.en}
                        </span>
                        <span className="text-sm text-emerald-700 dark:text-emerald-300">
                          {term.ar}
                        </span>
                      </span>
                      <button
                        onClick={() => speak(term.en.replace(/\.$/, ""), { rate })}
                        className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                        title={t("glossary.listen")}
                      >
                        🔊
                      </button>
                    </div>
                    {term.note && (
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {term.note}
                      </p>
                    )}
                    {term.exampleEn && (
                      <div className="mt-2 rounded-md border-s-2 border-emerald-400 bg-white p-2 dark:bg-slate-900">
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                          {t("glossary.example")}
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-200" dir="ltr">
                          {term.exampleEn}
                        </p>
                        {term.exampleAr && (
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {term.exampleAr}
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
