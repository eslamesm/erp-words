"use client";

import Link from "next/link";
import { emailBySlug } from "@/data/professionalEnglish";
import { useT } from "@/hooks/useT";
import { EmailLesson } from "./EmailLesson";

// صفحة درس البريد (عميل) — تستقبل slug وتتعامل مع حالة عدم وجود الدرس.
export function EmailPageClient({ slug }: { slug: string }) {
  const { t } = useT();
  const lesson = emailBySlug(slug);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="text-5xl">🔍</span>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{t("email.notFound")}</p>
        <Link
          href="/professional-english/business-email-writing"
          className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white dark:bg-white dark:text-slate-900"
        >
          {t("email.backToUnit")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/professional-english/business-email-writing"
        className="self-start text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
      >
        ← {t("email.backToUnit")}
      </Link>
      <EmailLesson lesson={lesson} />
    </div>
  );
}
