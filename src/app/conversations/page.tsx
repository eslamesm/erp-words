"use client";

import { useEffect, useRef, useState } from "react";
import type { Conversation } from "@/types";
import { CONVERSATIONS, CONVERSATION_EN } from "@/data/conversations";
import { useProgress } from "@/hooks/useProgress";
import { speak, stop } from "@/lib/speech";
import { LevelBadge } from "@/components/Badges";
import { useT } from "@/hooks/useT";

export default function ConversationsPage() {
  const { t, lang } = useT();
  const { conversations, toggleConversation, settings } = useProgress();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = CONVERSATIONS.find((c) => c.id === openId) ?? null;
  const done = (id: string) => conversations.includes(id);
  const doneCount = CONVERSATIONS.filter((c) => done(c.id)).length;
  const doneList = CONVERSATIONS.filter((c) => done(c.id));
  const cTitle = (id: string, fallback: string) => (lang === "en" ? CONVERSATION_EN[id]?.title ?? fallback : fallback);
  const cTopic = (id: string, fallback: string) => (lang === "en" ? CONVERSATION_EN[id]?.topic ?? fallback : fallback);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("conv.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("conv.subtitle")}</p>
      </div>

      {doneCount > 0 && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/40">
          <h2 className="font-bold text-emerald-800 dark:text-emerald-300">
            {t("conv.doneTitle", { done: doneCount, total: CONVERSATIONS.length })}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {doneList.map((c) => (
              <button
                key={c.id}
                onClick={() => setOpenId(c.id)}
                className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-emerald-950"
              >
                {c.icon} {cTitle(c.id, c.title)} ✓
              </button>
            ))}
          </div>
        </section>
      )}

      {open ? (
        <ConversationPlayer
          conv={open}
          completed={done(open.id)}
          rate={settings?.voiceRate ?? 0.95}
          onDone={() => toggleConversation(open.id)}
          onClose={() => setOpenId(null)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CONVERSATIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setOpenId(c.id)}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="text-3xl">{c.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-bold">
                  {cTitle(c.id, c.title)}
                  <LevelBadge level={c.level} />
                  {done(c.id) && <span className="text-xs text-emerald-600">✓</span>}
                </div>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">{cTopic(c.id, c.topic)}</div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {t("conv.minutesLines", { min: c.minutes, lines: c.lines.length })}
                </div>
              </div>
              <span className="text-slate-300 dark:text-slate-600">←</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ConversationPlayer({
  conv,
  completed,
  rate,
  onDone,
  onClose,
}: {
  conv: Conversation;
  completed: boolean;
  rate: number;
  onDone: () => void;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<number[]>([]);
  const { t, lang } = useT();
  const shownTitle = lang === "en" ? CONVERSATION_EN[conv.id]?.title ?? conv.title : conv.title;
  const shownTopic = lang === "en" ? CONVERSATION_EN[conv.id]?.topic ?? conv.topic : conv.topic;

  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }

  function playLine(i: number) {
    const line = conv.lines[i];
    if (!line) {
      setPlaying(false);
      setCurrent(null);
      return;
    }
    setCurrent(i);
    speak(line.en, {
      rate,
      onEnd: () => {
        const t = window.setTimeout(() => playLine(i + 1), 1800);
        timers.current.push(t);
      },
    });
  }

  function startAll() {
    stop();
    clearTimers();
    setPlaying(true);
    playLine(0);
  }

  function stopAll() {
    stop();
    clearTimers();
    setPlaying(false);
    setCurrent(null);
  }

  function playOne(i: number) {
    stop();
    clearTimers();
    setPlaying(false);
    setCurrent(i);
    speak(conv.lines[i].en, { rate });
  }

  useEffect(
    () => () => {
      stop();
      clearTimers();
    },
    []
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            {conv.icon} {shownTitle}
            <LevelBadge level={conv.level} />
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{shownTopic}</p>
        </div>
        <div className="flex items-center gap-2">
          {playing ? (
            <button
              onClick={stopAll}
              className="rounded-xl border-2 border-rose-400 px-4 py-2 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950"
            >
              {t("conv.stop")}
            </button>
          ) : (
            <button
              onClick={startAll}
              className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-2 text-sm font-bold text-white shadow"
            >
              {t("conv.playAll")}
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-xl border-2 border-slate-300 px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {conv.lines.map((line, i) => {
          const isCurrent = current === i;
          return (
            <div
              key={i}
              className={`rounded-2xl border-2 p-3 transition-colors ${
                isCurrent
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                  : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50"
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                    line.role === "A" ? "bg-indigo-500" : "bg-teal-500"
                  }`}
                >
                  {line.role}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold" dir="ltr">
                    {line.en}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{line.ar}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => playOne(i)}
                    aria-label={t("conv.listen")}
                    className="rounded-lg px-2 py-1 text-sm text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-950"
                  >
                    ▶️
                  </button>
                  <button
                    onClick={() => playOne(i)}
                    aria-label={t("conv.echo")}
                    className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    {t("conv.echo")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-400">{t("conv.suggested", { n: conv.minutes })}</p>
        <button
          onClick={onDone}
          className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-colors ${
            completed
              ? "bg-emerald-600 text-white"
              : "border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950"
          }`}
        >
          {completed ? t("conv.completed") : t("conv.markDone")}
        </button>
      </div>
    </section>
  );
}