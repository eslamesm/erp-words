"use client";

import { useState, type ReactNode } from "react";
import type { BusinessProcess, ProcessPathOutcome } from "@/types";
import { MODULE_MAP } from "@/data/modules";
import { BUSINESS_FUNCTION_MAP } from "@/data/businessFunctions";
import { wordById } from "@/data/words";
import { useT } from "@/hooks/useT";
import { ProcessFlowDiagram } from "./ProcessFlowDiagram";
import { ProcessQuiz } from "./ProcessQuiz";

function Section({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-extrabold text-white">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function outcomeCls(outcome: ProcessPathOutcome): string {
  switch (outcome) {
    case "approved":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "rejected":
      return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";
    case "partial":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case "exception":
      return "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
}

export function ProcessLesson({ process }: { process: BusinessProcess }) {
  const { t, lang } = useT();
  const [showSolution, setShowSolution] = useState(false);

  const steps = process.steps ?? [];
  const wordIds = Array.from(new Set(steps.flatMap((s) => s.wordIds ?? [])));
  const screenIds = Array.from(new Set(steps.flatMap((s) => s.screenIds ?? [])));

  return (
    <div className="flex flex-col gap-5">
      <header>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{process.icon}</span>
          <div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              {process.acronym}
            </span>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {lang === "en" ? process.titleEn : process.titleAr}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {lang === "en" ? process.titleAr : process.titleEn}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {process.moduleIds.map((id) => {
            const m = MODULE_MAP[id];
            if (!m) return null;
            return (
              <span
                key={id}
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${m.color}`}
              >
                {m.icon} {lang === "en" ? m.labelEn : m.labelAr}
              </span>
            );
          })}
        </div>
      </header>

      {/* 1) سيناريو العمل */}
      <Section n={1} title={t("process.section.scenario")}>
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          {lang === "en" ? process.scenarioEn : process.scenarioAr}
        </p>
      </Section>

      {/* 2) خطوات العملية */}
      <Section n={2} title={t("process.section.steps")}>
        <ProcessFlowDiagram steps={steps} acronym={process.acronym} titleEn={process.titleEn} />
        <ol className="mt-6 flex flex-col gap-3">
          {steps.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {s.order}. {lang === "en" ? s.titleEn : s.titleAr}
                </h3>
                <span className="shrink-0 text-xs font-semibold text-slate-400">
                  {MODULE_MAP[s.moduleId]?.icon} {lang === "en" ? MODULE_MAP[s.moduleId]?.labelEn : MODULE_MAP[s.moduleId]?.labelAr}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {lang === "en" ? s.descEn : s.descAr}
              </p>

              {(s.roleEn || s.inputEn || s.outputEn || s.decisionEn) && (
                <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      { label: t("process.step.role"), ar: s.roleAr, en: s.roleEn },
                      { label: t("process.step.input"), ar: s.inputAr, en: s.inputEn },
                      { label: t("process.step.output"), ar: s.outputAr, en: s.outputEn },
                      { label: t("process.step.decision"), ar: s.decisionAr, en: s.decisionEn },
                    ] as { label: string; ar?: string; en?: string }[]
                  )
                    .filter((r) => r.ar || r.en)
                    .map((r) => (
                      <div
                        key={r.label}
                        className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60"
                      >
                        <dt className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {r.label}
                        </dt>
                        <dd className="mt-0.5 text-sm text-slate-700 dark:text-slate-200">
                          {lang === "en" ? r.en : r.ar}
                        </dd>
                      </div>
                    ))}
                </dl>
              )}

              {s.paths && s.paths.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {t("process.paths")}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {s.paths.map((path, pi) => (
                      <div key={pi} className="flex flex-wrap items-start gap-2 text-xs">
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 font-bold ${outcomeCls(path.outcome)}`}
                        >
                          {t(`process.outcome.${path.outcome}`)}
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {lang === "en" ? path.labelEn : path.labelAr}
                        </span>
                        <span className="w-full text-slate-500 dark:text-slate-400 sm:w-auto">
                          {lang === "en" ? path.descEn : path.descAr}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {s.businessFunctionIds && s.businessFunctionIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.businessFunctionIds.map((bf) => {
                    const fn = BUSINESS_FUNCTION_MAP[bf];
                    if (!fn) return null;
                    return (
                      <span
                        key={bf}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        ⚙︎ {lang === "en" ? fn.labelEn : fn.labelAr}
                      </span>
                    );
                  })}
                </div>
              )}
            </li>
          ))}
        </ol>
      </Section>

      {/* 3) المصطلحات */}
      <Section n={3} title={t("process.section.vocabulary")}>
        <ul className="grid gap-3 sm:grid-cols-2">
          {wordIds.map((id) => {
            const w = wordById(id);
            if (!w) return null;
            return (
              <li
                key={id}
                className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white" dir="ltr">
                    {w.english}
                  </span>
                  <span className="text-sm text-emerald-700 dark:text-emerald-300">{w.arabic}</span>
                </div>
                {(w.definitionEn || w.definitionAr) && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {lang === "en" ? w.definitionEn : w.definitionAr}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      {/* 4) الشاشات والحقول */}
      <Section n={4} title={t("process.section.screens")}>
        {screenIds.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("process.noneScreens")}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {screenIds.map((id) => {
              const w = wordById(id);
              if (!w) return null;
              return (
                <li
                  key={id}
                  className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white" dir="ltr">
                      {w.english}
                    </span>
                    <span className="text-sm text-emerald-700 dark:text-emerald-300">{w.arabic}</span>
                  </div>
                  {w.category && (
                    <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {t(`process.cat.${w.category}`)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* 5) حوارات العمل */}
      <Section n={5} title={t("process.section.conversations")}>
        <div className="flex flex-col gap-5">
          {(process.conversations ?? []).map((c) => (
            <div key={c.id}>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {lang === "en" ? c.titleEn : c.titleAr}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === "en" ? c.participantsEn : c.participantsAr}
              </p>
              {c.wordIds && c.wordIds.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {t("process.convTerms")}:
                  </span>
                  {c.wordIds.map((id) => {
                    const w = wordById(id);
                    if (!w) return null;
                    return (
                      <span
                        key={id}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <span dir="ltr">{w.english}</span>
                        <span className="text-emerald-700 dark:text-emerald-300"> · {w.arabic}</span>
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="mt-2 flex flex-col gap-2">
                {c.lines.map((line, i) => (
                  <div
                    key={i}
                    className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                      line.speaker === "A"
                        ? "self-start bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        : "self-end bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                    }`}
                  >
                    <p className="font-medium" dir="ltr">
                      {line.en}
                    </p>
                    <p className="mt-0.5 text-xs opacity-80" dir="rtl">
                      {line.ar}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 6) المستندات */}
      <Section n={6} title={t("process.section.documents")}>
        <ul className="flex flex-col gap-3">
          {(process.documents ?? []).map((d) => (
            <li
              key={d.id}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800"
            >
              <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-extrabold text-white dark:bg-white dark:text-slate-900">
                {d.abbr}
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {lang === "en" ? d.nameEn : d.nameAr}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400" dir="ltr">
                    {lang === "en" ? d.nameAr : d.nameEn}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {lang === "en" ? d.descEn : d.descAr}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* 7) تمرين عملي */}
      {process.exercise && (
        <Section n={7} title={t("process.section.exercise")}>
          <h3 className="font-bold text-slate-900 dark:text-white">
            {lang === "en" ? process.exercise.titleEn : process.exercise.titleAr}
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {lang === "en" ? process.exercise.briefEn : process.exercise.briefAr}
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {(lang === "en" ? process.exercise.tasksEn : process.exercise.tasksAr).map((task, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{i + 1}.</span>
                {task}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowSolution((v) => !v)}
            className="mt-4 rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {showSolution ? t("process.hideSolution") : t("process.showSolution")}
          </button>
          {showSolution && (
            <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
              {lang === "en" ? process.exercise.solutionEn : process.exercise.solutionAr}
            </p>
          )}
        </Section>
      )}

      {/* 8) اختبار الفهم */}
      {process.quiz && process.quiz.length > 0 && (
        <Section n={8} title={t("process.section.quiz")}>
          <ProcessQuiz questions={process.quiz} />
        </Section>
      )}
    </div>
  );
}
