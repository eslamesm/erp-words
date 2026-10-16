"use client";

import React from "react";
import { LogoMark } from "./Logo";
import { IconMic } from "./icons";
import { useT } from "@/hooks/useT";

// نفس حالات المنطق الحالي: idle / listening / transcribing / thinking / speaking
export type VoiceState = "idle" | "listening" | "transcribing" | "thinking" | "speaking";

export function VoiceScreen({ state, onCancel }: { state: VoiceState; onCancel: () => void }) {
  const { t } = useT();
  const title =
    state === "listening" ? t("assist.listening") :
    state === "transcribing" ? t("assist.voiceTranscribing") :
    state === "thinking" ? t("assist.thinking") :
    state === "speaking" ? t("assist.voiceSpeaking") : t("assist.listening");
  const showWave = state === "listening" || state === "speaking";

  return (
    <div className="erp-app erp-app--embed">
      <header className="topbar" style={{ padding: 16 }}>
        <span className="logo logo--compact" dir="ltr" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LogoMark size={36} />
          <span className="logo__text">
            <span className="logo__word" style={{ fontSize: "1rem" }}>ERP Words</span>
            <span className="logo__tag">{t("ui.chat.subtitle")}</span>
          </span>
        </span>
      </header>

      <div className={`erp-screen voice erp-screen--flush ${state === "idle" ? "voice--idle" : ""}`} aria-live="polite">
        <div className="voice__orb"><div className="voice__core"><IconMic size={44} /></div></div>
        <h2 className="voice__state">{title}</h2>
        {state === "listening" && <p className="voice__sub">{t("ui.voice.sub")}</p>}

        {showWave && (
          <div className="wave" aria-hidden="true">
            {Array.from({ length: 28 }).map((_, i) => (
              <i key={i} style={{ animationDelay: `${(i % 7) * 0.12}s` }} />
            ))}
          </div>
        )}

        <button className="btn btn--ghost" style={{ maxWidth: 320 }} onClick={onCancel}>{t("common.cancel")}</button>
      </div>
    </div>
  );
}
