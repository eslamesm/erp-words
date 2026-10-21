"use client";

import { useState, type ReactNode } from "react";
import type { MeetingFunction, MeetingLesson as Lesson } from "@/types";
import { wordById } from "@/data/words";
import { speak } from "@/lib/speech";
import { useT } from "@/hooks/useT";
import { ProcessQuiz } from "@/components/processes/ProcessQuiz";
import {
  PronunciationTrainer,
  type PronounceItem,
} from "@/components/PronunciationTrainer";
import { MeetingDialogue } from "./MeetingDialogue";
import { MeetingGuidedPractice } from "./MeetingGuidedPractice";
import { McqCard } from "@/components/practice/McqCard";

function Section({
  n,
  title,
  stage,
  children,
}: {
  n: number;
  title: string;
  stage?: string;
  children: ReactNode;
}) {
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

function fnCls(fn: MeetingFunction): string {
  switch (fn) {
    case "agree":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "disagree":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
    case "clarify":
      return "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300";
    case "action":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    case "update":
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300";
    case "closing":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300";
    case "turn-taking":
      return "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
}

// مراجع ثابتة الهوية حتى لا تعيد المدرّب بناء تأثيراته في كل رسم.
const noopResult = () => {};
const noopFinish = () => {};

export function MeetingLesson({ lesson }: { lesson: Lesson }) {
  const { t, lang } = useT();
  const [showTranslation, setShowTranslation] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [draft, setDraft] = useState("");

  const title = lang === "en" ? lesson.titleEn : lesson.titleAr;
  const titleAlt = lang === "en" ? lesson.titleAr : lesson.titleEn;

  const pronounceItems: PronounceItem[] = lesson.speaking.map((s) => ({
    id: s.id,
    text: s.en,
    translation: s.ar,
    hint: lang === "en" ? s.tipEn : s.tipAr,
  }));

  return (
    <div className="flex flex-col gap-5">
      <header>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{lesson.icon}</span>
          <div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              {t("mtg.lessonLabel", { n: lesson.order })}
            </span>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{titleAlt}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            {t("mtg.level")}: {lesson.level}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {t("mtg.process")}:{" "}
            {lang === "en" ? lesson.processLabelEn : lesson.processLabelAr}
          </span>
        </div>
      </header>

      {/* شريط المراحل الثلاث */}
      <div className="grid gap-2 sm:grid-cols-3">
        {(["learn", "practice", "challenge"] as const).map((s) => (
          <div
            key={s}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              {t(`mtg.stage.${s}`)}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t(`mtg.stage.${s}Desc`)}
            </div>
          </div>
        ))}
      </div>

      {/* 1) سياق العمل */}
      <Section n={1} title={t("mtg.section.context")} stage={t("mtg.stage.learn")}>
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          {lang === "en" ? lesson.scenarioEn : lesson.scenarioAr}
        </p>
      </Section>

      {/* 2) أهداف التعلّم */}
      <Section n={2} title={t("mtg.section.objectives")} stage={t("mtg.stage.learn")}>
        <ul className="flex flex-col gap-2">
          {(lang === "en" ? lesson.objectivesEn : lesson.objectivesAr).map((o, i) => (
            <li
              key={i}
              className="flex gap-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <span className="font-bold text-emerald-600 dark:text-emerald-400">✓</span>
              {o}
            </li>
          ))}
        </ul>
      </Section>

      {/* 3) مفردات وتعبيرات الاجتماع */}
      <Section n={3} title={t("mtg.section.expressions")} stage={t("mtg.stage.learn")}>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          {t("mtg.exprIntro")}
        </p>
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
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${fnCls(e.function)}`}
                  >
                    {t(`mtg.function.${e.function}`)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                  {e.ar}
                </p>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold">{t("mtg.exprWhen")}</span>{" "}
                  {lang === "en" ? e.whenEn : e.whenAr}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold">{t("mtg.exprWhy")}</span>{" "}
                  {lang === "en" ? e.whyEn : e.whyAr}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  {linked && (
                    <span className="text-[11px] text-slate-400">
                      <span dir="ltr">{linked.english}</span> · {linked.arabic}
                    </span>
                  )}
                  <button
                    onClick={() => speak(e.en)}
                    aria-label={t("mtg.play")}
                    className="ms-auto rounded-full border border-slate-300 px-2 py-0.5 text-[11px] text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    🔊
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* 4) حوار الاجتماع */}
      <Section n={4} title={t("mtg.section.dialogue")} stage={t("mtg.stage.learn")}>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          {t("mtg.dialogueIntro")}
        </p>

        <h3 className="mb-2 text-sm font-bold text-slate-500 dark:text-slate-400">
          {t("mtg.participants")}
        </h3>
        <ul className="mb-4 grid gap-2 sm:grid-cols-2">
          {lesson.participants.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800"
            >
              <div className="font-bold text-slate-900 dark:text-white">
                {lang === "en" ? p.nameEn : p.nameAr}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {lang === "en" ? p.roleEn : p.roleAr}
              </div>
            </li>
          ))}
        </ul>

        <MeetingDialogue
          dialogue={lesson.dialogue}
          participants={lesson.participants}
        />

        {(lesson.dialogue.wordIds?.length ?? 0) > 0 && (
          <div className="mt-4">
            <div className="mb-2 text-sm font-bold text-slate-500 dark:text-slate-400">
              {t("mtg.dialogueTerms")}
            </div>
            <div className="flex flex-wrap gap-2">
              {lesson.dialogue.wordIds?.map((id) => {
                const w = wordById(id);
                if (!w) return null;
                return (
                  <span
                    key={id}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <span dir="ltr">{w.english}</span> · {w.arabic}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </Section>

      {/* 5) الترجمة العربية (إظهار) */}
      <Section
        n={5}
        title={t("mtg.section.translation")}
        stage={t("mtg.stage.learn")}
      >
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          {t("mtg.translationHint")}
        </p>
        <button
          onClick={() => setShowTranslation((v) => !v)}
          className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {showTranslation ? t("mtg.hideTranslation") : t("mtg.showTranslation")}
        </button>
        {showTranslation && (
          <div className="mt-3">
            <MeetingDialogue
              dialogue={lesson.dialogue}
              participants={lesson.participants}
              showAr
            />
          </div>
        )}
      </Section>

      {/* 6) تعبيرات النطق */}
      <Section n={6} title={t("mtg.section.speaking")} stage={t("mtg.stage.learn")}>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          {t("mtg.speakingIntro")}
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {lesson.speaking.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-slate-900 dark:text-white" dir="ltr">
                  {s.en}
                </span>
                <button
                  onClick={() => speak(s.en)}
                  aria-label={t("mtg.play")}
                  className="shrink-0 rounded-full border border-slate-300 px-2 py-0.5 text-[11px] text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  🔊
                </button>
              </div>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                {s.ar}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {lang === "en" ? s.tipEn : s.tipAr}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* 7) مفردات ERP */}
      <Section n={7} title={t("mtg.section.vocabulary")}>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          {t("mtg.vocabNote")}
        </p>
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
                  <span className="text-sm text-emerald-700 dark:text-emerald-300">
                    {w.arabic}
                  </span>
                </div>
                {(w.definitionEn || w.definitionAr) && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {lang === "en" ? w.definitionEn : w.definitionAr}
                  </p>
                )}
                <button
                  onClick={() => speak(w.english)}
                  aria-label={t("mtg.play")}
                  className="mt-2 rounded-full border border-slate-300 px-2 py-0.5 text-[11px] text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  🔊
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* 8) أسئلة الفهم */}
      <Section n={8} title={t("mtg.section.comprehension")} stage={t("mtg.stage.practice")}>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          {t("mtg.comprehensionIntro")}
        </p>
        <div className="flex flex-col gap-3">
          {lesson.comprehension.map((item, i) => (
            <McqCard key={item.id} item={item} index={i} total={lesson.comprehension.length} />
          ))}
        </div>
      </Section>

      {/* 9) التمرين الموجّه */}
      <Section n={9} title={t("mtg.section.guided")} stage={t("mtg.stage.practice")}>
        <MeetingGuidedPractice guided={lesson.guided} />
      </Section>

      {/* 10) تدريب النطق الموجّه */}
      <Section
        n={10}
        title={t("mtg.section.practiceSpeaking")}
        stage={t("mtg.stage.practice")}
      >
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          {t("mtg.speakingPracticeIntro")}
        </p>
        <PronunciationTrainer
          items={pronounceItems}
          voiceRate={0.9}
          threshold={80}
          onResult={noopResult}
          onFinish={noopFinish}
        />
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {t("mtg.speakingPracticeLimit")}
        </p>
      </Section>

      {/* 11) تحدّي الاجتماع */}
      <Section n={11} title={t("mtg.section.challenge")} stage={t("mtg.stage.challenge")}>
        <h3 className="font-bold text-slate-900 dark:text-white">
          {t("mtg.challengeTaskTitle")}
        </h3>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
          {lang === "en" ? lesson.challengeTaskEn : lesson.challengeTaskAr}
        </p>

        <h4 className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400">
          {t("mtg.checklist")}
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
            htmlFor="meeting-draft"
            className="mb-1.5 block text-sm font-bold text-slate-500 dark:text-slate-400"
          >
            {t("mtg.writeAreaLabel")}
          </label>
          <textarea
            id="meeting-draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={8}
            dir="ltr"
            placeholder={t("mtg.writeAreaPlaceholder")}
            className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {t("mtg.selfAssessNote")}
        </p>

        <button
          onClick={() => setShowReference((v) => !v)}
          className="mt-4 rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {showReference ? t("mtg.hideReference") : t("mtg.showReference")}
        </button>
        {showReference && (
          <div className="mt-3">
            <div className="mb-2 text-sm font-bold text-slate-500 dark:text-slate-400">
              {t("mtg.referenceAnswerTitle")}
            </div>
            <pre
              className="overflow-x-auto whitespace-pre-wrap rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
              dir={lang === "en" ? "ltr" : "rtl"}
            >
              {lang === "en" ? lesson.referenceAnswerEn : lesson.referenceAnswerAr}
            </pre>
          </div>
        )}
      </Section>

      {/* 12) اختبار المعرفة */}
      <Section n={12} title={t("mtg.section.quiz")}>
        <ProcessQuiz questions={lesson.quiz} />
      </Section>
    </div>
  );
}
