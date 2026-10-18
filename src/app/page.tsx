"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MODULES } from "@/data/modules";
import { WORDS } from "@/data/words";
import { ProcessCards } from "@/components/processes/ProcessCards";
import { ProEngUnitCards } from "@/components/emails/ProEngUnitCards";
import { JobPathCards } from "@/components/jobs/JobPathCards";
import { isDue } from "@/lib/srs";
import { useProgress } from "@/hooks/useProgress";
import { Onboarding } from "@/components/Onboarding";
import { HomeScreen } from "@/components/ui/HomeScreen";
import { gamificationLevel, MOTIVATIONAL, MOTIVATIONAL_EN, PLAN_META, reviewsToday } from "@/lib/plan";
import { useT } from "@/hooks/useT";
import { READY_JOB_PATHS } from "@/data/jobPaths";

const FEATURE_HREF: Record<string, string> = {
  smart: "/assistant",
  erp: "/vocabulary",
  interview: "/paths",
  lang: "/settings",
  voice: "/pronounce",
};

export default function HomePage() {
  const { profile, plan, stats, progress, createProfile, dailyToday, atRisk, freeze, freezeLeft, settings, updateSettings, today } =
    useProgress();
  const { t, lang } = useT();
  const router = useRouter();

  if (!profile) {
    return <Onboarding onCreate={createProfile} />;
  }

  const mastered = Object.values(progress).filter((p) => p.reps >= 5 && p.interval >= 21).length;
  const dueToday = Object.values(progress).filter((p) => p.reps === 0 || isDue(p)).length;
  const learning = Object.values(progress).filter((p) => p.reps > 0 && p.interval < 21).length;
  const gama = gamificationLevel(profile.xp);
  const todayReviews = reviewsToday(stats?.history);
  const meta = PLAN_META[profile.level];
  const quotes = lang === "en" ? MOTIVATIONAL_EN : MOTIVATIONAL;
  const quote = quotes[(profile.joinedAt + profile.xp) % quotes.length];
  const dueForPlan = Math.max(0, (plan?.reviewsPerDay ?? 10) - todayReviews);
  const planDoneToday = Boolean(settings?.planDone?.[today]);
  const planPct = Math.min(100, Math.round((todayReviews / (plan?.reviewsPerDay ?? 10)) * 100));

  function togglePlanDone() {
    const next = { ...(settings?.planDone ?? {}) };
    if (next[today]) delete next[today];
    else next[today] = true;
    updateSettings({ ...settings, planDone: next });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* الواجهة الجديدة: الترحيب + المميزات */}
      <HomeScreen
        showHeader={false}
        onStartChat={() => router.push("/assistant")}
        onFeature={(id) => router.push(FEATURE_HREF[id] ?? "/")}
      />

      {/* بطاقة الملف الشخصي ونظام النقاط */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-lg dark:from-slate-800 dark:to-indigo-950">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold">
            {profile.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold">{profile.name}</h1>
              <span className={`rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold`}>
                {meta.icon} {lang === "en" ? meta.titleEn : meta.title}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-200">
              <span>
                {gama.icon} {lang === "en" ? gama.titleEn : gama.title}
              </span>
              <span>•</span>
              <span>{profile.xp} {t("common.points")}</span>
              <span>•</span>
              <span>{t("home.streakDays", { n: stats?.streak ?? 0 })}</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-300">
            <span>{t("home.progressPoints")}</span>
            <span>
              {gama.next ? t("home.toNextLevel", { n: gama.next.minXp - profile.xp }) : t("home.maxLevel")}
            </span>
          </div>
          <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500"
              style={{ width: `${gama.progressTowardsNext}%` }}
            />
          </div>
        </div>
      </section>

      {/* رسالة تحفيزية */}
      <section className="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-center text-sm font-medium text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
        💬 {quote}
      </section>

      {/* مهمة اليوم من الخطة */}
      {plan && (
        <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-900 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-lg">🗺️ {lang === "en" ? plan.titleEn : plan.title}</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlanDone}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  planDoneToday
                    ? "bg-emerald-600 text-white"
                    : "border-2 border-emerald-400 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950"
                }`}
                title={planDoneToday ? t("home.planDoneTooltipUndo") : t("home.planDoneTooltipDo")}
              >
                {planDoneToday ? t("home.planDoneYes") : t("home.planDoneAsk")}
              </button>
              <Link href="/plan" className="text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
                {t("home.planDetails")}
              </Link>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {lang === "en" ? plan.subtitleEn : plan.subtitle} • {lang === "en" ? meta.titleEn : meta.title}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: t("home.stat.reviewsToday"), value: `${todayReviews}/${plan.reviewsPerDay}`, ok: todayReviews >= plan.reviewsPerDay },
              { label: t("home.stat.newPerDay"), value: `${plan.newWordsPerDay}`, ok: false },
              { label: t("home.stat.dueNow"), value: `${dueToday}`, ok: dueToday === 0 },
              { label: t("home.stat.mastered"), value: `${mastered}`, ok: mastered > 0 },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-800">
                <div className="text-xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
                  {c.ok ? "✓ " : ""}
                  {c.value}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{c.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>{t("home.todayProgress")}</span>
              <span>{planPct}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  planDoneToday || planPct >= 100
                    ? "bg-emerald-500"
                    : "bg-gradient-to-l from-emerald-400 to-teal-500"
                }`}
                style={{ width: `${planPct}%` }}
              />
            </div>
            {planDoneToday && (
              <p className="mt-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {t("home.congrats")}
              </p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/learn"
              className="flex-1 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-5 py-3 text-center font-bold text-white shadow transition-transform hover:scale-[1.02]"
            >
              {t("home.reviewNow")}{dueForPlan > 0 ? ` (${dueForPlan})` : ""}
            </Link>
            <Link
              href="/quiz"
              className="flex-1 rounded-2xl border-2 border-slate-300 px-5 py-3 text-center font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("home.quickQuiz")}
            </Link>
          </div>
        </section>
      )}

      {/* تنبيه خطر السلسلة + تجميد */}
      {atRisk && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 dark:border-amber-800 dark:bg-amber-950/40">
          <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            {t("home.atRisk", { n: stats?.streak ?? 0 })}
          </div>
          <button
            onClick={freeze}
            disabled={freezeLeft <= 0}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("home.freeze", { n: freezeLeft })}
          </button>
        </section>
      )}

      {/* التحدي اليومي */}
      <Link
        href="/daily"
        className={`flex items-center justify-between rounded-3xl border p-5 shadow-sm transition-transform hover:-translate-y-0.5 ${
          dailyToday
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
            : "border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/40"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎯</span>
          <div>
            <div className="font-bold">{t("home.dailyTitle")}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              {dailyToday
                ? t("home.dailyDone", { score: dailyToday.score, total: dailyToday.total })
                : t("home.dailyDesc")}
            </div>
          </div>
        </div>
        <span className="text-sm font-bold text-violet-700 dark:text-violet-300">
          {dailyToday ? t("home.dailyRedo") : t("home.dailyStart")}
        </span>
      </Link>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t("home.stat.totalWords"), value: WORDS.length, icon: "📚", color: "text-emerald-600" },
          { label: t("home.stat.learning"), value: learning, icon: "📖", color: "text-sky-600" },
          { label: t("home.stat.masteredWords"), value: mastered, icon: "🏆", color: "text-amber-600" },
          { label: t("home.stat.streak"), value: stats?.streak ?? 0, icon: "🔥", color: "text-rose-600" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className={`text-2xl ${s.color}`}>{s.icon}</div>
            <div className="mt-1 text-3xl font-extrabold tabular-nums">{s.value}</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
          </div>
        ))}
      </section>

      {(() => {
        const weights = MODULES.map((m) => {
          const words = WORDS.filter((w) => w.module === m.id);
          const masteredCount = words.filter((w) => (progress[w.id]?.lapses ?? 0) >= 3).length;
          const pct = words.length ? Math.round((masteredCount / words.length) * 100) : 0;
          return { m, words: words.length, mastered: masteredCount, pct };
        }).filter((x) => x.words > 0);
        const totalWords = weights.reduce((s, x) => s + x.words, 0);
        const overall = totalWords ? Math.round((weights.reduce((s, x) => s + x.mastered, 0) / totalWords) * 100) : 0;
        return (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{t("home.masteryTitle")}</h2>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                {t("home.masteryTotal", { pct: overall })}
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {weights.map(({ m, words, mastered, pct }) => (
                <div key={m.id}>
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>
                      {m.icon} {lang === "en" ? m.labelEn : m.labelAr}
                    </span>
                    <span className="tabular-nums">
                      {mastered}/{words} • {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-sky-400 to-violet-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {(() => {
        const mistakes = WORDS.filter((w) => (progress[w.id]?.lapses ?? 0) > 0);
        if (mistakes.length === 0) return null;
        const ids = mistakes.map((w) => w.id).join(",");
        return (
          <Link
            href={`/learn?ids=${ids}`}
            className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 transition-colors hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:hover:bg-rose-950"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔁</span>
              <div>
                <div className="font-bold text-rose-800 dark:text-rose-300">{t("home.mistakesTitle")}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {t("home.mistakesDesc", { n: mistakes.length })}
                </div>
              </div>
            </div>
            <span className="text-sm font-bold text-rose-700 dark:text-rose-300">{t("home.mistakesReview")}</span>
          </Link>
        );
      })()}

      {dueToday > 0 && (
        <Link
          href="/learn"
          className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-center font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {t("home.dueDesc", { n: dueToday })}
        </Link>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold">{t("home.modulesTitle")}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MODULES.filter((m) => WORDS.some((w) => w.module === m.id)).map((m) => {
            const count = WORDS.filter((w) => w.module === m.id).length;
            return (
              <Link
                key={m.id}
                href={`/words?module=${m.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <div className="font-bold">{lang === "en" ? m.labelEn : m.labelAr}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400" dir={lang === "en" ? "rtl" : "ltr"}>
                      {lang === "en" ? m.labelAr : m.labelEn}
                    </div>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${m.color}`}>{count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold">🔗 {t("process.homeTitle")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("process.homeSubtitle")}</p>
          </div>
          <Link
            href="/processes"
            className="shrink-0 text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            {t("process.backToIndex")}
          </Link>
        </div>
        <ProcessCards />
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold">🌐 {t("proeng.homeTitle")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("proeng.homeSubtitle")}</p>
          </div>
          <Link
            href="/professional-english"
            className="shrink-0 text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            {t("proeng.backToIndex")}
          </Link>
        </div>
        <ProEngUnitCards />
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold">💼 {t("job.title")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("job.subtitle")}</p>
          </div>
          <Link
            href="/job-based-learning"
            className="shrink-0 text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            {t("job.backToPaths")}
          </Link>
        </div>
        <JobPathCards paths={READY_JOB_PATHS} />
      </section>
    </div>
  );
}