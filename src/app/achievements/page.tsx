"use client";

import Link from "next/link";
import { BADGES, gamificationLevel, PLAN_META } from "@/lib/plan";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";

export default function AchievementsPage() {
  const { t, lang } = useT();
  const { profile, stats, progress } = useProgress();

  if (!profile) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="text-5xl">🏆</div>
        <p className="text-slate-600 dark:text-slate-300">{t("lesson.noProfile")}</p>
        <Link
          href="/settings"
          className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white dark:bg-white dark:text-slate-900"
        >
          {t("nav.settings")}
        </Link>
      </div>
    );
  }

  const allReviews = Object.values(progress);
  const mastered = allReviews.filter((p) => p.reps >= 5 && p.interval >= 21).length;
  const level = gamificationLevel(profile.xp);
  const earned = new Set(profile.badges ?? []);
  const meta = PLAN_META[profile.level];

  const stat = (icon: string, label: string, value: string | number) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
      <div className="text-2xl">{icon}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("achievements.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("achievements.subtitle")}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:border-slate-800 dark:from-emerald-950/40 dark:to-teal-950/40">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{level.icon}</span>
          <div className="flex-1">
            <div className="font-bold text-slate-900 dark:text-white">
              {lang === "en" ? level.titleEn : level.title}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {profile.xp} {t("achievements.points")}
            </div>
          </div>
        </div>
        {level.next && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{lang === "en" ? level.next.titleEn : level.next.title}</span>
              <span>{level.progressTowardsNext}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${level.progressTowardsNext}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stat("⭐", t("achievements.points"), profile.xp)}
        {stat("🔥", t("achievements.streak"), stats?.streak ?? 0)}
        {stat("🏅", t("achievements.mastered"), mastered)}
        {stat("🏆", t("achievements.badges"), earned.size)}
      </div>

      <section>
        <h2 className="mb-3 font-bold">{t("achievements.badges")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BADGES.map((b) => {
            const has = earned.has(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-2xl border p-4 text-center transition-opacity ${
                  has
                    ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
                    : "border-slate-200 bg-white opacity-50 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div className={`text-3xl ${has ? "" : "grayscale"}`}>{has ? b.icon : "🔒"}</div>
                <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {lang === "en" ? b.titleEn ?? b.title : b.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === "en" ? b.descEn ?? b.desc : b.desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-bold">{t("achievements.plan")}</h2>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{meta.icon}</span>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                {lang === "en" ? meta.titleEn : meta.title}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {t("achievements.level")}: {profile.level} · {profile.name}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Link
        href="/progress"
        className="rounded-2xl bg-slate-900 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {t("achievements.progress")} ←
      </Link>
    </div>
  );
}
