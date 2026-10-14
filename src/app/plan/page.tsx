"use client";

import Link from "next/link";
import type { Profile } from "@/types";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";
import { BADGES, gamificationLevel, PLAN_META, PLANS, reviewsToday } from "@/lib/plan";

type OverrideKey = "newWordsPerDay" | "reviewsPerDay" | "days" | "conversationMinutes";

const STEP_SCOPE: Record<OverrideKey, { min: number; max: number; labelKey: string; suffixKey: string }> = {
  newWordsPerDay: { min: 1, max: 30, labelKey: "plan.newPerDay", suffixKey: "plan.wordsUnit" },
  reviewsPerDay: { min: 5, max: 60, labelKey: "plan.reviewsPerDay", suffixKey: "plan.reviewsUnit" },
  days: { min: 7, max: 365, labelKey: "plan.duration", suffixKey: "plan.daysUnit" },
  conversationMinutes: { min: 5, max: 60, labelKey: "plan.conversation", suffixKey: "plan.minutesUnit" },
};

export default function PlanPage() {
  const { profile, plan, stats, progress, settings, updatePlanOverrides, updateProfile, planAutoBonus } = useProgress();
  const { t, lang } = useT();

  if (!profile) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-500">{t("plan.noPlan")}</p>
      </div>
    );
  }
  if (!plan) return null;

  const meta = PLAN_META[profile.level];
  const gama = gamificationLevel(profile.xp);
  const mastered = Object.values(progress).filter((p) => p.reps >= 5 && p.interval >= 21).length;
  const todayLearned = reviewsToday(stats?.history);
  const daysActive = stats?.history?.length ?? 0;
  const pct = Math.min(100, Math.round((daysActive / plan.days) * 100));

  const pb = PLANS.find((p) => p.id === profile.planType) ?? null;
  const o = profile.planOverrides ?? {};

  function bump(key: OverrideKey, delta: number) {
    const scope = STEP_SCOPE[key];
    const cur = o[key] ?? pb?.[key] ?? scope.min;
    updatePlanOverrides({ [key]: Math.max(scope.min, Math.min(scope.max, cur + delta)) } as Partial<
      NonNullable<Profile["planOverrides"]>
    >);
  }

  function resetPlan() {
    updateProfile({ planOverrides: {}, planAuto: false });
  }

  function togglePlanAuto() {
    if (!profile) return;
    updateProfile({ planAuto: !profile.planAuto });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("plan.pageTitle")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("plan.pageSubtitle")}</p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">
              {meta.icon} {lang === "en" ? plan.titleEn : plan.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {lang === "en" ? plan.subtitleEn : plan.subtitle}
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            {t("plan.daysSuffix", { n: plan.days })}
          </span>
        </div>
        <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
          {lang === "en" ? plan.introEn : plan.intro}
        </p>

        <div className="mt-4 grid grid-cols-4 gap-3 text-center">
          {[
            { label: t("plan.newPerDay"), value: plan.newWordsPerDay },
            { label: t("plan.reviewsPerDay"), value: plan.reviewsPerDay },
            { label: t("plan.statsWeekly"), value: plan.weeklyGoal },
            { label: t("plan.statsConv"), value: plan.conversationMinutes },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
              <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{c.value}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">{t("plan.progressLabel")}</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">{pct}%</span>
          </div>
          <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </section>

      {/* تخصيص الخطة */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg">{t("plan.customizeTitle")}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t("plan.customizeDesc")}
            </p>
          </div>
          <button
            onClick={resetPlan}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            title={t("plan.resetTitle")}
          >
            {t("plan.resetBtn")}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(STEP_SCOPE) as OverrideKey[]).map((key) => {
            const scope = STEP_SCOPE[key];
            const cur = o[key] ?? pb?.[key] ?? scope.min;
            return (
              <div key={key} className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-800">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t(scope.labelKey)}</div>
                <div className="my-2 text-2xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
                  {cur} <span className="text-sm font-medium">{t(scope.suffixKey)}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => bump(key, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    −
                  </button>
                  <button
                    onClick={() => bump(key, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-lg font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/40">
          <div className="flex flex-1 items-start gap-3">
            <button
              role="switch"
              aria-checked={Boolean(profile.planAuto)}
              onClick={togglePlanAuto}
              className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
                profile.planAuto ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  profile.planAuto ? "right-0.5" : "right-[1.4rem]"
                }`}
              />
            </button>
            <div className="min-w-0">
              <div className="text-sm font-bold text-amber-800 dark:text-amber-300">{t("plan.autoTitle")}</div>
              <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-300">
                {t("plan.autoDesc", { n: planAutoBonus })}
              </p>
            </div>
          </div>
          {profile.planAuto && (
            <span className="shrink-0 rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white">
              {t("plan.autoExtra", { n: planAutoBonus })}
            </span>
          )}
        </div>
      </section>

      {/* جلسة المحادثة والجدول اليومي */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/conversations"
          className="rounded-2xl border border-violet-200 bg-violet-50 p-5 transition-transform hover:-translate-y-0.5 dark:border-violet-900 dark:bg-violet-950/40"
        >
          <div className="text-2xl">🗣️</div>
          <div className="mt-1 font-bold">{t("plan.convSession", { n: plan.conversationMinutes })}</div>
          <div className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
            {t("plan.convSessionDesc")}
          </div>
        </Link>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40">
          <div className="text-2xl">⏰</div>
          <div className="mt-1 font-bold">
            {settings?.scheduleEnabled
              ? t("plan.scheduleToday", { time: settings.scheduleTime ?? "—", n: settings?.scheduleDuration ?? 15 })
              : t("plan.scheduleTitle")}
          </div>
          <div className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
            {settings?.scheduleEnabled
              ? t("plan.scheduleOn", { n: plan.reviewsPerDay })
              : t("plan.scheduleOff")}
          </div>
          <Link href="/settings" className="mt-2 inline-block text-xs font-bold text-amber-700 underline dark:text-amber-300">
            {t("plan.scheduleCta")}
          </Link>
        </div>
      </section>

      {/* محطات الخطة (Milestones) */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 font-bold">{t("plan.milestonesTitle")}</h2>
        <div className="flex flex-col gap-4">
          {plan.milestones.map((m) => {
            const reached = daysActive >= m.day;
            return (
              <div key={m.day} className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                    reached ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                  }`}
                >
                  {reached ? "✓" : m.day}
                </div>
                <div>
                  <div className="font-bold">
                    {reached ? "🎉 " : ""}
                    {lang === "en" ? m.titleEn : m.title}
                  </div>
                  <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {lang === "en" ? m.messageEn : m.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* إنجازات اليوم ونقاط */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-2xl">{gama.icon}</div>
          <div className="mt-1 text-xl font-extrabold tabular-nums">{profile.xp}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{lang === "en" ? gama.titleEn : gama.title} • XP</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-2xl">🏆</div>
          <div className="mt-1 text-xl font-extrabold tabular-nums">{mastered}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("plan.masteredWords")}</div>
        </div>
      </section>

      {/* الشارات */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 font-bold">{t("plan.badgesTitle")}</h2>
        <div className="flex flex-wrap gap-3">
          {BADGES.map((b) => {
            const earned = profile.badges.includes(b.id) || (b.id === "plan-done" && daysActive >= plan.days);
            return (
              <div
                key={b.id}
                title={b.desc}
                className={`flex flex-col items-center rounded-2xl border p-3 text-center transition-opacity ${
                  earned
                    ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40"
                    : "border-slate-200 opacity-40 grayscale dark:border-slate-700"
                }`}
              >
                <div className="text-3xl">{b.icon}</div>
                <div className="mt-1 text-xs font-bold">{lang === "en" ? b.titleEn : b.title}</div>
                <div className="text-[10px] text-slate-400">{lang === "en" ? b.descEn : b.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/learn"
          className="flex-1 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-5 py-3 text-center font-bold text-white shadow transition-transform hover:scale-[1.02]"
        >
          {t("plan.startSession")}
        </Link>
        <Link
          href="/quiz"
          className="flex-1 rounded-2xl border-2 border-slate-300 px-5 py-3 text-center font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("plan.quizChallenge")}
        </Link>
      </div>

      <p className="text-center text-xs text-slate-400">
        {t("plan.footer", { days: daysActive, total: plan.days, today: todayLearned })}
      </p>
    </div>
  );
}