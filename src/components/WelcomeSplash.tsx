"use client";

import { useState } from "react";
import { ISLAMIC_MESSAGES, pickIslamicMessage, type IslamicMessage } from "@/data/islamicMessages";
import { useT } from "@/hooks/useT";

export function WelcomeSplash() {
  const { t } = useT();
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [message] = useState<IslamicMessage>(() => {
    if (typeof window !== "undefined") {
      const key = "erp-vocab:islamsplash";
      const last = window.sessionStorage.getItem(key);
      let idx = 0;
      if (last !== null) {
        const n = parseInt(last, 10);
        idx = Number.isNaN(n) ? 0 : (n + 1) % ISLAMIC_MESSAGES.length;
      } else {
        idx = Math.floor(Math.random() * ISLAMIC_MESSAGES.length);
      }
      window.sessionStorage.setItem(key, String(idx));
      return ISLAMIC_MESSAGES[idx];
    }
    return pickIslamicMessage(123456789);
  });

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        setFading(true);
        setTimeout(() => setVisible(false), 300);
      }}
      aria-label={t("welcome.tap")}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-emerald-700 via-teal-700 to-sky-700 px-5 text-center text-white transition-opacity duration-500 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-5xl drop-shadow-lg">📘</div>
      <div className="text-xl font-extrabold tracking-tight">{t("common.appName")}</div>
      <div className="h-px w-20 bg-white/40" />
      <div className="flex min-h-[6rem] max-w-md flex-col items-center justify-center gap-2 px-1">
        {message ? (
          <>
            <p lang="ar" dir="rtl" className="text-2xl font-bold leading-9 drop-shadow-md">
              {message.ar}
            </p>
            <p lang="en" dir="ltr" className="text-base leading-7 text-emerald-50/95">
              {message.en}
            </p>
            <span className="text-[11px] font-medium text-emerald-100/80">
              {message.sourceAr} · {message.sourceEn}
            </span>
          </>
        ) : null}
      </div>
      <p className="mt-2 max-w-sm text-sm text-emerald-50/90">{t("welcome.subtitle")}</p>
      <span className="mt-2 rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white/95 shadow-sm">
        {t("welcome.tap")}
      </span>
    </button>
  );
}
