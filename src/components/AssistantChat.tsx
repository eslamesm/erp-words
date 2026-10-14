"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useT } from "@/hooks/useT";
import { useProgress } from "@/hooks/useProgress";
import type { AssistantMessage } from "@/lib/assistant";
import { newAssistantState } from "@/lib/assistant";
import { assistantReply, learnerSnapshot } from "@/lib/assistantEngine";
import { aiChat, isAiConfigured, readAiConfig, type AiChatMessage } from "@/lib/ai";
import { useTodayKey } from "@/lib/today";

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

export function AssistantChat() {
  const { t, lang } = useT();
  const { profile } = useProgress();
  const today = useTodayKey();
  const [state, setState] = useState(() => newAssistantState());
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setAiReady(isAiConfigured()), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [state.messages, busy]);

  function push(message: AssistantMessage) {
    setState((s) => ({ ...s, messages: [...s.messages, message] }));
  }

  async function send() {
    const msg = input.trim();
    if (!msg) return;
    setInput("");
    push({ id: `u-${Date.now()}`, role: "user", content: msg, ts: Date.now() });
    setBusy(true);

    const cfg = readAiConfig();
    if (isAiConfigured(cfg)) {
      const history: AiChatMessage[] = [
        {
          role: "system",
          content: buildSystemPrompt(
            lang,
            profile?.level ?? "A2",
            profile?.nativeLanguage ?? "العربية"
          ),
        },
        ...state.messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: msg },
      ];
      try {
        const reply = await aiChat(history, cfg);
        push({ id: `a-${Date.now()}`, role: "assistant", content: reply, ts: Date.now() });
        setBusy(false);
        return;
      } catch {
        push({
          id: `a-${Date.now()}`,
          role: "assistant",
          content: `${t("assist.aiError")}\n\n${assistantReply(msg)}`,
          ts: Date.now(),
        });
        setBusy(false);
        return;
      }
    }

    setTimeout(() => {
      push({ id: `a-${Date.now()}`, role: "assistant", content: assistantReply(msg), ts: Date.now() });
      setBusy(false);
    }, 200);
  }

  function newTopic() {
    setState(newAssistantState());
  }

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
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                m.role === "user"
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              }`}
            >
              {m.content}
            </div>
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("assist.placeholder")}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
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
