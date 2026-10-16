"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { profileStore, progressStore, settingsStore, statsStore } from "@/lib/storage";
import { PLANS, reviewsToday } from "@/lib/plan";
import { normalizeLang, translate } from "@/lib/i18n";
import { useT } from "@/hooks/useT";
import { atOrAfterStart, countDueWords, inScheduleWindow, minutesOfDay, parseTime } from "@/lib/reminder";
import { dayKey } from "@/lib/dates";

// مفتاح آخر يوم أُرسل فيه إشعار (منع التكرار عبر إعادة التحميل).
const NOTIFIED_DAY_KEY = "erp-vocab:reminder-notified-day";

interface ReminderState {
  active: boolean;
  remaining: number;
}

/**
 * يعرض إشعارًا عبر Service Worker (يعمل داخل PWA على أندرويد بخلاف new Notification)،
 * ويرجع نجاح الإرسال. البريد/الخادم غير مطلوبين: يعمل أثناء فتح التطبيق فقط.
 */
async function showReminder(title: string, body: string): Promise<boolean> {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return false;
  const options: NotificationOptions = {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "erp-daily-reminder",
    data: { url: "/learn" },
  };
  try {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
      return true;
    }
  } catch {
    // نتابع إلى المسار الاحتياطي
  }
  try {
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

function readNotifiedDay(): string | null {
  try {
    return typeof window !== "undefined" ? window.localStorage.getItem(NOTIFIED_DAY_KEY) : null;
  } catch {
    return null;
  }
}

function writeNotifiedDay(day: string) {
  try {
    window.localStorage.setItem(NOTIFIED_DAY_KEY, day);
  } catch {
    // التخزين غير متاح
  }
}

export function useScheduleReminder(): ReminderState {
  const [state, setState] = useState<ReminderState>({ active: false, remaining: 0 });

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      const settings = settingsStore.read();
      const profile = profileStore.read();
      const stats = statsStore.read();
      const lang = normalizeLang(settings?.language);
      const plan = profile ? PLANS.find((p) => p.id === profile.planType) ?? null : null;

      const dueWords = countDueWords(progressStore.read());
      const planRemaining = plan ? Math.max(0, (plan.reviewsPerDay ?? 10) - reviewsToday(stats?.history)) : 0;
      // نُبقي تذكير الخطة للجديد حتى لو لم توجد كلمات مستحقة بعد.
      const remaining = dueWords > 0 ? dueWords : planRemaining;

      const enabled = !!profile && !!settings?.scheduleEnabled && !!settings.scheduleTime;
      const start = parseTime(settings?.scheduleTime);
      const duration = settings?.scheduleDuration ?? 15;
      const cur = minutesOfDay();
      const inWindow = inScheduleWindow(cur, start, duration);
      const afterTime = atOrAfterStart(cur, start);

      const active = enabled && inWindow && remaining > 0;
      if (!cancelled) setState({ active, remaining });

      // إشعار واحد يوميًا عند/بعد الموعد إن وُجدت كلمات مستحقة (التقاط إن فات الموعد).
      if (enabled && remaining > 0 && (inWindow || afterTime)) {
        const today = dayKey(0);
        if (readNotifiedDay() !== today) {
          const ok = await showReminder(
            translate(lang, "reminder.title"),
            translate(lang, "reminder.body", { n: dueWords > 0 ? dueWords : planRemaining })
          );
          if (ok) writeNotifiedDay(today);
        }
      }
    };

    void tick();
    const id = window.setInterval(() => void tick(), 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return state;
}

export function ScheduleReminder() {
  const { active, remaining } = useScheduleReminder();
  const { t } = useT();
  const [hidden, setHidden] = useState(false);
  if (!active || hidden) return null;
  return (
    <div className="fixed inset-x-3 bottom-16 z-30 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-lg sm:bottom-3 dark:border-amber-800 dark:bg-amber-950/90 dark:text-amber-100">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⏰</span>
        <div className="flex-1">
          <div className="font-bold text-amber-900 dark:text-amber-100">{t("reminder.bannerTitle")}</div>
          <div className="text-xs text-amber-800 dark:text-amber-200">
            {t("reminder.bannerDesc", { n: remaining })}
          </div>
        </div>
        <button
          onClick={() => setHidden(true)}
          aria-label={t("reminder.hide")}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900"
        >
          ✕
        </button>
      </div>
      <Link
        href="/learn"
        className="mt-2 block w-full rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 px-4 py-2.5 text-center text-sm font-bold text-white shadow"
      >
        {t("reminder.start")}
      </Link>
    </div>
  );
}
