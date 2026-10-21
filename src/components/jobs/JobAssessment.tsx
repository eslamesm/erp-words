"use client";

import Link from "next/link";
import { useState } from "react";
import type { JobPath } from "@/data/jobPaths";
import type { MeetingResponse } from "@/types";
import { useT } from "@/hooks/useT";
import { ProcessQuiz } from "@/components/processes/ProcessQuiz";
import { McqCard, type McqItem } from "@/components/practice/McqCard";
import {
  PronunciationTrainer,
  type PronounceItem,
} from "@/components/PronunciationTrainer";
import { jobAssessmentHref, jobPathHref, jobPick } from "@/lib/jobLearning";

function asMcq(r: MeetingResponse): McqItem {
  return {
    id: r.id,
    promptAr: r.situationAr,
    promptEn: r.situationEn,
    optionsAr: r.optionsAr,
    optionsEn: r.optionsEn,
    answerIndex: r.answerIndex,
    explainAr: r.explainAr,
    explainEn: r.explainEn,
  };
}

const noopResult = () => {};
const noopFinish = () => {};

export function JobAssessment({ job }: { job: JobPath }) {
  const { t, lang } = useT();
  const [started, setStarted] = useState(false);

  const assessment = job.assessment;
  const responses = assessment.responses ?? [];
  const speaking = assessment.speaking ?? [];

  const pronounceItems: PronounceItem[] = speaking.map((s) => ({
    id: s.id,
    text: s.en,
    translation: s.ar,
    hint: lang === "en" ? s.tipEn : s.tipAr,
  }));

  return (
    <div className="flex flex-col gap-5">
      <header>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{job.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("job.section.assessment")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {jobPick(lang, job.titleAr, job.titleEn)}
            </p>
          </div>
        </div>
      </header>

      {!started && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-700 dark:text-slate-300">{t("job.assessment.intro")}</p>
          <button
            onClick={() => setStarted(true)}
            className="mt-4 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {t("job.assessment.start")}
          </button>
        </section>
      )}

      {started && (
        <>
          {/* اختبار المعرفة */}
          {assessment.quiz.length > 0 && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 font-bold text-slate-900 dark:text-white">{t("job.section.quiz")}</h2>
              <ProcessQuiz questions={assessment.quiz} />
            </section>
          )}

          {/* الردود المناسبة */}
          {responses.length > 0 && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 font-bold text-slate-900 dark:text-white">
                {t("job.assessment.responsesTitle")}
              </h2>
              <div className="flex flex-col gap-3">
                {responses.map((item, i) => (
                  <McqCard key={item.id} item={asMcq(item)} index={i} total={responses.length} />
                ))}
              </div>
            </section>
          )}

          {/* عبارات النطق */}
          {speaking.length > 0 && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 font-bold text-slate-900 dark:text-white">
                {t("job.assessment.speakingTitle")}
              </h2>
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{t("job.speaking.intro")}</p>
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
            </section>
          )}
        </>
      )}

      <nav className="mt-2 flex flex-wrap gap-2">
        <Link
          href={jobPathHref(job.slug)}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          ← {t("job.backToPath")}
        </Link>
        {started && (
          <Link
            href={jobAssessmentHref(job.slug)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {t("job.restart")}
          </Link>
        )}
      </nav>
    </div>
  );
}
