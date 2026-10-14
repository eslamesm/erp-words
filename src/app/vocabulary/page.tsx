"use client";

import { SectionCard } from "@/components/SectionCard";
import { useT } from "@/hooks/useT";

export default function VocabularyHub() {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-bold">{t("hub.vocabulary.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("hub.vocabulary.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SectionCard href="/words" icon="📖" title={t("nav.words")} desc={t("hub.vocabulary.wordsDesc")} />
        <SectionCard href="/glossary" icon="🏷️" title={t("nav.glossary")} desc={t("hub.vocabulary.glossaryDesc")} />
        <SectionCard href="/phrases" icon="🧩" title={t("nav.phrases")} desc={t("hub.vocabulary.phrasesDesc")} />
        <SectionCard href="/reading" icon="📄" title={t("nav.reading")} desc={t("hub.vocabulary.readingDesc")} />
        <SectionCard href="/it" icon="🧑‍💻" title={t("it.title")} desc={t("it.subtitle")} />
      </div>
    </div>
  );
}
