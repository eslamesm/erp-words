"use client";

import { proEngUnitBySlug } from "@/data/professionalEnglish";
import { MeetingLessonCards } from "@/components/meetings/MeetingLessonCards";
import { useT } from "@/hooks/useT";

// واحة الاجتماعات والمناقشات: وصف الوحدة + بطاقات الدروس السبعة.
export default function MeetingsAndDiscussionsPage() {
  const { t, lang } = useT();
  const unit = proEngUnitBySlug("meetings-discussions");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">
          {unit
            ? `${unit.icon} ${lang === "en" ? unit.titleEn : unit.titleAr}`
            : `🗣️ ${t("proeng.indexTitle")}`}
        </h1>
        {unit && (
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            {lang === "en" ? unit.descEn : unit.descAr}
          </p>
        )}
      </div>
      <section>
        <h2 className="mb-4 text-xl font-bold">{t("mtg.lessonsTitle")}</h2>
        <MeetingLessonCards />
      </section>
    </div>
  );
}
