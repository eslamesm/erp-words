"use client";

import { useEffect, useState } from "react";
import { useT } from "@/hooks/useT";

// رسالة استقبال تظهر عند فتح التطبيق وتحمل الحكمة: «من جدّ وجد ومن زرع حصد».
export function WelcomeSplash() {
  const { t } = useT();
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const hide = setTimeout(() => setFading(true), 2600);
    const remove = setTimeout(() => setVisible(false), 3200);
    return () => {
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        setFading(true);
        setTimeout(() => setVisible(false), 300);
      }}
      aria-label={t("welcome.tap")}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-6 text-center text-white transition-opacity duration-500 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-6xl drop-shadow-lg">📘</div>
      <div className="text-2xl font-extrabold tracking-tight">{t("common.appName")}</div>
      <div className="h-px w-24 bg-white/40" />
      <p className="max-w-xs text-lg font-bold leading-8 drop-shadow">{t("welcome.proverb")}</p>
      <p className="max-w-xs text-sm text-emerald-50/90">{t("welcome.subtitle")}</p>
      <span className="mt-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white/90">
        {t("welcome.tap")}
      </span>
    </button>
  );
}
