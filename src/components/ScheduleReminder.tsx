"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { profileStore, settingsStore, statsStore } from "@/lib/storage";
import { PLANS, reviewsToday } from "@/lib/plan";

interface ReminderState {
  active: boolean;
  remaining: number;
}

export function useScheduleReminder(): ReminderState {
  const [state, setState] = useState<ReminderState>({ active: false, remaining: 0 });

  useEffect(() => {
    let lastNotify = 0;
    const tick = () => {
      const settings = settingsStore.read();
      const stats = statsStore.read();
      const profile = profileStore.read();
      const plan = profile ? PLANS.find((p) => p.id === profile.planType) ?? null : null;
      const enabled = !!settings?.scheduleEnabled && !!settings.scheduleTime;
      const [h, m] = (settings?.scheduleTime ?? "").split(":").map(Number);
      const dur = settings?.scheduleDuration ?? 15;
      const start = Number.isFinite(h) ? h * 60 + m : NaN;
      const d = new Date();
      const cur = d.getHours() * 60 + d.getMinutes();
      let inWindow = false;
      if (Number.isFinite(start)) {
        const end = start + dur;
        inWindow = end <= 1440 ? cur >= start && cur < end : cur >= start || cur < end - 1440;
      }
      const target = plan?.reviewsPerDay ?? 10;
      const done = plan ? reviewsToday(stats?.history) : 0;
      const remaining = Math.max(0, target - done);
      const active = !!profile && enabled && inWindow && remaining > 0;
      setState({ active, remaining });

      if (active && Date.now() - lastNotify >= 60000) {
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification("⏰ حان وقت تدريبك اليومي", {
              body: `بقي ${remaining} مراجعة لاستكمال خطة اليوم. افتح التطبيق لإتمام مهمتك.`,
            });
            lastNotify = Date.now();
          } catch {
            // المتصفح يمنع إشعار الوكالة
          }
        }
      } else if (!active) {
        lastNotify = 0;
      }
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return state;
}

export function ScheduleReminder() {
  const { active, remaining } = useScheduleReminder();
  const [hidden, setHidden] = useState(false);
  if (!active || hidden) return null;
  return (
    <div className="fixed inset-x-3 bottom-16 z-30 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-lg sm:bottom-3 dark:border-amber-800 dark:bg-amber-950/90 dark:text-amber-100">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⏰</span>
        <div className="flex-1">
          <div className="font-bold text-amber-900 dark:text-amber-100">حان وقت تدريبك اليومي</div>
          <div className="text-xs text-amber-800 dark:text-amber-200">
            متبقٍّ {remaining} مراجعة لاستكمال مهام الخطة اليوم
          </div>
        </div>
        <button
          onClick={() => setHidden(true)}
          aria-label="إخفاء"
          className="rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900"
        >
          ✕
        </button>
      </div>
      <Link
        href="/learn"
        className="mt-2 block w-full rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 px-4 py-2.5 text-center text-sm font-bold text-white shadow"
      >
        ابدأ الآن ←
      </Link>
    </div>
  );
}