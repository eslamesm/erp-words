"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { Rating, Word } from "@/types";
import { speak, speakWords, stop } from "@/lib/speech";
import { romanize } from "@/lib/roman";
import { LevelBadge, ModuleBadge, PoS } from "@/components/Badges";
import { useT } from "@/hooks/useT";

interface Props {
  word: Word;
  onRate: (rating: Rating) => void;
  autoPlay: boolean;
  showTranslation: boolean;
  voiceRate: number;
  note?: string;
  onSaveNote?: (text: string) => void;
}

const RATINGS: { key: string; rating: Rating; className: string }[] = [
  { key: "flash.again", rating: "again", className: "bg-rose-600 hover:bg-rose-700" },
  { key: "flash.hard", rating: "hard", className: "bg-amber-500 hover:bg-amber-600" },
  { key: "flash.good", rating: "good", className: "bg-emerald-500 hover:bg-emerald-600" },
  { key: "flash.easy", rating: "easy", className: "bg-sky-500 hover:bg-sky-600" },
];

export function Flashcard({ word, onRate, autoPlay, showTranslation, voiceRate, note = "", onSaveNote }: Props) {
  const { t } = useT();
  const [flipped, setFlipped] = useState(false);
  const [activeEx, setActiveEx] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState(note);
  const timerRef = useRef<number | null>(null);
  const lastSwipeAt = useRef(0);
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    if (autoPlay) {
      const t = setTimeout(() => speak(word.english, { rate: voiceRate }), 250);
      return () => {
        clearTimeout(t);
        stop();
      };
    }
  }, [word.id, autoPlay, word.english, voiceRate]);

  useEffect(
    () => () => {
      stop();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    []
  );

  const examples = word.examples.slice(0, 2);
  const synonyms = word.synonyms ?? [];
  const slow = Math.min(1, voiceRate * 0.7);

  function playExamples(rate = voiceRate) {
    if (!examples.length) return;
    let i = 0;
    const next = () => {
      if (i >= examples.length) {
        setActiveEx(null);
        return;
      }
      const idx = i++;
      setActiveEx(idx);
      speak(examples[idx], { rate, onEnd: next });
    };
    next();
  }

  // وضع الترديد: نطق بطيء ثم مهلة قصيرة ثم إعادة النطق (قلّد ورائي).
  function slowRepeat() {
    speak(word.english, {
      rate: slow,
      onEnd: () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => speak(word.english, { rate: slow }), 1200);
      },
    });
  }

  function onCardClick() {
    if (Date.now() - lastSwipeAt.current < 500) return;
    setFlipped((f) => !f);
  }

  function onTouchStart(e: PointerEvent<HTMLDivElement>) {
    touchStart.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  }

  function onTouchEnd(e: PointerEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || !flipped) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    lastSwipeAt.current = Date.now();
    // سحب نحو اليمين = نسيته، نحو اليسار = جيد
    if (dx > 0) onRate("again");
    else onRate("good");
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onClick={onCardClick}
        onPointerDown={onTouchStart}
        onPointerUp={onTouchEnd}
        className="flex min-h-[280px] w-full cursor-pointer touch-pan-y flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-transform hover:scale-[1.01] dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <ModuleBadge moduleId={word.module} />
          <LevelBadge level={word.level} />
        </div>

        {!flipped ? (
          <>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white" dir="ltr">
              {word.english}
            </h2>
            {word.pronunciation && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400" dir="ltr">
                {word.pronunciation}
              </p>
            )}
            <div className="mt-3">
              <PoS pos={word.partOfSpeech} />
            </div>
            {note && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-1 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                {t("flash.hasNote")}
              </p>
            )}
            <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">{t("flash.tapHint")}</p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white" dir="ltr">
              {word.english}
            </h2>
            {showTranslation && (
              <p className="mt-3 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{word.arabic}</p>
            )}
            {showTranslation && word.arabic && (
              <p className="mt-1 text-sm text-slate-400" dir="ltr">
                {romanize(word.arabic)}
              </p>
            )}
            {word.definitionEn && (
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300" dir="ltr">
                {word.definitionEn}
              </p>
            )}
            {word.definitionAr && (
              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                {word.definitionAr}
              </p>
            )}
            {word.note && (
              <p className="mt-2 max-w-md rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                💡 {word.note}
              </p>
            )}
            {examples.length > 0 && (
              <div className="mt-4 flex max-w-md flex-col gap-2 text-right">
                {examples.map((ex, i) => (
                  <div
                    key={ex}
                    className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      activeEx === i
                        ? "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/60"
                        : "border-transparent bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-right">
                      <span className="text-slate-700 dark:text-slate-200" dir="ltr">
                        {ex}
                      </span>
                      {word.examplesAr?.[i] && (
                        <span className="text-xs text-emerald-700 dark:text-emerald-300">
                          {word.examplesAr[i]}
                        </span>
                      )}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeEx === i) {
                          stop();
                          setActiveEx(null);
                        } else {
                          setActiveEx(i);
                          speak(ex, { rate: voiceRate, onEnd: () => setActiveEx(null) });
                        }
                      }}
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs transition-colors ${
                        activeEx === i
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      }`}
                    >
                      {activeEx === i ? "⏹" : "🔊"}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {word.synonyms && word.synonyms.length > 0 && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {t("flash.synonymsInline")} <span dir="ltr">{word.synonyms.join("، ")}</span>
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => speak(word.english, { rate: voiceRate })}
          className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("flash.listen")}
        </button>
        <button
          onClick={slowRepeat}
          className="rounded-full border border-amber-300 px-5 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950"
        >
          {t("flash.repeat")}
        </button>
        <button
          onClick={() => speak(word.english, { rate: Math.min(1, voiceRate * 0.8) })}
          className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("flash.slower")}
        </button>
        {synonyms.length > 0 && (
          <button
            onClick={() => speakWords(synonyms.slice(0, 3), { rate: voiceRate })}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("flash.synonymsBtn")}
          </button>
        )}
        {examples.length > 0 && (
          <button
            onClick={() => playExamples()}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("flash.sentences")}
          </button>
        )}
        {examples.length > 0 && (
          <button
            onClick={() => playExamples(slow)}
            className="rounded-full border border-amber-300 px-5 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950"
          >
            {t("flash.sentencesSlow")}
          </button>
        )}
      </div>

      {onSaveNote && flipped && (
        <div className="w-full rounded-2xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900 dark:bg-amber-950/30">
          <label className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
            {t("flash.noteLabel")}
          </label>
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            onBlur={() => onSaveNote(noteDraft)}
            rows={2}
            placeholder={t("flash.notePlaceholder")}
            className="mt-2 w-full resize-none rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-amber-400 dark:border-amber-900 dark:bg-slate-900 dark:text-white"
          />
        </div>
      )}

      {flipped ? (
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {RATINGS.map((r) => (
            <button
              key={r.rating}
              onClick={() => onRate(r.rating)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 ${r.className}`}
            >
              {t(r.key)}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-2xl" aria-hidden>
          ✓
        </p>
      )}
    </div>
  );
}