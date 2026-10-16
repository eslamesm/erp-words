"use client";

import { useEffect, useState } from "react";
import { ISLAMIC_MESSAGES, type IslamicMessage } from "@/data/islamicMessages";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";

function nextMessage(): IslamicMessage {
  const key = "erp-vocab:islam-splash";
  let index = Math.floor(Math.random() * ISLAMIC_MESSAGES.length);
  try {
    const last = window.sessionStorage.getItem(key);
    if (last !== null) {
      const n = parseInt(last, 10);
      if (!Number.isNaN(n)) index = (n + 1) % ISLAMIC_MESSAGES.length;
    }
    window.sessionStorage.setItem(key, String(index));
  } catch {
    // تجاهل
  }
  return ISLAMIC_MESSAGES[index];
}

export function WelcomeSplash() {
  const { t } = useT();
  const { settings } = useProgress();
  const [visible, setVisible] = useState(true);
  const [message, setMessage] = useState<IslamicMessage | null>(null);

  useEffect(() => {
    const pick = setTimeout(() => setMessage(nextMessage()), 0);
    return () => clearTimeout(pick);
  }, []);

  if (!visible || !(settings?.welcomeSplash ?? true)) return null;

  return (
    <SplashScreen interactive onDone={() => setVisible(false)}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, maxWidth: "28rem", padding: "0 4px" }}>
        {message ? (
          <>
            <p lang="ar" dir="rtl" style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, lineHeight: 1.9 }}>
              {message.ar}
            </p>
            <p lang="en" dir="ltr" style={{ margin: 0, fontSize: ".95rem", lineHeight: 1.8, color: "var(--muted)" }}>
              {message.en}
            </p>
            <span style={{ fontSize: ".7rem", color: "var(--muted)" }}>
              {message.sourceAr} · {message.sourceEn}
            </span>
          </>
        ) : null}
        <p style={{ marginTop: 8, fontSize: ".85rem", color: "var(--muted)" }}>{t("welcome.subtitle")}</p>
        <span
          style={{
            marginTop: 6,
            borderRadius: 999,
            background: "var(--tint)",
            color: "var(--navy)",
            padding: "8px 20px",
            fontSize: ".85rem",
            fontWeight: 700,
          }}
        >
          {t("welcome.tap")}
        </span>
      </div>
    </SplashScreen>
  );
}
