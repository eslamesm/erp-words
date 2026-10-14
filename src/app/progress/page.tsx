"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WORDS, wordById } from "@/data/words";
import { MODULES } from "@/data/modules";
import { useProgress } from "@/hooks/useProgress";
import { isDue } from "@/lib/srs";
import { dayKey } from "@/lib/dates";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function ProgressPage() {
  const { stats, progress } = useProgress();
  const [copied, setCopied] = useState(false);
  const [todayMs, setTodayMs] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setTodayMs(new Date().getTime()), 0);
    return () => clearTimeout(t);
  }, []);

  const allReviews = Object.values(progress);
  const mastered = allReviews.filter((p) => p.reps >= 5 && p.interval >= 21).length;
  const learning = allReviews.filter((p) => p.reps > 0 && p.interval < 21).length;
  const dueToday = allReviews.filter(isDue).length;
  const accuracy = stats && stats.reviews > 0 ? Math.round((stats.correct / stats.reviews) * 100) : 0;

  const history14 = useMemo(() => {
    if (!todayMs) return [];
    const base: { day: string; count: number }[] = [];
    const map = new Map(stats.history.map((h) => [h.day, h.count]));
    for (let i = 13; i >= 0; i--) {
      const d = new Date(todayMs - i * 86400000);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      base.push({ day: key, count: map.get(key) ?? 0 });
    }
    return base;
  }, [stats, todayMs]);

  const maxCount = Math.max(1, ...history14.map((h) => h.count));

  const dueWords = useMemo(() => {
    return Object.values(progress)
      .filter(isDue)
      .sort((a, b) => a.due - b.due)
      .slice(0, 10)
      .map((p) => ({ p, w: WORDS.find((w) => w.id === p.wordId) }))
      .filter((x) => x.w);
  }, [progress]);

  const week = useMemo(() => {
    const map = new Map(stats?.history?.map((h) => [h.day, h.count]) ?? []);
    const counts = todayMs
      ? Array.from({ length: 7 }, (_, i) => map.get(new Date(todayMs - (6 - i) * 86400000).toLocaleDateString("sv")) ?? 0)
      : [];
    const total = counts.reduce((s, c) => s + c, 0);
    const activeDays = counts.filter((c) => c > 0).length;
    const top = Math.max(0, ...counts);
    const masteredWeek = todayMs
      ? allReviews.filter(
          (p) => p.reps >= 5 && p.interval >= 21 && p.lastReviewed && todayMs - p.lastReviewed < WEEK_MS
        ).length
      : 0;
    return { total, activeDays, top, masteredWeek };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, todayMs]);

  async function copySummary() {
    const lines = [
      `📊 ملخصي الأسبوعي — ERP Words`,
      `👣 أيام النشاط: ${week.activeDays} من 7`,
      `🔁 عدد المراجعات: ${week.total}`,
      `🏆 كلمات أتقنتها هذا الأسبوع: ${week.masteredWeek}`,
      `🎯 دقة عامة: ${accuracy}%`,
      `🔥 سلسلة الأيام: ${stats?.streak ?? 0}`,
      `📚 إجمالي المتقن: ${mastered}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
    } catch {
      setCopied(false);
    }
    setTimeout(() => setCopied(false), 2000);
  }

  function exportCsv() {
    const today = dayKey(0);
    const header = "id,english,arabic,module,level,reviews,interval_days,lapses,due_date,correct,wrong,mastered";
    const rows = Object.values(progress)
      .sort((a, b) => a.wordId.localeCompare(b.wordId))
      .map((p) => {
        const w = wordById(p.wordId);
        const moduleLabel = w ? MODULES.find((m) => m.id === w.module)?.labelAr ?? w.module : "";
        const due = new Date(p.due).toLocaleDateString("sv");
        const isMastered = p.reps >= 5 && p.interval >= 21 ? "نعم" : "لا";
        return [p.wordId, w ? `"${w.english}"` : "", `"${w?.arabic ?? ""}"`, `"${moduleLabel}"`, w?.level ?? "", p.reps, p.interval, p.lapses, due, p.correctCount, p.wrongCount, isMastered].join(",");
      });
    const csvBlob = new Blob([`\uFEFF${header}\n${rows.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(csvBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `erp-words-progress-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">📈 التقدم</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">إحصائياتك في التعلم والتكرار المتباعد.</p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "إجمالي المراجعات", value: stats?.reviews ?? 0, icon: "🔁" },
          { label: "دقة الإجابات", value: `${accuracy}%`, icon: "🎯" },
          { label: "كلمات تامة", value: mastered, icon: "🏆" },
          { label: "أيام متتالية", value: stats?.streak ?? 0, icon: "🔥" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-2xl">{s.icon}</div>
            <div className="mt-1 text-3xl font-extrabold tabular-nums">{s.value}</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-900 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">📊 ملخص أسبوعك</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              آخر 7 أيام — صديق للتصوير، ومشاركته بنقرة أو تصديره جدول Excel/CSV.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copySummary}
              className="rounded-xl border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950"
            >
              {copied ? "✓ نُسخ!" : "📋 نسخ الملخص"}
            </button>
            <button
              onClick={exportCsv}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              ⬇️ تصدير CSV
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: "👣", label: "أيام النشاط", value: `${week.activeDays}/7` },
            { icon: "🔁", label: "مراجعات الأسبوع", value: week.total },
            { icon: "🏆", label: "أُتقنت هذا الأسبوع", value: week.masteredWeek },
            { icon: "🔥", label: "سلسلة الأيام", value: stats?.streak ?? 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-emerald-50 p-3 text-center dark:bg-emerald-950/40">
              <div className="text-2xl">{s.icon}</div>
              <div className="mt-1 text-2xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">{s.value}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
        {week.top > 0 && (
          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-300">
            أفضل يوم هذا الأسبوع: <strong>{week.top}</strong> مراجعة • متوسط يومي:{" "}
            <strong>{week.total > 0 ? Math.round((week.total / Math.max(1, week.activeDays)) * 10) / 10 : 0}</strong>
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 font-bold">نشاط آخر 14 يومًا</h2>
        {stats?.reviews === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
            لا يوجد نشاط بعد. ابدأ جلسة تعلم أولًا!
          </p>
        ) : (
          <div className="flex h-28 items-end gap-1">
            {history14.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    h.count > 0 ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                  style={{ height: `${Math.max(4, (h.count / maxCount) * 100)}%` }}
                  title={`${h.count} مراجعات`}
                />
                {i % 2 === 0 && <span className="text-[9px] text-slate-400">{h.day.slice(8)}</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{learning}</div>
          <div className="mt-1 text-xs text-slate-500">قيد التعلم</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xl font-bold text-rose-600">🔔 {dueToday}</div>
          <div className="mt-1 text-xs text-slate-500">مستحقة للتعلم اليوم</div>
        </div>
      </section>

      {dueWords.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">كلمات مستحقة الآن</h2>
            <Link href="/learn" className="text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
              راجعها الآن ←
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {dueWords.map(({ w }) => (
              <div
                key={w!.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg" dir="ltr">
                    {w!.english}
                  </span>
                  <span className="hidden text-sm text-emerald-700 sm:inline dark:text-emerald-300">{w!.arabic}</span>
                </div>
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  مستحقة الآن
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {(() => {
        const mistakes = Object.values(progress)
          .filter((p) => p.lapses > 0)
          .map((p) => WORDS.find((w) => w.id === p.wordId))
          .filter((w): w is NonNullable<typeof w> => Boolean(w));
        if (mistakes.length === 0) return null;
        const ids = mistakes.map((w) => w.id).join(",");
        return (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-rose-800 dark:text-rose-300">🔁 مراجعة الأخطاء</h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {mistakes.length} كلمة أخطأت فيها سابقًا — مراجعتها اليوم ترفع دقتك وتثبّتها.
                </p>
              </div>
              <Link
                href={`/learn?ids=${ids}`}
                className="shrink-0 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-700"
              >
                راجعها كلها ←
              </Link>
            </div>
          </section>
        );
      })()}

      <p className="text-center text-xs text-slate-400">
        نظام التكرار المتباعد (SRS) يعرض الكلمات قبل نسيانها بمعدل متزايد.
      </p>
    </div>
  );
}