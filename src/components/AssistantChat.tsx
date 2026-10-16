"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import type { Rating } from "@/types";
import { ChatScreen } from "@/components/ui/ChatScreen";
import { VoiceScreen } from "@/components/ui/VoiceScreen";

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
  const router = useRouter();
  const [state, setState] = useState(newAssistantState());
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [voice, setVoice] = useState<VoiceState>("idle");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [micLangOverride, setMicLangOverride] = useState<"en" | "ar" | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [rated, setRated] = useState<Record<string, boolean>>({});
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
    if (speakingId === message.id) {
      stopSpeech();
      setSpeakingId(null);
      setVoice("idle");
      return;
    }
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
      setVoiceOpen(false);
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

  function handleMic() {
    if (variant === "page") setVoiceOpen(true);
    toggleMic();
  }

  function cancelVoice() {
    recRef.current?.stop();
    stopSpeech();
    setSpeakingId(null);
    setVoice("idle");
    setVoiceOpen(false);
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

  if (voiceOpen && variant === "page") {
    return <VoiceScreen state={voice} onCancel={cancelVoice} />;
  }

  return (
    <ChatScreen
      variant={variant}
      aiReady={aiReady}
      messages={state.messages}
      busy={busy}
      streamingId={streamingId}
      speakingId={speakingId}
      voice={voice}
      micError={micError}
      chips={lastChips}
      rated={rated}
      input={input}
      micLang={micLang}
      inputRef={inputRef}
      onInputChange={setInput}
      onSend={send}
      onMic={handleMic}
      onToggleMicLang={() => setMicLangOverride(micLang === "en" ? "ar" : "en")}
      onStopSpeech={() => {
        stopSpeech();
        setVoice("idle");
        setSpeakingId(null);
      }}
      onSpeak={speakMessage}
      onRate={(m, r) => {
        if (m.wordIds) rateWord(m.id, m.wordIds, r);
      }}
      onOption={onOption}
      onChip={onChip}
      onRetry={(m, forceLocal) => retry(m.id, m.error?.retryText ?? "", forceLocal)}
      onNewTopic={newTopic}
      onOpenSettings={() => router.push("/settings")}
    />
  );
}
