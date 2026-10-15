"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useT } from "@/hooks/useT";
import { useProgress } from "@/hooks/useProgress";
import type { AssistantChip, AssistantMessage, AssistantMessageError, AssistantOption } from "@/lib/assistant";
import { newAssistantState } from "@/lib/assistant";
import { assistantRespond, learnerSnapshot } from "@/lib/assistantEngine";
import {
  AiError,
  aiChat,
  aiErrorMessageKey,
  isAiConfigured,
  readAiConfig,
  type AiChatMessage,
  type AiErrorCode,
} from "@/lib/ai";
import { getPath, getRole, roleLabel } from "@/lib/assistantRole";
import { buildKnowledgeBlock, careerPathById, retrieve } from "@/lib/assistantKnowledge";
import { speak, stop as stopSpeech } from "@/lib/speech";
import { useTodayKey } from "@/lib/today";
import type { Rating } from "@/types";

interface Recognizer {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e?: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type RecognizerCtor = new () => Recognizer;

type VoiceState = "idle" | "listening" | "transcribing" | "thinking" | "speaking";

function newMessage(
  role: "user" | "assistant",
  content: string,
  extra?: {
    wordIds?: string[];
    chips?: AssistantChip[];
    options?: AssistantOption[];
    error?: AssistantMessageError;
  }
): AssistantMessage {
  return {
    id: `${role[0]}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    ts: Date.now(),
    ...extra,
  };
}

function getRecognizerCtor(): RecognizerCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: RecognizerCtor;
    webkitSpeechRecognition?: RecognizerCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** اللغة الغالبة على النص (عربي/إنجليزي) بناءً على عدد الحروف. */
function dominantLang(text: string): "ar" | "en" {
  const ar = (text.match(/[\u0600-\u06FF]/g) ?? []).length;
  const en = (text.match(/[A-Za-z]/g) ?? []).length;
  return ar > en ? "ar" : "en";
}

/** يبني توجيه النظام: قواعد اللغة + حالة المستخدم + المعرفة المسترجعة. */
function buildSystemPrompt(
  userText: string,
  ctx: { lang: string; level: string; native: string }
): string {
  const snap = learnerSnapshot();
  const knowledge = buildKnowledgeBlock(retrieve(userText, { limit: 5 }));
  const path = careerPathById(getPath());
  const role = getRole();

  const rules = [
    "You are a specialized English tutor for ERP (Enterprise Resource Planning) professionals.",
    "Teach practical workplace English used in ERP modules: finance, purchasing, inventory, sales, HR, projects, IT, and customer support.",
    "LANGUAGE RULE (highest priority): always answer in the same language as the user's latest message.",
    "- If the user writes in Arabic, answer in Arabic (keep ERP technical terms in English).",
    "- If the user writes in English, answer in English.",
    "- Never switch language on your own; switch only if the user explicitly asks.",
    "- The app UI language is NOT the conversation language.",
    "KNOWLEDGE RULE: when [APP_KNOWLEDGE] is present, prefer it for facts about ERP terms, career paths, interviews and scenarios, and mention the source title.",
    "Keep answers concise and adapted to the learner's CEFR level. Gently correct grammar and show the improved version.",
    "Never reveal or repeat the user's API key, and never invent facts not supported by the knowledge block.",
  ];
  const stateLines = [
    "[USER_STATE]",
    `ui_language: ${ctx.lang}`,
    `cefr_level: ${ctx.level}`,
    `native_language: ${ctx.native}`,
    role ? `job_role: ${roleLabel(role, "en")}` : "",
    path ? `career_path: ${path.title} (${path.titleAr})` : "",
    snap.lesson.length ? `today_lesson: ${snap.lesson.join(", ")}` : "",
    snap.weak.length ? `weak_words: ${snap.weak.join(", ")}` : "",
  ].filter(Boolean);

  return [rules.join("\n"), stateLines.join("\n"), knowledge].filter(Boolean).join("\n\n");
}

const CHIP_PROMPT: Record<AssistantChip, { en: string; ar: string }> = {
  dailyLesson: { en: "Today's lesson", ar: "درس اليوم" },
  weak: { en: "Review weak words", ar: "مراجعة الكلمات الضعيفة" },
  random: { en: "Random word", ar: "كلمة عشوائية" },
  interview: { en: "Interview practice", ar: "تدريب مقابلة" },
  writeEmail: { en: "Write a professional email", ar: "اكتب بريدًا مهنيًا" },
  correct: { en: "Correct my sentence: ", ar: "صوّب جملتي: " },
};

export function AssistantChat({ variant = "page" }: { variant?: "page" | "widget" }) {
  const { t, lang } = useT();
  const { profile, settings, rate } = useProgress();
  const today = useTodayKey();
  const [state, setState] = useState(newAssistantState());
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [voice, setVoice] = useState<VoiceState>("idle");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [micLangOverride, setMicLangOverride] = useState<"en" | "ar" | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [rated, setRated] = useState<Record<string, boolean>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<Recognizer | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      const ready = isAiConfigured();
      setAiReady(ready);
      setVoice("idle");
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [state.messages, busy]);

  const micLang: "en" | "ar" = micLangOverride ?? (lang === "ar" ? "ar" : "en");

  function push(message: AssistantMessage) {
    setState((prev) => ({ ...prev, messages: [...prev.messages, message] }));
  }

  function updateMessage(id: string, patch: Partial<AssistantMessage>) {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }

  function removeMessage(id: string) {
    setState((prev) => ({ ...prev, messages: prev.messages.filter((m) => m.id !== id) }));
  }

  function scriptFor(text: string): { re: RegExp; lang: "ar" | "en" } {
    const l = dominantLang(text);
    return { re: l === "ar" ? /[\u0600-\u06FF]{2,}/ : /[A-Za-z]{2,}/, lang: l };
  }

  function speakMessage(message: AssistantMessage) {
    const { re, lang: l } = scriptFor(message.content);
    const text = message.content
      .split("\n")
      .filter((line) => re.test(line))
      .join("\n")
      .replace(/[*#`_>]/g, "")
      .trim();
    if (!text) return;
    stopSpeech();
    setSpeakingId(message.id);
    setVoice("speaking");
    speak(text, {
      lang: l === "ar" ? "ar-SA" : "en-US",
      rate: settings?.voiceRate ?? 0.95,
      onEnd: () => {
        setVoice("idle");
        setSpeakingId(null);
      },
    });
  }

  function toggleMic() {
    if (voice === "listening") {
      recRef.current?.stop();
      setVoice("idle");
      return;
    }
    const Ctor = getRecognizerCtor();
    if (!Ctor) {
      setMicError(t("assist.micUnsupported"));
      return;
    }
    setMicError(null);
    stopSpeech();
    setVoice("listening");
    const rec = new Ctor();
    rec.lang = micLang === "ar" ? "ar-SA" : "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      setVoice("transcribing");
      if (transcript) setInput((v) => (v ? `${v} ${transcript}` : transcript));
    };
    rec.onerror = (e) => {
      if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
        setMicError(t("assist.micDenied"));
      }
      setVoice("idle");
    };
    rec.onend = () => setVoice((v) => (v === "listening" || v === "transcribing" ? "idle" : v));
    recRef.current = rec;
    rec.start();
  }

  function buildHistory(userText: string): AiChatMessage[] {
    return [
      { role: "system", content: buildSystemPrompt(userText, { lang, level: profile?.level ?? "A2", native: profile?.nativeLanguage ?? "العربية" }) },
      ...state.messages
        .filter((m) => !m.error && m.content.trim())
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userText },
    ];
  }

  function respondLocal(userText: string) {
    const r = assistantRespond(userText, { pathId: getPath() ?? undefined });
    push(newMessage("assistant", r.text, { wordIds: r.wordIds, chips: r.chips, options: r.options }));
    setBusy(false);
    setVoice("idle");
  }

  async function run(userText: string, opts: { forceLocal?: boolean } = {}) {
    setBusy(true);
    setVoice("thinking");
    const cfg = readAiConfig();
    if (opts.forceLocal || !isAiConfigured(cfg)) {
      respondLocal(userText);
      return;
    }

    const history = buildHistory(userText);
    const placeholder = newMessage("assistant", "");
    push(placeholder);
    setStreamingId(placeholder.id);
    try {
      const reply = await aiChat(history, cfg, {
        onToken: (_tok, full) => updateMessage(placeholder.id, { content: full }),
      });
      updateMessage(placeholder.id, { content: reply });
      setStreamingId(null);
      setBusy(false);
      setVoice("idle");
    } catch (e) {
      removeMessage(placeholder.id);
      setStreamingId(null);
      const code: AiErrorCode = e instanceof AiError ? e.code : "unknown";
      const detail = e instanceof AiError ? e.detail : undefined;
      push(
        newMessage("assistant", t(aiErrorMessageKey(code)), {
          error: { code, detail, retryText: userText },
        })
      );
      setBusy(false);
      setVoice("idle");
    }
  }

  function send(raw?: string, display?: string) {
    const msg = (raw ?? input).trim();
    if (!msg) return;
    stopSpeech();
    setInput("");
    push(newMessage("user", display ?? msg));
    void run(msg);
  }

  function retry(errMsgId: string, retryText: string, forceLocal = false) {
    removeMessage(errMsgId);
    void run(retryText, { forceLocal });
  }

  function onChip(chip: AssistantChip) {
    const prompt = CHIP_PROMPT[chip][lang === "en" ? "en" : "ar"];
    if (chip === "correct") {
      setInput(prompt);
      inputRef.current?.focus();
      return;
    }
    send(prompt);
  }

  function onOption(opt: AssistantOption) {
    send(opt.value, opt.label);
  }

  function rateWord(messageId: string, wordIds: string[], rating: Rating) {
    for (const id of wordIds) rate(id, rating);
    setRated((r) => ({ ...r, [messageId]: true }));
  }

  function newTopic() {
    setState(newAssistantState());
    setRated({});
    setMicError(null);
    stopSpeech();
    setVoice("idle");
  }

  const lastChips = state.messages.filter((m) => m.role === "assistant" && !m.error).slice(-1)[0]?.chips;

  const voiceLabel =
    voice === "listening"
      ? t("assist.listening")
      : voice === "transcribing"
        ? t("assist.voiceTranscribing")
        : voice === "speaking"
          ? t("assist.voiceSpeaking")
          : null;

  return (
    <div className={variant === "widget" ? "flex h-full min-h-0 flex-col" : "flex h-full min-h-0 flex-col"}>
      {variant === "widget" ? (
        <div className="flex items-center justify-between">
          {aiReady ? (
            <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold text-white">
              {t("assist.aiBadge")}
            </span>
          ) : (
            <span className="rounded-full bg-slate-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {t("assist.offlineBadge")}
            </span>
          )}
          <button
            onClick={newTopic}
            className="ms-auto rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("assist.newTopic")}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-bold text-lg">
              {t("nav.assistant")}
              {aiReady ? (
                <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  {t("assist.aiBadge")}
                </span>
              ) : (
                <span className="rounded-full bg-slate-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {t("assist.offlineBadge")}
                </span>
              )}
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t("assist.tagline")}</p>
          </div>
          <button
            onClick={newTopic}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("assist.newTopic")}
          </button>
        </div>
      )}

      <div
        ref={listRef}
        className={`mt-2 flex flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${
          variant === "widget" ? "flex-1 min-h-0" : "max-h-[60vh]"
        }`}
      >
        {state.messages.length === 0 && (
          <div className="m-auto max-w-sm text-center text-sm text-slate-500 dark:text-slate-400">
            <div className="text-3xl">🤖</div>
            <div className="mt-2 font-semibold text-slate-700 dark:text-slate-200">{t("assist.emptyTitle")}</div>
            <p className="mt-1">{t("assist.emptyHint")}</p>
            {profile?.level && (
              <p className="mt-1 text-xs">{t("assist.levelDate", { level: profile.level, date: today })}</p>
            )}
            {!aiReady && (
              <p className="mt-2 rounded-lg bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
                {t("assist.offlineMode")} ·{" "}
                <Link href="/settings" className="underline">
                  {t("assist.settingsLink")}
                </Link>
              </p>
            )}
          </div>
        )}

        {state.messages.map((m) => (
          <div key={m.id}>
            {m.error ? (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3 text-sm dark:border-rose-900 dark:bg-rose-950">
                <div className="font-semibold text-rose-700 dark:text-rose-300">
                  ⚠️ {t("assist.errTitle")}
                </div>
                <p className="mt-1 text-rose-700 dark:text-rose-300">{m.content}</p>
                {m.error.detail && (
                  <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{m.error.detail}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => retry(m.id, m.error!.retryText ?? "", false)}
                    className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    {t("assist.retry")}
                  </button>
                  <button
                    onClick={() => retry(m.id, m.error!.retryText ?? "", true)}
                    className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300"
                  >
                    {t("assist.useOffline")}
                  </button>
                  <Link
                    href="/settings"
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-700 underline dark:text-rose-300"
                  >
                    {t("assist.settingsLink")}
                  </Link>
                </div>
                {m.error.detail && <p className="mt-1 break-words text-[10px] text-rose-400/80">{m.error.detail}</p>}
              </div>
            ) : (
              <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="flex max-w-[85%] flex-col">
                  <div
                    className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      m.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {m.content || (m.id === streamingId ? "…" : "")}
                  </div>
                  {m.role === "assistant" && (
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => speakMessage(m)}
                        title={t("assist.speak")}
                        aria-label={t("assist.speak")}
                        className={`rounded-lg border px-2 py-1 text-xs transition-colors ${
                          speakingId === m.id
                            ? "border-sky-400 bg-sky-50 text-sky-600 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-300"
                            : "border-slate-300 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                        }`}
                      >
                        🔉
                      </button>
                      {m.wordIds && m.wordIds.length > 0 && (
                        rated[m.id] ? (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {t("assist.rated")}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            {t("assist.rateWord")}
                            {(
                              [
                                { id: "again" as Rating, label: t("assist.rateAgain") },
                                { id: "hard" as Rating, label: t("assist.rateHard") },
                                { id: "good" as Rating, label: t("assist.rateGood") },
                                { id: "easy" as Rating, label: t("assist.rateEasy") },
                              ]
                            ).map((r) => (
                              <button
                                key={r.id}
                                onClick={() => rateWord(m.id, m.wordIds!, r.id)}
                                className="rounded-lg border border-slate-300 px-2 py-0.5 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                              >
                                {r.label}
                              </button>
                            ))}
                          </span>
                        )
                      )}
                      {m.options && m.options.length > 0 && !busy && (
                        <div className="flex flex-wrap gap-2">
                          {m.options.map((o, i) => (
                            <button
                              key={`${m.id}-opt-${i}`}
                              onClick={() => onOption(o)}
                              className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300"
                            >
                              {o.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {busy && !streamingId && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {voice === "transcribing" ? t("assist.voiceTranscribing") : t("assist.thinking")}
            </div>
          </div>
        )}
      </div>

      {(lastChips?.length ?? 0) > 0 && !busy && (
        <div className="mt-2 flex flex-wrap gap-2">
          {lastChips!.map((c) => (
            <button
              key={c}
              onClick={() => onChip(c)}
              className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            >
              {t(`chip.${c}`)}
            </button>
          ))}
        </div>
      )}

      {voiceLabel && (
        <div className="mt-2 text-center text-xs font-semibold text-sky-600 dark:text-sky-400">{voiceLabel}</div>
      )}
      {micError && (
        <div className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-center text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          {micError}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-2 flex gap-2"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => {
            stopSpeech();
            setVoice("idle");
          }}
          placeholder={voice === "listening" ? t("assist.listening") : t("assist.placeholder")}
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <button
          type="button"
          onClick={toggleMic}
          disabled={!getRecognizerCtor()}
          title={voice === "listening" ? t("assist.stop") : micLang === "ar" ? t("assist.micLangAr") : t("assist.micLangEn")}
          aria-label={t("assist.listen")}
          className={`rounded-xl border px-3 py-2 text-sm transition-colors disabled:opacity-40 ${
            voice === "listening"
              ? "border-rose-400 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
              : "border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {voice === "listening" ? "⏹️" : "🎤"}
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setMicLangOverride(micLang === "en" ? "ar" : "en");
            }}
            className="ms-1 cursor-pointer rounded px-1 text-[10px] uppercase hover:bg-black/5 dark:hover:bg-white/10"
          >
            {micLang}
          </span>
        </button>
        {voice === "speaking" && (
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              setVoice("idle");
              setSpeakingId(null);
            }}
            title={t("assist.stop")}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            🔇
          </button>
        )}
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
        >
          {t("assist.send")}
        </button>
      </form>

      <div className="mt-2 text-center text-xs text-slate-400">
        {aiReady ? (
          t("assist.aiNote")
        ) : (
          <>
            {t("assist.offlineMode")} ·{" "}
            <Link href="/settings" className="underline hover:text-slate-500">
              {t("assist.settingsLink")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
