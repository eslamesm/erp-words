"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/hooks/useT";
import { useProgress } from "@/hooks/useProgress";
import type { AssistantMessage } from "@/lib/assistant";
import { newAssistantState } from "@/lib/assistant";
import { assistantReply } from "@/lib/assistantEngine";
import { useTodayKey } from "@/lib/today";

export function AssistantChat() {
  const { t, lang } = useT();
  const { profile } = useProgress();
  const today = useTodayKey();
  const [state, setState] = useState(() => newAssistantState());
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [state.messages, busy]);

  function send() {
    const msg = input.trim();
    if (!msg) return;
    setInput("");
    const userMsg: AssistantMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: msg,
      ts: Date.now(),
    };
    setState((s) => ({ ...s, messages: [...s.messages, userMsg] }));
    setBusy(true);
    setTimeout(() => {
      const reply = assistantReply(msg);
      const botMsg: AssistantMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: reply,
        ts: Date.now(),
      };
      setState((s) => ({ ...s, messages: [...s.messages, botMsg] }));
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
          <h1 className="text-2xl font-bold">{t("nav.assistant")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {lang === "en" ? "Your ERP English learning partner" : "مساعدك لتعلّم الإنجليزية المهنية في ERP"}
          </p>
        </div>
        <button
          onClick={newTopic}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {lang === "en" ? "New topic" : "موضوع جديد"}
        </button>
      </div>

      <div ref={listRef} className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {state.messages.length === 0 && (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400">
            <div className="text-4xl">🤖</div>
            <div className="mt-2 font-semibold">
              {lang === "en" ? "Ask me anything about ERP English" : "اسألني عن الإنجليزية المهنية في ERP"}
            </div>
            <div className="mt-1 text-sm">
              {lang === "en" ? "Try: Explain invoice, Today's lesson, Review weak words" : "جرّب: اشرح invoice، درس اليوم، مراجعة الكلمات الضعيفة"}
            </div>
            {profile && (
              <div className="mt-2 text-xs">
                {lang === "en" ? `Level: ${profile.level} • Date: ${today}` : `المستوى: ${profile.level} • التاريخ: ${today}`}
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
              {lang === "en" ? "Thinking..." : "يُفكّر..."}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lang === "en" ? "Type a message..." : "اكتب رسالتك..."}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
        >
          {lang === "en" ? "Send" : "إرسال"}
        </button>
      </form>

      <div className="text-center text-xs text-slate-400">
        {lang === "en" ? "Local assistant engine · Your data stays private" : "مساعد محلي · بياناتك تبقى خاصة"}
      </div>
    </div>
  );
}
