"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useT } from "@/hooks/useT";
import { useProgress } from "@/hooks/useProgress";
import type { AssistantChip, AssistantMessage } from "@/lib/assistant";
import { newAssistantState } from "@/lib/assistant";
import { assistantRespond, learnerSnapshot } from "@/lib/assistantEngine";
import { aiChat, isAiConfigured, readAiConfig, type AiChatMessage } from "@/lib/ai";
import { speak } from "@/lib/speech";
import { useTodayKey } from "@/lib/today";
import type { Rating } from "@/types";

interface Recognizer {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type RecognizerCtor = new () => Recognizer;

function newMessage(
  role: "user" | "assistant",
  content: string,
  extra?: { wordIds?: string[]; chips?: AssistantChip[] }
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

function englishOnly(text: string): string {
  return text
    .split("\n")
    .filter((line) => /[A-Za-z]{2,}/.test(line))
    .join("\n")
    .trim();
}

function buildSystemPrompt(lang: string, level: string, native: string) {
  const snap = learnerSnapshot();
  const lines = [
    "You are a specialized English tutor for ERP (Enterprise Resource Planning) professionals.",
    "Teach practical workplace English used in ERP modules: finance, purchasing, inventory, sales, HR, projects, IT, and customer support.",
    "Rules:",
    "- Adapt to the learner's CEFR level and keep answers concise and focused.",
    "- When the learner writes English, gently correct grammar/word-choice and show the improved version.",
    "- Give short, realistic ERP examples (emails, tickets, meetings, reports).",
    "- Never claim to verify real transactions or invent confidential data.",
    "- Do not request passwords, tokens, or other secrets.",
    "- Mirror the learner's language: reply mainly in the language they used, with English terms kept as-is.",
  ];
  lines.push(`Learner level: ${level}. Native language: ${native}.`);
  if (snap.lesson.length) lines.push(`Today's lesson words: ${snap.lesson.join(", ")}.`);
  if (snap.weak.length) lines.push(`Weak words to reinforce: ${snap.weak.join(", ")}.`);
  if (lang === "ar") lines.push("The learner prefers Arabic explanations, with English ERP terms.");
  return lines.join("\n");
}

const CHIP_PROMPT: Record<AssistantChip, { en: string; ar: string }> = {
  dailyLesson: { en: "Today's lesson", ar: "درس اليوم" },
  weak: { en: "Review weak words", ar: "مراجعة الكلمات الضعيفة" },
  random: { en: "Random word", ar: "كلمة عشوائية" },
  interview: { en: "Interview practice", ar: "تدريب مقابلة" },
  writeEmail: { en: "Write a professional email", ar: "اكتب بريدًا مهنيًا" },
  correct: { en: "Correct my sentence: ", ar: "صوّب جملتي: " },
};

export function AssistantChat() {
  const { t, lang } = useT();
  const { profile, settings, rate } = useProgress();
  const today = useTodayKey();
  const [state, setState] = useState(() => newAssistantState());
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [rated, setRated] = useState<Record<string, boolean>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<Recognizer | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setAiReady(isAiConfigured());
      setMicSupported(Boolean(getRecognizerCtor()));
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [state.messages, busy]);

  function push(message: AssistantMessage) {
    setState((s) => ({ ...s, messages: [...s.messages, message] }));
  }

  function speakMessage(content: string) {
    const text = englishOnly(content);
    if (text) speak(text, { rate: settings?.voiceRate ?? 0.95 });
  }

  function toggleMic() {
    const Ctor = getRecognizerCtor();
    if (!Ctor) return;
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) setInput((v) => (v ? `${v} ${transcript}` : transcript));
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  async function send(raw?: string) {
    const msg = (raw ?? input).trim();
    if (!msg) return;
    setInput("");
    push(newMessage("user", msg));
    setBusy(true);

    const cfg = readAiConfig();
    if (isAiConfigured(cfg)) {
      const history: AiChatMessage[] = [
        {
          role: "system",
          content: buildSystemPrompt(lang, profile?.level ?? "A2", profile?.nativeLanguage ?? "العربية"),
        },
        ...state.messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: msg },
      ];
      try {
        const reply = await aiChat(history, cfg);
        push(newMessage("assistant", reply));
        setBusy(false);
        return;
      } catch {
        push(newMessage("assistant", `${t("assist.aiError")}\n\n${assistantRespond(msg).text}`));
        setBusy(false);
        return;
      }
    }

    setTimeout(() => {
      const r = assistantRespond(msg);
      push(newMessage("assistant", r.text, { wordIds: r.wordIds, chips: r.chips }));
      setBusy(false);
    }, 150);
  }

  function onChip(chip: AssistantChip) {
    const prompt = CHIP_PROMPT[chip][lang === "en" ? "en" : "ar"];
    if (chip === "correct") {
      setInput(prompt);
      inputRef.current?.focus();
      return;
    }
    void send(prompt);
  }

  function rateWord(messageId: string, wordIds: string[], rating: Rating) {
    for (const id of wordIds) rate(id, rating);
    setRated((r) => ({ ...r, [messageId]: true }));
  }

  function newTopic() {
    setState(newAssistantState());
    setRated({});
  }

  const lastChips = state.messages.filter((m) => m.role === "assistant").slice(-1)[0]?.chips;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            {t("nav.assistant")}
            {aiReady && (
              <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold text-white">
                {t("assist.aiBadge")}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("assist.tagline")}</p>
        </div>
        <button
          onClick={newTopic}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {t("assist.newTopic")}
        </button>
      </div>

      <div
        ref={listRef}
        className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        {state.messages.length === 0 && (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400">
            <div className="text-4xl">🤖</div>
            <div className="mt-2 font-semibold">{t("assist.emptyTitle")}</div>
            <div className="mt-1 text-sm">{t("assist.emptyHint")}</div>
            {profile && (
              <div className="mt-2 text-xs">
                {t("assist.levelDate", { level: profile.level, date: today })}
              </div>
            )}
          </div>
        )}
        {state.messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "flex-col items-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                m.role === "user"
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              }`}
            >
              {m.content}
            </div>
            {m.role === "assistant" && (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => speakMessage(m.content)}
                  title={t("assist.speak")}
                  aria-label={t("assist.speak")}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  🔊
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
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {t("assist.thinking")}
            </div>
          </div>
        )}
      </div>

      {(lastChips?.length ?? 0) > 0 && !busy && (
        <div className="flex flex-wrap gap-2">
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="flex gap-2"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? t("assist.listening") : t("assist.placeholder")}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <button
          type="button"
          onClick={toggleMic}
          disabled={!micSupported}
          title={micSupported ? t("assist.listen") : t("assist.micUnsupported")}
          aria-label={t("assist.listen")}
          className={`rounded-xl border px-4 py-2.5 text-sm transition-colors disabled:opacity-40 ${
            listening
              ? "border-rose-400 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
              : "border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          🎤
        </button>
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
        >
          {t("assist.send")}
        </button>
      </form>

      <div className="text-center text-xs text-slate-400">
        {aiReady ? (
          t("assist.aiNote")
        ) : (
          <>
            {t("assist.localNote")} ·{" "}
            <Link href="/settings" className="underline hover:text-slate-500">
              {t("assist.settingsLink")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
