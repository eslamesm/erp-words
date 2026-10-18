"use client";

import type { MeetingGuidedPractice as GuidedData, MeetingResponse } from "@/types";
import { useT } from "@/hooks/useT";
import { McqCard, type McqItem } from "@/components/practice/McqCard";
import { OrderableList, type OrderableLabels } from "@/components/practice/OrderableList";

// موقف اجتماعي يأخذ شكل سؤال اختيار من متعدد (بنية مستقلة عن البريد).
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

export function MeetingGuidedPractice({ guided }: { guided: GuidedData }) {
  const { t, lang } = useT();

  const labels: OrderableLabels = {
    prompt: t("mtg.orderPrompt"),
    check: t("mtg.checkOrder"),
    correct: t("mtg.correctOrder"),
    wrong: t("mtg.wrongOrder"),
    reset: t("mtg.resetOrder"),
    up: t("mtg.moveUp"),
    down: t("mtg.moveDown"),
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 font-bold text-slate-900 dark:text-white">
          {t("mtg.guidedFill")}
        </h3>
        <div className="flex flex-col gap-3">
          {guided.fillBlanks.map((item, i) => (
            <McqCard
              key={item.id}
              item={item}
              index={i}
              total={guided.fillBlanks.length}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-bold text-slate-900 dark:text-white">
          {t("mtg.guidedResponses")}
        </h3>
        <div className="flex flex-col gap-3">
          {guided.responses.map((item, i) => (
            <McqCard
              key={item.id}
              item={asMcq(item)}
              index={i}
              total={guided.responses.length}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-bold text-slate-900 dark:text-white">
          {t("mtg.guidedOrder")}
        </h3>
        <OrderableList items={guided.order} labels={labels} lang={lang} />
      </div>
    </div>
  );
}
