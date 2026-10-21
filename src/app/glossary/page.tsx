"use client";

import { useMemo, useState } from "react";
import type { Level, ModuleId, VocabularyCategory, Word } from "@/types";
import { GLOSSARY_PACKS } from "@/data/glossaries";
import { MODULES, MODULE_MAP } from "@/data/modules";
import { SUB_MODULES, SUB_MODULE_MAP, subModulesByModule } from "@/data/subModules";
import { VOCABULARY_CATEGORIES, categoryLabel } from "@/data/vocabularyCategories";
import { WORDS } from "@/data/words";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";
import { speak } from "@/lib/speech";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

export default function GlossaryPage() {
  const { t, lang } = useT();
  const { settings } = useProgress();
  const rate = settings?.voiceRate ?? 0.95;
  const [view, setView] = useState<"modules" | "packs">("modules");

  const [module, setModule] = useState<ModuleId | "all">("all");
  const [subModule, setSubModule] = useState<string | "all">("all");
  const [category, setCategory] = useState<VocabularyCategory | "all">("all");
  const [level, setLevel] = useState<Level | "all">("all");
  const [query, setQuery] = useState("");

  const subOptions = useMemo(
    () => (module === "all" ? SUB_MODULES : subModulesByModule(module)),
    [module],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WORDS.filter((w) => {
      if (module !== "all" && w.module !== module) return false;
      if (subModule !== "all" && w.subModuleId !== subModule) return false;
      if (category !== "all" && w.category !== category) return false;
      if (level !== "all" && w.level !== level) return false;
      if (q) {
        const text = `${w.english} ${w.arabic} ${w.definitionEn ?? ""} ${w.definitionAr ?? ""}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [module, subModule, category, level, query]);

  const grouped = useMemo(() => {
    const map = new Map<ModuleId, Map<string, Word[]>>();
    for (const w of filtered) {
      const sub = w.subModuleId ?? "unassigned";
      if (!map.has(w.module)) map.set(w.module, new Map());
      const subs = map.get(w.module)!;
      if (!subs.has(sub)) subs.set(sub, []);
      subs.get(sub)!.push(w);
    }
    return map;
  }, [filtered]);

  function pickModule(id: ModuleId | "all") {
    setModule(id);
    setSubModule("all");
  }

  const selectClass =
    "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("glossary.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("glossary.subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setView("modules")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            view === "modules"
              ? "bg-emerald-600 text-white"
              : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          🧩 {t("glossary.module")}
        </button>
        <button
          onClick={() => setView("packs")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            view === "packs"
              ? "bg-emerald-600 text-white"
              : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          🗂️ {t("glossary.terms")}
        </button>
      </div>

      {view === "modules" ? (
        <>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("glossary.search")}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />

          <div className="flex flex-wrap items-center gap-2">
            <select value={module} onChange={(e) => pickModule(e.target.value as ModuleId | "all")} className={selectClass}>
              <option value="all">{t("glossary.allModules")}</option>
              {MODULES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.icon} {lang === "en" ? m.labelEn : m.labelAr}
                </option>
              ))}
            </select>

            <select
              value={subModule}
              onChange={(e) => setSubModule(e.target.value)}
              className={selectClass}
              disabled={subOptions.length === 0}
            >
              <option value="all">{t("glossary.submodule")}</option>
              {subOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === "en" ? s.labelEn : s.labelAr}
                </option>
              ))}
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as VocabularyCategory | "all")}
              className={selectClass}
            >
              <option value="all">{t("glossary.allCategories")}</option>
              {VOCABULARY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {lang === "en" ? c.labelEn : c.labelAr}
                </option>
              ))}
            </select>

            <select value={level} onChange={(e) => setLevel(e.target.value as Level | "all")} className={selectClass}>
              <option value="all">{t("glossary.allCategories")} · CEFR</option>
              {LEVELS.map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {filtered.length} {t("glossary.results")}
            </span>
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              {t("glossary.empty")}
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {[...grouped.entries()].map(([mod, subs]) => {
                const meta = MODULE_MAP[mod];
                const modCount = [...subs.values()].reduce((s, l) => s + l.length, 0);
                return (
                  <section key={mod} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-2xl">{meta?.icon ?? "📦"}</span>
                      <h2 className="text-lg font-bold">
                        {lang === "en" ? meta?.labelEn : meta?.labelAr}
                      </h2>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {modCount} {t("glossary.terms")}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col gap-4">
                      {[...subs.entries()].map(([sub, list]) => {
                        const sm = SUB_MODULE_MAP[sub];
                        return (
                          <div key={sub}>
                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {sm ? (lang === "en" ? sm.labelEn : sm.labelAr) : sub}
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold dark:bg-slate-800">
                                {list.length}
                              </span>
                            </div>
                            <ul className="flex flex-col gap-3">
                              {list.map((term) => (
                                <li key={term.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                                  <div className="flex items-start gap-3">
                                    <span className="flex min-w-0 flex-1 flex-col">
                                      <span className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100" dir="ltr">
                                          {term.english}
                                        </span>
                                        {term.category && (
                                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                            {categoryLabel(term.category, lang)}
                                          </span>
                                        )}
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                          {term.level}
                                        </span>
                                      </span>
                                      <span className="text-sm text-emerald-700 dark:text-emerald-300">{term.arabic}</span>
                                    </span>
                                    <button
                                      onClick={() => speak(term.english, { rate })}
                                      className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                      title={t("glossary.listen")}
                                    >
                                      🔊
                                    </button>
                                  </div>
                                  {term.definitionAr && (
                                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{term.definitionAr}</p>
                                  )}
                                  {term.definitionEn && (
                                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500" dir="ltr">
                                      {term.definitionEn}
                                    </p>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <PacksView query={query} setQuery={setQuery} rate={rate} />
      )}
    </div>
  );
}

function PacksView({
  query,
  setQuery,
  rate,
}: {
  query: string;
  setQuery: (v: string) => void;
  rate: number;
}) {
  const { t, lang } = useT();
  const [active, setActive] = useState<string>("all");

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
    <>
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
                  <li key={`${p.id}-${term.en}`} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <div className="flex items-start gap-3">
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100" dir="ltr">
                          {term.en}
                        </span>
                        <span className="text-sm text-emerald-700 dark:text-emerald-300">{term.ar}</span>
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
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{term.note}</p>
                    )}
                    {term.exampleEn && (
                      <div className="mt-2 rounded-md border-s-2 border-emerald-400 bg-white p-2 dark:bg-slate-900">
                        <p className="text-[10px] font-bold uppercase text-slate-400">{t("glossary.example")}</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200" dir="ltr">
                          {term.exampleEn}
                        </p>
                        {term.exampleAr && (
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{term.exampleAr}</p>
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
    </>
  );
}
