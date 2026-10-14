"use client";

import { useState } from "react";
import { CAREER_PATHS_ALL, type CareerPath, type InterviewType } from "@/data/careerPaths";
import { useT } from "@/hooks/useT";
import { BiText } from "@/components/BiText";

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
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{t("paths.dblHint")}</p>
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
        <BiText
          en={path.title}
          ar={path.titleAr}
          className="text-3xl font-bold"
          arClassName="mt-1 text-lg font-normal text-emerald-700 dark:text-emerald-300"
        />
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500">{t("paths.dblHint")}</p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-bold">{t("paths.overview")}</h2>
        <BiText
          en={path.summary}
          ar={path.summaryAr}
          className="mt-2 block text-slate-600 dark:text-slate-300"
          arClassName="mt-2 text-emerald-700 dark:text-emerald-300"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-bold">{t("paths.responsibilities")}</h2>
        <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-300">
          {path.responsibilities.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-emerald-500">•</span>
              <BiText en={r} ar={path.responsibilitiesAr[i]} arClassName="mt-0.5 text-emerald-700 dark:text-emerald-300" />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-bold">{t("paths.skills")}</h2>
        <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-300">
          {path.skills.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-emerald-500">•</span>
              <BiText en={s} ar={path.skillsAr[i]} arClassName="mt-0.5 text-emerald-700 dark:text-emerald-300" />
            </li>
          ))}
        </ul>
        <h3 className="mt-4 font-bold">{t("paths.tools")}</h3>
        <ul className="mt-2 space-y-2 text-slate-600 dark:text-slate-300">
          {path.tools.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-slate-400">•</span>
              <BiText en={s} ar={path.toolsAr[i]} arClassName="mt-0.5 text-emerald-700 dark:text-emerald-300" />
            </li>
          ))}
        </ul>
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
                  {grouped[type].map(({ q, i }) => (
                    <div
                      key={`${path.id}:${i}`}
                      className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <BiText
                        en={q.q}
                        ar={q.qAr}
                        className="block font-semibold text-slate-900 dark:text-white"
                        arClassName="mt-1 text-emerald-700 dark:text-emerald-300"
                      />
                      <BiText
                        en={q.a}
                        ar={q.aAr}
                        className="mt-2 block text-slate-600 dark:text-slate-300"
                        arClassName="mt-1 text-emerald-700 dark:text-emerald-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-bold">{t("paths.scenarios")}</h2>
        <div className="flex flex-col gap-3">
          {path.scenarios.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <BiText
                en={s.title}
                ar={s.titleAr}
                className="block font-bold text-slate-900 dark:text-white"
                arClassName="mt-1 text-emerald-700 dark:text-emerald-300"
              />
              <div className="mt-3">
                <span className="text-xs font-bold uppercase text-slate-400">{t("paths.situation")}</span>
                <BiText
                  en={s.situation}
                  ar={s.situationAr}
                  className="mt-1 block text-slate-600 dark:text-slate-300"
                  arClassName="mt-1 text-emerald-700 dark:text-emerald-300"
                />
              </div>
              <div className="mt-3">
                <span className="text-xs font-bold uppercase text-slate-400">{t("paths.steps")}</span>
                <ol className="mt-1 space-y-1 text-slate-600 dark:text-slate-300">
                  {s.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{idx + 1}.</span>
                      <BiText
                        en={step}
                        ar={s.stepsAr[idx]}
                        arClassName="mt-0.5 text-emerald-700 dark:text-emerald-300"
                      />
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
