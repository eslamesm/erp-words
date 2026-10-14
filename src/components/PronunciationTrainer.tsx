"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { speak, stop } from "@/lib/speech";
import {
  isSpeechRecognitionSupported,
  startListening,
  stopListening,
} from "@/lib/recognition";
import { scorePronunciation, type PronunciationResult, type WordStatus } from "@/lib/pronunciation";
import { useT } from "@/hooks/useT";
import { useSwipeNav } from "@/hooks/useSwipeNav";

export interface PronounceItem {
  id: string;
  text: string;
  translation?: string;
  hint?: string;
}

interface Props {
  items: PronounceItem[];
  voiceRate: number;
  threshold?: number;
  onResult: (itemId: string, score: number, passed: boolean) => void;
  onFinish: (result: { correct: number; total: number }) => void;
}

function wordClass(status: WordStatus): string {
  if (status === "good") return "text-emerald-600 dark:text-emerald-400";
  if (status === "close") return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export function PronunciationTrainer({
  items,
  voiceRate,
  threshold = 80,
  onResult,
  onFinish,
}: Props) {
  const { t } = useT();
  const list = useMemo(() => items, [items]);
  const [index, setIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [counted, setCounted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const voiceSupported = isSpeechRecognitionSupported();
  const current = list[index];

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => speak(current.text, { rate: voiceRate }), 350);
    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [current, voiceRate]);

  useEffect(
    () => () => {
      stop();
      stopListening();
    },
    []
  );

  const evaluate = useCallback(
    (text: string) => {
      if (!current) return;
      const res = scorePronunciation(current.text, text, threshold);
      setResult(res);
      setTranscript(text);
      onResult(current.id, res.score, res.passed);
      if (res.passed && !counted) {
        setCounted(true);
        setScore((s) => s + 1);
      }
    },
    [current, threshold, onResult, counted]
  );

  const swipe = useSwipeNav({
    enabled: result !== null,
    onNext: () => next(),
    onPrev: () => goPrev(),
  });

  if (!current) return null;

  function startMic() {
    setMicError(null);
    setTranscript("");
    setResult(null);
    setListening(true);
    startListening({
      lang: "en-US",
      onTranscript: (text, final) => {
        if (final) {
          setListening(false);
          evaluate(text.trim());
        } else {
          setTranscript(text.trim());
        }
      },
      onError: (err) => {
        setListening(false);
        setMicError(err === "unsupported" ? t("pronounce.unsupported") : t("pronounce.micError"));
      },
      onEnd: () => setListening(false),
    });
  }

  function retry() {
    stopListening();
    setResult(null);
    setTranscript("");
    setListening(false);
    setMicError(null);
  }

  function next() {
    stopListening();
    if (index + 1 < list.length) {
      setIndex((i) => i + 1);
      setResult(null);
      setTranscript("");
      setListening(false);
      setCounted(false);
      setMicError(null);
    } else {
      setFinished(true);
      onFinish({ correct: score, total: list.length });
    }
  }

  function goPrev() {
    stopListening();
    if (index > 0) {
      setIndex((i) => i - 1);
      setResult(null);
      setTranscript("");
      setListening(false);
      setCounted(false);
      setMicError(null);
    }
  }

  if (finished) {
    const pct = Math.round((score / Math.max(1, list.length)) * 100);
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="text-6xl">{pct >= 80 ? "🗣️" : "💪"}</div>
        <h2 className="text-2xl font-bold">{t("pronounce.done")}</h2>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          {t("pronounce.summary", { correct: score, total: list.length })} ({pct}%)
        </p>
        <button
          onClick={() => {
            setIndex(0);
            setScore(0);
            setResult(null);
            setTranscript("");
            setListening(false);
            setCounted(false);
            setMicError(null);
            setFinished(false);
          }}
          className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {t("pronounce.restart")}
        </button>
      </div>
    );
  }

  return (
    <div {...swipe} className="flex touch-pan-y flex-col gap-5">
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>{t("pronounce.item", { n: index + 1, total: list.length })}</span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {t("pronounce.scoreLabel", { n: score })}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${((index + (result ? 1 : 0)) / list.length) * 100}%` }}
        />
      </div>

      <div
        className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("pronounce.legend")}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1" dir="ltr">
          {result
            ? result.words.map((w, i) => (
                <span key={`${w.expected}-${i}`} className={`text-2xl font-bold ${wordClass(w.status)}`}>
                  {w.expected}
                </span>
              ))
            : current.text.split(/\s+/).map((w, i) => (
                <span key={`${w}-${i}`} className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {w}
                </span>
              ))}
        </div>
        {current.translation && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{current.translation}</p>
        )}
        {current.hint && (
          <p className="mt-1 text-xs text-slate-400" dir="ltr">
            /{current.hint}/
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => speak(current.text, { rate: voiceRate })}
            className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-3 text-white shadow transition-transform hover:scale-105"
          >
            {t("pronounce.listen")}
          </button>
          <button
            onClick={() => speak(current.text, { rate: Math.min(1, voiceRate * 0.75) })}
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("pronounce.slower")}
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={listening ? stopListening : startMic}
            disabled={!voiceSupported}
            className={`rounded-full px-8 py-3 text-lg font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
              listening
                ? "animate-pulse bg-rose-600 text-white"
                : "border-2 border-rose-400 text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950"
            }`}
          >
            {listening ? t("pronounce.stop") : t("pronounce.speak")}
          </button>
          <div
            dir="ltr"
            className={`mt-4 min-h-[3.5rem] rounded-xl border-2 px-4 py-3 text-center text-lg transition-colors ${
              transcript
                ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100"
                : "border-dashed border-slate-300 text-slate-400 dark:border-slate-700"
            }`}
          >
            {transcript || (listening ? t("pronounce.listening") : t("pronounce.placeholder"))}
          </div>
          {micError && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{micError}</p>}
          {!voiceSupported && (
            <p className="mt-2 text-xs text-slate-400">{t("pronounce.unsupported")}</p>
          )}
        </div>

        {result && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              result.passed
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : result.score >= 60
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
            }`}
          >
            <div className="text-lg font-bold">{t("pronounce.result", { score: result.score })}</div>
            <div className="font-semibold">
              {result.passed
                ? t("pronounce.pass")
                : result.score >= 60
                  ? t("pronounce.near")
                  : t("pronounce.fail")}
            </div>
          </div>
        )}
      </div>

      {result && (
        <p className="text-center text-xs text-slate-400">{t("common.swipeNext")}</p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {result && !result.passed && (
          <button
            onClick={retry}
            className="rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("pronounce.tryAgain")}
          </button>
        )}
        <button
          onClick={next}
          disabled={!result}
          className="rounded-xl bg-slate-900 px-8 py-3 font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {index + 1 < list.length ? t("pronounce.next") : t("pronounce.finish")}
        </button>
      </div>
    </div>
  );
}
