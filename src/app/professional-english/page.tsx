"use client";

import { ProEngUnitCards } from "@/components/emails/ProEngUnitCards";
import { useT } from "@/hooks/useT";

export default function ProfessionalEnglishPage() {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">🌐 {t("proeng.indexTitle")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("proeng.indexSubtitle")}</p>
      </div>
      <section>
        <h2 className="mb-4 text-xl font-bold">{t("proeng.unitsTitle")}</h2>
        <ProEngUnitCards />
      </section>
    </div>
  );
}
