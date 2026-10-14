"use client";

import { useEffect, useState } from "react";
import { pickIslamicMessage, type IslamicMessage } from "@/data/islamicMessages";
import { useT } from "@/hooks/useT";

export function WelcomeSplash() {
  const { t } = useT();
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [message, setMessage] = useState<IslamicMessage | null>(null);

  useEffect(() => {
    const show = setTimeout(() => setMessage(pickIslamicMessage()), 0);
    const hide = setTimeout(() => setFading(true), 2600);
    const remove = setTimeout(() => setVisible(false), 3200);
    return () => {
      clearTimeout(show);
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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-6 text-center text-white transition-opacity duration-500 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-6xl drop-shadow-lg">📘</div>
      <div className="text-2xl font-extrabold tracking-tight">{t("common.appName")}</div>
      <div className="h-px w-24 bg-white/40" />
      <div className="flex min-h-[7.5rem] max-w-sm flex-col items-center justify-center gap-1.5">
        {message ? (
          <>
            <p lang="ar" dir="rtl" className="text-lg font-bold leading-8 drop-shadow">
              {message.ar}
            </p>
            <p lang="en" dir="ltr" className="text-sm leading-6 text-emerald-50/90">
              {message.en}
            </p>
            <span className="text-[11px] font-semibold text-emerald-100/70">
              {message.sourceAr} · {message.sourceEn}
            </span>
          </>
        ) : null}
      </div>
      <p className="max-w-xs text-sm text-emerald-50/90">{t("welcome.subtitle")}</p>
      <span className="mt-1 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white/90">
        {t("welcome.tap")}
      </span>
    </button>
  );
}
