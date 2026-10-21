"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { JobLesson as Lesson, JobPath } from "@/data/jobPaths";
import { useT } from "@/hooks/useT";
import { ProcessQuiz } from "@/components/processes/ProcessQuiz";
import {
  PronunciationTrainer,
  type PronounceItem,
} from "@/components/PronunciationTrainer";
import { JobRefs } from "./JobRefs";
import { JobGuidedPractice } from "./JobGuidedPractice";
import { jobChallenge, jobLessonHref, jobLessonNeighbors, jobPick } from "@/lib/jobLearning";

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

const noopResult = () => {};
const noopFinish = () => {};

export function JobLesson({ job, lesson }: { job: JobPath; lesson: Lesson }) {
  const { t, lang } = useT();
  const [draft, setDraft] = useState("");
  const [showReference, setShowReference] = useState(false);

  const title = jobPick(lang, lesson.titleAr, lesson.titleEn);
  const titleAlt = jobPick(lang, lesson.titleEn, lesson.titleAr);
  const objectives = lang === "en" ? lesson.objectivesEn : lesson.objectivesAr;

  const phrases = lesson.practice.phrases ?? [];
  const pronounceItems: PronounceItem[] = phrases.map((p) => ({
    id: p.id,
    text: p.en,
    translation: p.ar,
    hint: lang === "en" ? p.tipEn : p.tipAr,
  }));

  const challenge = jobChallenge(lesson, lang);
  const { prev, next } = jobLessonNeighbors(job, lesson.slug);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{lesson.icon}</span>
          <div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              {t("job.lessonLabel", { n: lesson.order })}
            </span>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{titleAlt}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            🎯 {lesson.level}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {t("job.lessonOf", { n: lesson.order, total: job.lessons.length })}
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
              {t(`job.stage.${s}`)}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t(`job.stage.${s}Desc`)}
            </div>
          </div>
        ))}
      </div>

      {/* 1) سياق العمل */}
      <Section n={1} title={t("job.section.context")} stage={t("job.stage.learn")}>
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          {lang === "en" ? lesson.scenarioEn : lesson.scenarioAr}
        </p>
      </Section>

      {/* 2) أهداف التعلّم */}
      <Section n={2} title={t("job.section.objectives")} stage={t("job.stage.learn")}>
        <ul className="flex flex-col gap-2">
          {objectives.map((o, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">✓</span>
              {o}
            </li>
          ))}
        </ul>
      </Section>

      {/* 3) المحتوى المرتبط */}
      <Section n={3} title={t("job.section.refs")} stage={t("job.stage.learn")}>
        <JobRefs refs={lesson.refs} />
      </Section>

      {/* 4) التدريب الموجّه */}
      <Section n={4} title={t("job.section.practice")} stage={t("job.stage.practice")}>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {t("job.practiceIntro")}
        </p>
        <JobGuidedPractice practice={lesson.practice} />

        {phrases.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 font-bold text-slate-900 dark:text-white">
              {t("job.practicePhrases")}
            </h3>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              {t("job.speaking.intro")}
            </p>
            <PronunciationTrainer
              items={pronounceItems}
              voiceRate={0.9}
              threshold={80}
              onResult={noopResult}
              onFinish={noopFinish}
            />
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              {t("job.speaking.limit")}
            </p>
          </div>
        )}
      </Section>

      {/* 5) تحدّي الدرس */}
      {challenge && (
        <Section n={5} title={t("job.section.challenge")} stage={t("job.stage.challenge")}>
          <h3 className="font-bold text-slate-900 dark:text-white">
            {t("job.challenge.taskTitle")}
          </h3>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{challenge.task}</p>

          <h4 className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400">
            {t("job.challenge.checklist")}
          </h4>
          <ul className="mt-2 flex flex-col gap-1.5">
            {objectives.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-slate-400">☐</span>
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <label
              htmlFor="job-draft"
              className="mb-1.5 block text-sm font-bold text-slate-500 dark:text-slate-400"
            >
              {t("job.challenge.writeArea")}
            </label>
            <textarea
              id="job-draft"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={8}
              dir={lang === "en" ? "ltr" : "rtl"}
              placeholder={t("job.challenge.placeholder")}
              className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {t("job.challenge.selfAssess")}
          </p>

          <button
            onClick={() => setShowReference((v) => !v)}
            className="mt-4 rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {showReference ? t("job.challenge.hideReference") : t("job.challenge.showReference")}
          </button>
          {showReference && (
            <div className="mt-3">
              <div className="mb-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                {t("job.challenge.referenceTitle")}
              </div>
              <pre
                className="overflow-x-auto whitespace-pre-wrap rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                dir={lang === "en" ? "ltr" : "rtl"}
              >
                {challenge.reference}
              </pre>
            </div>
          )}
        </Section>
      )}

      {/* 6) اختبار المعرفة */}
      {lesson.quiz.length > 0 && (
        <Section n={6} title={t("job.section.quiz")}>
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{t("job.quizIntro")}</p>
          <ProcessQuiz questions={lesson.quiz} />
        </Section>
      )}

      {/* التنقّل بين الدروس */}
      <nav className="flex items-center justify-between gap-3">
        {prev ? (
          <Link
            href={jobLessonHref(job.slug, prev.slug)}
            className="flex max-w-[48%] flex-col rounded-2xl border border-slate-200 bg-white px-4 py-3 text-start shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <span className="text-xs text-slate-400">← {t("job.prevLesson")}</span>
            <span className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
              {jobPick(lang, prev.titleAr, prev.titleEn)}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={jobLessonHref(job.slug, next.slug)}
            className="flex max-w-[48%] flex-col rounded-2xl border border-slate-200 bg-white px-4 py-3 text-end shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <span className="text-xs text-slate-400">{t("job.nextLesson")} →</span>
            <span className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
              {jobPick(lang, next.titleAr, next.titleEn)}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
