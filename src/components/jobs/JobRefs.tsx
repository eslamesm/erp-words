"use client";

import Link from "next/link";
import type { JobLessonRefs } from "@/data/jobPaths";
import { useT } from "@/hooks/useT";
import { resolveJobRefs, type ResolvedJobRef } from "@/lib/jobLearning";

// رقاقة مرجع محتوى: رابط لوجهة موجودة، أو بطاقة تحذير عند تعذّر الحلّ (لا إسقاط صامت).
function RefChip({ item }: { item: ResolvedJobRef }) {
  const base =
    "inline-flex max-w-full flex-col rounded-xl border px-3 py-1.5 text-start text-xs";
  if (item.missing || !item.href) {
    return (
      <span
        className={`${base} border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200`}
        title="Unresolved reference"
      >
        <span className="font-semibold" dir="ltr">
          ⚠ {item.label}
        </span>
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      className={`${base} border-slate-200 bg-white text-slate-700 transition-colors hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`}
    >
      <span className="truncate font-semibold">{item.label}</span>
      {item.sub && (
        <span className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-slate-500" dir="auto">
          {item.sub}
        </span>
      )}
    </Link>
  );
}

// قسم «المحتوى المرتبط» — يحلّ معرّفات الدرس إلى عناوين ووجهات المراحل السابقة.
export function JobRefs({ refs }: { refs: JobLessonRefs }) {
  const { t, lang } = useT();
  const groups = resolveJobRefs(refs, lang);

  if (groups.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{t("job.refs.none")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g.key}>
          <h3 className="mb-2 text-sm font-bold text-slate-500 dark:text-slate-400">
            {t(`job.refs.${g.key}`)}
          </h3>
          <div className="flex flex-wrap gap-2">
            {g.items.map((item) => (
              <RefChip key={`${g.key}:${item.id}`} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
