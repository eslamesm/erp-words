"use client";

import { ProcessCards } from "@/components/processes/ProcessCards";
import { useT } from "@/hooks/useT";

export default function ProcessesPage() {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">🔗 {t("process.indexTitle")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("process.indexSubtitle")}</p>
      </div>
      <ProcessCards />
    </div>
  );
}
