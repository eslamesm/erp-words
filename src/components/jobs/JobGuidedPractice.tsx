"use client";

import type { JobLessonPractice } from "@/data/jobPaths";
import type { MeetingResponse } from "@/types";
import { useT } from "@/hooks/useT";
import { McqCard, type McqItem } from "@/components/practice/McqCard";
import { OrderableList, type OrderableLabels } from "@/components/practice/OrderableList";

// موقف مكتوب يأخذ شكل اختيار من متعدد (نفس بنية Phase 04 المستقلة).
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

// المستوى الثاني – تدريب: اختيار الإجابة، اختيار الرد المناسب، وترتيب الخطوات.
export function JobGuidedPractice({ practice }: { practice: JobLessonPractice }) {
  const { t, lang } = useT();

  const mcqs = practice.mcqs ?? [];
  const responses = practice.responses ?? [];
  const order = practice.order ?? [];

  const labels: OrderableLabels = {
    prompt: t("job.orderPrompt"),
    check: t("job.checkOrder"),
    correct: t("job.correctOrder"),
    wrong: t("job.wrongOrder"),
    reset: t("job.resetOrder"),
    up: t("job.moveUp"),
    down: t("job.moveDown"),
  };

  return (
    <div className="flex flex-col gap-6">
      {mcqs.length > 0 && (
        <div>
          <h3 className="mb-3 font-bold text-slate-900 dark:text-white">
            {t("job.practiceChoose")}
          </h3>
          <div className="flex flex-col gap-3">
            {mcqs.map((item, i) => (
              <McqCard key={item.id} item={item} index={i} total={mcqs.length} />
            ))}
          </div>
        </div>
      )}

      {responses.length > 0 && (
        <div>
          <h3 className="mb-3 font-bold text-slate-900 dark:text-white">
            {t("job.practiceRespond")}
          </h3>
          <div className="flex flex-col gap-3">
            {responses.map((item, i) => (
              <McqCard key={item.id} item={asMcq(item)} index={i} total={responses.length} />
            ))}
          </div>
        </div>
      )}

      {order.length > 0 && (
        <div>
          <h3 className="mb-3 font-bold text-slate-900 dark:text-white">
            {t("job.practiceOrder")}
          </h3>
          <OrderableList items={order} labels={labels} lang={lang} />
        </div>
      )}
    </div>
  );
}
