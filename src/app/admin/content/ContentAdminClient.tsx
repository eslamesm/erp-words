"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ModuleId, VocabularyCategory } from "@/types";
import { filterWords, REVIEW_FILTERS, type ReviewFilter } from "@/lib/contentAdmin";
import type { AdminContentData } from "@/lib/adminContentTypes";

const chip = "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors";
const on = "bg-slate-900 text-white dark:bg-white dark:text-slate-900";
const off =
  "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800";

export function ContentAdminClient({ data }: { data: AdminContentData }) {
  const { words: allWords, modules, subModules: allSubModules, categories, counts, warnings } = data;
  const [module, setModule] = useState<ModuleId | "all">("all");
  const [subModule, setSubModule] = useState<string>("all");
  const [category, setCategory] = useState<VocabularyCategory | "all">("all");
  const [review, setReview] = useState<ReviewFilter>("all");
  const [query, setQuery] = useState("");

  const words = useMemo(
    () => filterWords(allWords, { module, subModule, category, review, query }),
    [allWords, module, subModule, category, review, query]
  );

  const subModules = module !== "all" ? allSubModules.filter((s) => s.moduleId === module) : [];
  const subModuleLabels = useMemo(
    () => new Map(allSubModules.map((s) => [s.id, s.labelAr])),
    [allSubModules]
  );
  const moduleLabels = useMemo(
    () => new Map(modules.map((m) => [m.id, m.labelAr])),
    [modules]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
        <h1 className="text-2xl font-bold">🛠️ أداة إدارة ومراجعة المحتوى</h1>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          أداة داخلية للمراجعة فقط — لا تظهر ضمن واجهة المتعلّم.
        </p>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white/60 p-3 dark:border-slate-700 dark:bg-slate-900/40">
            <div className="font-bold text-slate-800 dark:text-slate-100">1) اعتماد المحتوى (Content Approval)</div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              يُعبّر عنه بحقل <span className="font-mono">status</span> (draft/reviewed/published). يعني أن المحتوى
              منشور/معتمد — <strong>ولا يعني أن تصنيفه مُراجَع بشريًا</strong>.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/60 p-3 dark:border-slate-700 dark:bg-slate-900/40">
            <div className="font-bold text-slate-800 dark:text-slate-100">2) مراجعة التصنيف (Classification Review)</div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              يُعبّر عنه بحقل <span className="font-mono">reviewStatus</span> (reviewed/auto). مستقل تمامًا عن
              <span className="font-mono"> status</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="الإجمالي" value={counts.total} tone="slate" />
        <Stat label="مُراجَع (reviewed)" value={counts.reviewed} tone="emerald" />
        <Stat label="آلي (auto)" value={counts.auto} tone="amber" />
        <Stat label="يحتاج مراجعة (قادم)" value={counts.needsReview} tone="rose" />
      </div>

      <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
        ⚠️ <strong>لا تعتبر «يحتاج مراجعة = {counts.needsReview}» دليلًا على اكتمال مراجعة المحتوى.</strong>{" "}
        القيمة <span className="font-mono">{counts.auto}</span> مصطلحًا حالتها <span className="font-mono">auto</span> (تصنيف
        آلي بالوسوم/الافتراضي) لا تزال <strong>بحاجة إلى مراجعة بشرية</strong>. «يحتاج مراجعة» قيمة محجوزة لحالة مستقبلية فقط.
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 ابحث بالمعرّف أو الإنجليزية أو العربية..."
        className="rounded-2xl border-2 border-slate-300 px-5 py-3 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">حالة المراجعة:</span>
          {REVIEW_FILTERS.map((r) => (
            <button
              key={r.id}
              onClick={() => setReview(r.id)}
              className={`${chip} ${review === r.id ? on : off}`}
            >
              {r.labelAr}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الوحدة:</span>
          <button
            onClick={() => {
              setModule("all");
              setSubModule("all");
            }}
            className={`${chip} ${module === "all" ? on : off}`}
          >
            الكل
          </button>
          {modules.filter((m) => allWords.some((w) => w.module === m.id)).map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setModule(m.id);
                setSubModule("all");
              }}
              className={`${chip} ${module === m.id ? on : off}`}
            >
              {m.icon} {m.labelAr}
            </button>
          ))}
        </div>

        {subModules.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الوحدة الفرعية:</span>
            <button
              onClick={() => setSubModule("all")}
              className={`${chip} ${subModule === "all" ? on : off}`}
            >
              الكل
            </button>
            {subModules.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubModule(s.id)}
                className={`${chip} ${subModule === s.id ? on : off}`}
              >
                {s.labelAr}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">النوع:</span>
          <button
            onClick={() => setCategory("all")}
            className={`${chip} ${category === "all" ? on : off}`}
          >
            الكل
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`${chip} ${category === c.id ? on : off}`}
            >
              {c.icon} {c.labelAr}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
        النتائج: {words.length} من {allWords.length}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[820px] text-right text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="p-2">المعرّف</th>
              <th className="p-2">English</th>
              <th className="p-2">عربي</th>
              <th className="p-2">الوحدة</th>
              <th className="p-2">الوحدة الفرعية</th>
              <th className="p-2">النوع</th>
              <th className="p-2">اعتماد المحتوى<br /><span className="font-normal text-[10px]">status</span></th>
              <th className="p-2">مراجعة التصنيف<br /><span className="font-normal text-[10px]">reviewStatus</span></th>
            </tr>
          </thead>
          <tbody>
            {words.map((w) => (
              <tr key={w.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="p-2 font-mono text-[11px] text-slate-500" dir="ltr">
                  {w.id}
                </td>
                <td className="p-2 font-semibold" dir="ltr">
                  {w.english}
                </td>
                <td className="p-2">{w.arabic}</td>
                <td className="p-2">{moduleLabels.get(w.module) ?? w.module}</td>
                <td className="p-2">{w.subModuleId ? subModuleLabels.get(w.subModuleId) ?? w.subModuleId : "—"}</td>
                <td className="p-2">{w.category ?? "—"}</td>
                <td className="p-2">
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 dark:bg-slate-700">{w.status}</span>
                </td>
                <td className="p-2">
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      w.reviewStatus === "reviewed"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                    }`}
                  >
                    {w.reviewStatus === "reviewed" ? "مُراجَع" : "آلي"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {words.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-slate-500 dark:border-slate-700">
          لا توجد مصطلحات مطابقة لهذه الفلاتر.
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
        <h2 className="font-bold">🧾 تحذيرات المحتوى (تقرير مستقل — للقراءة فقط)</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          تشمل التصنيفات اليدوية غير المستخدمة والمصطلحات بلا تعريف. لا تُحذف تلقائيًا — للمراجعة المستقبلية.
        </p>
        {warnings.length === 0 ? (
          <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">لا توجد تحذيرات.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-1 text-xs">
            {warnings.map((wn, i) => (
              <li key={`${wn.code}-${wn.id ?? i}`} className="rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                <span className="font-mono text-[10px] text-slate-500">{wn.code}</span>
                {wn.id ? <span className="mr-2 font-mono text-[10px] text-slate-500" dir="ltr">{wn.id}</span> : null}
                <span className="mr-2">{wn.message}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/" className="text-center font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
        ← العودة إلى الرئيسية
      </Link>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "slate" | "emerald" | "amber" | "rose" }) {
  const tones: Record<string, string> = {
    slate: "border-slate-200 dark:border-slate-800",
    emerald: "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40",
    amber: "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40",
    rose: "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40",
  };
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
