"use client";

import { useState } from "react";
import { CAREER_PATHS_ALL, type CareerPath, type InterviewType } from "@/data/careerPaths";
import { useT } from "@/hooks/useT";

const TYPE_META: Record<InterviewType, { key: string; icon: string }> = {
  hr: { key: "paths.hr", icon: "🧑‍💼" },
  technical: { key: "paths.technical", icon: "⚙️" },
  behavioral: { key: "paths.behavioral", icon: "🧩" },
};

function List({ onOpen }: { onOpen: (p: CareerPath) => void }) {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("paths.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("paths.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CAREER_PATHS_ALL.map((p) => (
          <button
            key={p.id}
            onClick={() => onOpen(p)}
            className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-start shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{p.icon}</span>
              <span className="font-bold text-slate-900 dark:text-white">{p.title}</span>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">{p.summary}</span>
            <span className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {p.interview.length} {t("paths.interview")} · {p.scenarios.length} {t("paths.scenarios")} ←
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Detail({ path, onBack }: { path: CareerPath; onBack: () => void }) {
  const { t } = useT();
  const [open, setOpen] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const grouped: Record<InterviewType, { q: (typeof path.interview)[number]; i: number }[]> = {
    hr: [],
    technical: [],
    behavioral: [],
  };
  path.interview.forEach((q, i) => grouped[q.type].push({ q, i }));

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="self-start rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        ← {t("paths.back")}
      </button>

      <div className="flex items-center gap-3">
        <span className="text-4xl">{path.icon}</span>
        <h1 className="text-3xl font-bold">{path.title}</h1>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-bold">{t("paths.overview")}</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{path.summary}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-bold">{t("paths.responsibilities")}</h2>
        <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-300">
          {path.responsibilities.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="text-emerald-500">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-bold">{t("paths.skills")}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {path.skills.map((s) => (
            <span key={s} className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              {s}
            </span>
          ))}
        </div>
        <h3 className="mt-4 font-bold">{t("paths.tools")}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {path.tools.map((s) => (
            <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {s}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-bold">{t("paths.interview")}</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{t("paths.practiceDesc")}</p>
        <div className="flex flex-col gap-5">
          {(["hr", "technical", "behavioral"] as InterviewType[]).map((type) =>
            grouped[type].length === 0 ? null : (
              <div key={type}>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <span>{TYPE_META[type].icon}</span>
                  {t(TYPE_META[type].key)}
                </h3>
                <div className="flex flex-col gap-3">
                  {grouped[type].map(({ q, i }) => {
                    const id = `${path.id}:${i}`;
                    const isOpen = open.has(id);
                    return (
                      <div key={id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="font-semibold text-slate-900 dark:text-white">{q.q}</div>
                        {isOpen ? (
                          <>
                            <p className="mt-2 text-slate-600 dark:text-slate-300">{q.a}</p>
                            <button
                              onClick={() => toggle(id)}
                              className="mt-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                            >
                              {t("paths.hide")}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => toggle(id)}
                            className="mt-3 rounded-xl border border-emerald-300 px-4 py-1.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                          >
                            {t("paths.reveal")}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-bold">{t("paths.scenarios")}</h2>
        <div className="flex flex-col gap-4">
          {path.scenarios.map((s) => (
            <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="font-bold text-slate-900 dark:text-white">{s.title}</div>
              <div className="mt-2">
                <span className="text-xs font-bold uppercase text-slate-400">{t("paths.situation")}</span>
                <p className="text-slate-600 dark:text-slate-300">{s.situation}</p>
              </div>
              <div className="mt-3">
                <span className="text-xs font-bold uppercase text-slate-400">{t("paths.steps")}</span>
                <ol className="mt-1 space-y-1 text-slate-600 dark:text-slate-300">
                  {s.steps.map((step, idx) => (
                    <li key={step} className="flex gap-2">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function PathsPage() {
  const [selected, setSelected] = useState<CareerPath | null>(null);
  if (selected) return <Detail path={selected} onBack={() => setSelected(null)} />;
  return <List onOpen={setSelected} />;
}
