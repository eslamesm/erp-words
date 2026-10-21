"use client";

import { useState, type ReactNode } from "react";
import type { BusinessEmailLesson, EmailStyle } from "@/types";
import { wordById } from "@/data/words";
import { speak } from "@/lib/speech";
import { useT } from "@/hooks/useT";
import { ProcessQuiz } from "@/components/processes/ProcessQuiz";
import { EmailGuidedPractice } from "./EmailGuidedPractice";

function Section({ n, title, stage, children }: { n: number; title: string; stage?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-extrabold text-white">
            {n}
          </span>
          {title}
        </h2>
        {stage && (
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            {stage}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function styleCls(style: EmailStyle): string {
  switch (style) {
    case "formal":
      return "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300";
    case "firm":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
}

// يعرض البريد النموذجي مجمّعًا من أجزائه السبعة بلغة واحدة.
function EmailPreview({ lesson, lang }: { lesson: BusinessEmailLesson; lang: "ar" | "en" }) {
  const subject = lesson.blocks.find((b) => b.part === "subject");
  const rest = lesson.blocks.filter((b) => b.part !== "subject");
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
      {subject && (
        <p className="mb-3 border-b border-slate-200 pb-3 font-bold text-slate-900 dark:border-slate-700 dark:text-white">
          <span className="text-slate-400">{lang === "en" ? "Subject: " : "الموضوع: "}</span>
          <span dir={lang === "en" ? "ltr" : "rtl"}>{lang === "en" ? subject.en : subject.ar}</span>
        </p>
      )}
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {rest.map((b) => (
          <p key={b.part} className="whitespace-pre-line" dir={lang === "en" ? "ltr" : "rtl"}>
            {lang === "en" ? b.en : b.ar}
          </p>
        ))}
      </div>
    </div>
  );
}

export function EmailLesson({ lesson }: { lesson: BusinessEmailLesson }) {
  const { t, lang } = useT();
  const [showTranslation, setShowTranslation] = useState(false);
  const [showReference, setShowReference] = useState(false);
  // مساحة كتابة حرة — لا يوجد تقييم آلي للنص.
  const [draft, setDraft] = useState("");

  const title = lang === "en" ? lesson.titleEn : lesson.titleAr;
  const titleAlt = lang === "en" ? lesson.titleAr : lesson.titleEn;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{lesson.icon}</span>
          <div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              {t("email.lessonLabel", { n: lesson.order })}
            </span>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{titleAlt}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            {t("email.level")}: {lesson.level}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {t("email.process")}: {lang === "en" ? lesson.processLabelEn : lesson.processLabelAr}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styleCls(lesson.style)}`}>
            {t(`email.style.${lesson.style}`)}
          </span>
        </div>
      </header>

      {/* شريط التدرّج بين المستويات الثلاثة */}
      <div className="grid gap-2 sm:grid-cols-3">
        {(["learn", "practice", "write"] as const).map((s) => (
          <div
            key={s}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              {t(`email.stage.${s}`)}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t(`email.stage.${s}Desc`)}
            </div>
          </div>
        ))}
      </div>

      {/* 1) سياق العمل */}
      <Section n={1} title={t("email.section.context")} stage={t("email.stage.learn")}>
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          {lang === "en" ? lesson.scenarioEn : lesson.scenarioAr}
        </p>
      </Section>

      {/* 2) أهداف التعلّم */}
      <Section n={2} title={t("email.section.objectives")} stage={t("email.stage.learn")}>
        <ul className="flex flex-col gap-2">
          {(lang === "en" ? lesson.objectivesEn : lesson.objectivesAr).map((o, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">✓</span>
              {o}
            </li>
          ))}
        </ul>
      </Section>

      {/* 3) بنية البريد */}
      <Section n={3} title={t("email.section.structure")} stage={t("email.stage.learn")}>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{t("email.structureIntro")}</p>
        <ul className="flex flex-col gap-3">
          {lesson.blocks.map((b) => (
            <li key={b.part} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  {t(`email.part.${b.part}`)}
                </span>
                <span className="text-[11px] font-bold text-slate-400">{t("email.partPurpose")}</span>
              </div>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                {lang === "en" ? b.purposeEn : b.purposeAr}
              </p>
              <p className="mt-1.5 text-sm font-medium text-slate-800 dark:text-slate-100" dir="ltr">
                {b.en}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* 4) البريد النموذجي */}
      <Section n={4} title={t("email.section.model")} stage={t("email.stage.learn")}>
        <EmailPreview lesson={lesson} lang="en" />
      </Section>

      {/* 5) الترجمة العربية */}
      <Section n={5} title={t("email.section.translation")} stage={t("email.stage.learn")}>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{t("email.translationHint")}</p>
        <button
          onClick={() => setShowTranslation((v) => !v)}
          className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {showTranslation ? t("email.hideTranslation") : t("email.showTranslation")}
        </button>
        {showTranslation && (
          <div className="mt-3">
            <EmailPreview lesson={lesson} lang="ar" />
          </div>
        )}
      </Section>

      {/* 6) التعبيرات الأساسية */}
      <Section n={6} title={t("email.section.expressions")}>
        <ul className="grid gap-3 sm:grid-cols-2">
          {lesson.expressions.map((e) => {
            const linked = e.wordId ? wordById(e.wordId) : undefined;
            return (
              <li
                key={e.id}
                className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white" dir="ltr">
                    {e.en}
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${styleCls(e.style)}`}>
                    {t(`email.style.${e.style}`)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">{e.ar}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {lang === "en" ? e.explainEn : e.explainAr}
                </p>
                {linked && (
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    <span dir="ltr">{linked.english}</span> · {linked.arabic}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      {/* 7) مفردات ERP */}
      <Section n={7} title={t("email.section.vocabulary")}>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{t("email.vocabNote")}</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {lesson.wordIds.map((id) => {
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
                <button
                  onClick={() => speak(w.english)}
                  className="mt-2 rounded-full border border-slate-300 px-2 py-0.5 text-[11px] text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  🔊
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* 8) تدريب موجّه */}
      <Section n={8} title={t("email.section.guided")} stage={t("email.stage.practice")}>
        <EmailGuidedPractice guided={lesson.guided} />
      </Section>

      {/* 9) تحدّي الكتابة */}
      <Section n={9} title={t("email.section.writing")} stage={t("email.stage.write")}>
        <h3 className="font-bold text-slate-900 dark:text-white">{t("email.writingTaskTitle")}</h3>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
          {lang === "en" ? lesson.writingTaskEn : lesson.writingTaskAr}
        </p>

        <h4 className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400">
          {t("email.writingChecklist")}
        </h4>
        <ul className="mt-2 flex flex-col gap-1.5">
          {(lang === "en" ? lesson.checklistEn : lesson.checklistAr).map((c, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="text-slate-400">☐</span>
              {c}
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <label
            htmlFor="email-draft"
            className="mb-1.5 block text-sm font-bold text-slate-500 dark:text-slate-400"
          >
            {t("email.writeAreaLabel")}
          </label>
          <textarea
            id="email-draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={8}
            dir="ltr"
            placeholder={t("email.writeAreaPlaceholder")}
            className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {t("email.selfAssessNote")}
        </p>

        <button
          onClick={() => setShowReference((v) => !v)}
          className="mt-4 rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {showReference ? t("email.hideReference") : t("email.showReference")}
        </button>
        {showReference && (
          <div className="mt-3">
            <div className="mb-2 text-sm font-bold text-slate-500 dark:text-slate-400">
              {t("email.referenceAnswerTitle")}
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
              {lang === "en" ? lesson.referenceAnswerEn : lesson.referenceAnswerAr}
            </pre>
          </div>
        )}
      </Section>

      {/* 10) اختبار المعرفة */}
      <Section n={10} title={t("email.section.quiz")}>
        <ProcessQuiz questions={lesson.quiz} />
      </Section>
    </div>
  );
}
