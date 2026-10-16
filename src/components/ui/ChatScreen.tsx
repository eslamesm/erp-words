"use client";

import React from "react";
import { LogoMark } from "./Logo";
import { IconMore, IconKeyboard, IconMic, IconSend } from "./icons";
import { useT } from "@/hooks/useT";
import type { AssistantChip, AssistantMessage, AssistantOption } from "@/lib/assistant";
import type { Rating } from "@/types";

export type VoiceState = "idle" | "listening" | "transcribing" | "thinking" | "speaking";

const RATES: { id: Rating; key: string }[] = [
  { id: "again", key: "assist.rateAgain" },
  { id: "hard", key: "assist.rateHard" },
  { id: "good", key: "assist.rateGood" },
  { id: "easy", key: "assist.rateEasy" },
];

export interface ChatScreenProps {
  variant: "page" | "widget";
  aiReady: boolean;
  messages: AssistantMessage[];
  busy: boolean;
  streamingId: string | null;
  speakingId: string | null;
  voice: VoiceState;
  micError: string | null;
  chips?: AssistantChip[];
  rated: Record<string, boolean>;
  input: string;
  micLang: "en" | "ar";
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: (v: string) => void;
  onSend: (raw?: string, display?: string) => void;
  onMic: () => void;
  onToggleMicLang: () => void;
  onStopSpeech: () => void;
  onSpeak: (m: AssistantMessage) => void;
  onRate: (m: AssistantMessage, r: Rating) => void;
  onOption: (o: AssistantOption) => void;
  onChip: (c: AssistantChip) => void;
  onRetry: (m: AssistantMessage, forceLocal: boolean) => void;
  onNewTopic: () => void;
  onOpenSettings: () => void;
}

function fmtTime(ts: number): string {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function ChatScreen(props: ChatScreenProps) {
  const {
    variant, aiReady, messages, busy, streamingId, speakingId, voice, micError, chips, rated,
    input, micLang, inputRef, onInputChange, onSend, onMic, onToggleMicLang, onStopSpeech,
    onSpeak, onRate, onOption, onChip, onRetry, onNewTopic, onOpenSettings,
  } = props;
  const { t } = useT();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, busy]);

  const badge = aiReady ? t("assist.aiBadge") : t("assist.offlineBadge");

  return (
    <div className={`erp-app erp-app--embed ${variant === "widget" ? "flex h-full min-h-0 flex-col" : ""}`}>
      {/* الرأس */}
      {variant === "widget" ? (
        <div className="flex items-center justify-between">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${aiReady ? "bg-sky-600" : "bg-slate-500"}`}>{badge}</span>
          <button
            onClick={onNewTopic}
            className="rounded-lg border px-3 py-1 text-xs font-semibold"
            style={{ borderColor: "var(--border)", color: "var(--muted)", background: "transparent" }}
          >
            {t("assist.newTopic")}
          </button>
        </div>
      ) : (
        <header className="chat__head" style={{ position: "relative" }}>
          <LogoMark size={36} />
          <div className="title"><b>ERP Words</b><small>{t("ui.chat.subtitle")}</small></div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${aiReady ? "bg-sky-600" : "bg-slate-500"}`}>{badge}</span>
          <button className="icon-btn" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}><IconMore /></button>
          {menuOpen && (
            <div
              className="absolute end-2 top-12 z-30 min-w-[160px] overflow-hidden rounded-xl border shadow-lg"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              <button className="drawer__item" style={{ minHeight: 40 }} onClick={() => { setMenuOpen(false); onNewTopic(); }}>
                {t("assist.newTopic")}
              </button>
              <button className="drawer__item" style={{ minHeight: 40 }} onClick={() => { setMenuOpen(false); onOpenSettings(); }}>
                {t("assist.settingsLink")}
              </button>
            </div>
          )}
        </header>
      )}

      {/* الجسم */}
      <div className={`chat__body ${variant === "widget" ? "flex-1 min-h-0" : "chat__body--embed"}`} role="log" aria-live="polite">
        {messages.length === 0 && (
          <>
            <div className="row-ai">
              <LogoMark size={32} />
              <div className="msg msg--ai">{t("ui.chat.greeting")}</div>
            </div>
            <div style={{ margin: "auto", maxWidth: 360, textAlign: "center", color: "var(--muted)", fontSize: ".85rem" }}>
              <div style={{ fontWeight: 600, color: "var(--text)" }}>{t("assist.emptyTitle")}</div>
              <p style={{ marginTop: 4 }}>{t("assist.emptyHint")}</p>
            </div>
          </>
        )}

        {messages.map((m) => {
          if (m.error) {
            return (
              <div key={m.id} className="msg msg--error" role="alert">
                <div style={{ fontWeight: 600 }}>{t("assist.errTitle")}</div>
                <p style={{ margin: "4px 0 0" }}>{m.content}</p>
                {m.error.detail && <p style={{ margin: "4px 0 0", fontSize: ".75rem", opacity: 0.85 }}>{m.error.detail}</p>}
                <div className="msg__actions">
                  <button onClick={() => onRetry(m, false)}>{t("assist.retry")}</button>
                  <button onClick={() => onRetry(m, true)}>{t("assist.useOffline")}</button>
                  <button onClick={onOpenSettings}>{t("assist.settingsLink")}</button>
                </div>
              </div>
            );
          }
          if (m.role === "user") {
            return <div key={m.id} className="msg msg--user">{m.content}<time>{fmtTime(m.ts)}</time></div>;
          }
          return (
            <div key={m.id} className="row-ai" style={{ flexDirection: "row" }}>
              <LogoMark size={32} />
              <div style={{ display: "flex", flexDirection: "column", maxWidth: "85%" }}>
                <div className="msg msg--ai">
                  {m.content || (m.id === streamingId ? "…" : "")}
                  <time>{fmtTime(m.ts)}</time>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => onSpeak(m)}
                    title={t("assist.speak")}
                    aria-label={t("assist.speak")}
                    className="chip"
                    style={speakingId === m.id ? { background: "var(--tint)", color: "var(--blue)" } : undefined}
                  >
                    {t("assist.speak")}
                  </button>
                  {m.wordIds && m.wordIds.length > 0 && (
                    rated[m.id] ? (
                      <span style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--teal)" }}>{t("assist.rated")}</span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".75rem", color: "var(--muted)" }}>
                        {t("assist.rateWord")}
                        {RATES.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => onRate(m, r.id)}
                            className="chip"
                            style={{ padding: "4px 10px", borderColor: "var(--border)", color: "var(--text)" }}
                          >
                            {t(r.key)}
                          </button>
                        ))}
                      </span>
                    )
                  )}
                  {m.options && m.options.length > 0 && !busy && (
                    <div className="chips" style={{ padding: 0 }}>
                      {m.options.map((o, i) => (
                        <button key={`${m.id}-opt-${i}`} className="chip" onClick={() => onOption(o)}>{o.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {busy && !streamingId && (
          <div className="row-ai">
            <LogoMark size={32} />
            <div className="msg msg--ai">{voice === "transcribing" ? t("assist.voiceTranscribing") : t("assist.thinking")}</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {chips && chips.length > 0 && !busy && (
        <div className="chips">
          {chips.map((c) => (
            <button key={c} className="chip" onClick={() => onChip(c)}>{t(`chip.${c}`)}</button>
          ))}
        </div>
      )}

      {micError && (
        <div style={{ marginTop: 8, borderRadius: 10, background: "#fef3c7", color: "#92400e", padding: "4px 8px", textAlign: "center", fontSize: ".75rem" }}>
          {micError}
        </div>
      )}

      <p className="privacy">{aiReady ? t("ui.chat.privacy") : `${t("assist.offlineMode")} · ${t("assist.settingsLink")}`}</p>

      <form
        className="composer"
        onSubmit={(e) => { e.preventDefault(); onSend(); }}
      >
        <div className="composer__field">
          <span style={{ color: "var(--muted)", display: "grid" }}><IconKeyboard size={20} /></span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onFocus={() => onStopSpeech()}
            placeholder={voice === "listening" ? t("assist.listening") : t("assist.placeholder")}
            aria-label={t("assist.placeholder")}
            enterKeyHint="send"
          />
          <button
            type="button"
            onClick={onToggleMicLang}
            title={micLang === "ar" ? t("assist.micLangAr") : t("assist.micLangEn")}
            style={{ border: 0, background: "transparent", color: "var(--muted)", font: "inherit", fontSize: ".7rem", textTransform: "uppercase", cursor: "pointer" }}
          >
            {micLang}
          </button>
        </div>
        {input.trim() ? (
          <button type="submit" className="mic" aria-label={t("assist.send")} disabled={busy}><IconSend /></button>
        ) : (
          <button type="button" className="mic" aria-label={t("assist.listen")} onClick={onMic}><IconMic /></button>
        )}
      </form>
    </div>
  );
}
